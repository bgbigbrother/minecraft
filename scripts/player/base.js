import { Vector3, Vector2, PerspectiveCamera, CameraHelper, Raycaster, Group, Mesh, CylinderGeometry, MeshBasicMaterial, MeshStandardMaterial, BoxGeometry, Euler, Matrix4, Fog } from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { blocks } from '../textures/blocks.js';
import { simpleCharacter } from './body/simple'

/**
 * Base player class
 * Handles player physics, camera, movement, and block interaction
 */
export class PlayerBase {
    // Player collision cylinder dimensions
    height = 2; // Player height in blocks
    radius = 0.5; // Player radius for collision detection
    
    // Movement parameters
    maxSpeed = 5; // Maximum walking speed
    jumpSpeed = 10; // Initial jump velocity
    sprinting = false; // Whether player is currently sprinting
    onGround = false; // Whether player is touching the ground

    // Movement vectors
    input = new Vector3(); // Input direction from keyboard
    velocity = new Vector3(); // Current velocity in camera space
    #worldVelocity = new Vector3(); // Velocity in world space (private)
    
    // Camera and controls
    camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    cameraHelper = new CameraHelper(this.camera); // Visual helper for camera frustum
    controls = new PointerLockControls(this.camera, document.body); // First-person controls
    debugCamera = false; // Whether debug camera mode is active

    // Block selection and interaction
    raycaster = new Raycaster(new Vector3(), new Vector3(), 0, 3); // Ray for block selection (max distance: 3)
    selectedCoords = null; // World coordinates of currently selected block
    activeBlockId = blocks.empty.id; // Currently selected block type (0 = pickaxe/destroy mode)
    center_screen = new Vector2(); // Center of screen for raycasting (0, 0)

    // Player character model (visible in third-person view)
    character = new Group();

    /**
     * Tool/item system
     * Manages the player's held tool and its animation
     */
    tool = {
        container: new Group(), // Group that contains the tool mesh
        animate: false, // Whether the tool is currently animating
        animationStart: 0, // Timestamp when animation started
        animationSpeed: 0.025, // Speed of tool swing animation
        animation: null // Reference to animation timeout
    }
    /**
     * Initializes the player
     * Sets up camera, collision helpers, and selection visualization
     */
    constructor() {
        // Attach tool container to camera so it moves with player view
        this.camera.add(this.tool.container);
        this.cameraHelper.visible = false; // Hide camera helper by default

        // Configure raycaster to only interact with solid blocks (layer 0)
        // This prevents selecting water blocks which are on layer 1
        this.raycaster.layers.set(0);
        this.camera.layers.enable(1); // Enable layer 1 rendering for player character

        // Create simple blocky character model for third-person view
        this.character = new simpleCharacter();

        // Create wireframe cylinder to visualize player collision bounds
        this.boundsHelper = new Mesh(
            new CylinderGeometry(this.radius, this.radius, this.height, 16),
            new MeshBasicMaterial({ wireframe: true })
        );
        this.boundsHelper.visible = false; // Hidden by default (toggle with UI)

        // Create semi-transparent cube to highlight selected block
        const selectionMaterial = new MeshBasicMaterial({
            transparent: true,
            opacity: 0.3,
            color: 0xffffaa // Light yellow
        });
        const selectionGeometry = new BoxGeometry(1.01, 1.01, 1.01); // Slightly larger than block
        this.selectionHelper = new Mesh(selectionGeometry, selectionMaterial);
    }

    /**
     * Returns the velocity of the player in world coordinates
     * Converts camera-relative velocity to world-space velocity
     * @returns {THREE.Vector3} Velocity in world coordinates
     */
    get worldVelocity() {
        this.#worldVelocity.copy(this.velocity);
        // Rotate velocity by camera's Y rotation to get world-space direction
        this.#worldVelocity.applyEuler(new Euler(0, this.camera.rotation.y, 0));
        return this.#worldVelocity;
    }

    /**
     * Returns the current world position of the player
     * Player position is the same as camera position
     * @returns {THREE.Vector3} Player position in world coordinates
     */
    get position() {
        return this.camera.position;
    }

    /**
     * Updates the scene fog based on player position
     * Creates underwater effect when player is below water level
     */
    updateSceneFog() {
        if(this.scene) {
            // Check if player is underwater
            if(this.position.y < this.world.params.terrain.waterOffset + 0.4) {
                // Apply blue underwater fog with short distance
                this.scene.fog = new Fog(0x3030f2, 0, 15);
            } else if (this.scene.fog) {
                // Player is above water, use normal sky fog
                this.scene.fog = new Fog(0x80a0e0, 50, 75);
            }
        }
    }

    /**
     * Updates the position of the player's bounding cylinder helper
     * Also updates character model position for third-person view
     */
    updateBoundsHelper() {
        // Position collision cylinder at player's feet
        this.boundsHelper.position.copy(this.camera.position);
        this.boundsHelper.position.y -= this.height / 2; // Center cylinder at player center
        
        // Position character model slightly below collision bounds
        this.character.position.copy(this.boundsHelper.position);
        this.character.position.y -= this.height / 4;
        
        // In first-person mode, hide character and show tool
        this.character.visible = false;
        this.tool.container.visible = true;
    }

    /**
     * Updates the raycaster used for block selection
     * Casts a ray from camera center to find which block player is looking at
     * @param {World} world - The world object to raycast against
     */
    updateRaycaster(world) {
        // Cast ray from center of screen through camera
        this.raycaster.setFromCamera(this.center_screen, this.camera);
        const intersections = this.raycaster.intersectObject(world, true);

        if (intersections.length > 0) {
            const intersection = intersections[0];

            // Get the chunk containing the selected block
            const chunk = intersection.object.parent;

            // Get the transformation matrix for the specific block instance
            let blockMatrix = new Matrix4();
            if(intersection.object.bindMatrix) {
                // For non-instanced meshes
                blockMatrix = intersection.object.bindMatrix
            } else {
                // For instanced meshes, get matrix for specific instance
                intersection.object.getMatrixAt(intersection.instanceId, blockMatrix);
            }
            
            // Calculate world coordinates of the selected block
            // Start with chunk position, then apply block's local transform
            this.selectedCoords = chunk.position.clone();
            this.selectedCoords.applyMatrix4(blockMatrix);

            // If placing a block (not destroying), offset by face normal
            if (this.activeBlockId !== blocks.empty.id) {
                // Move selection 1 block in the direction of the intersected face
                // This places the new block adjacent to the selected block
                this.selectedCoords.add(intersection.normal);
            }

            // Update selection helper visualization
            this.selectionHelper.position.copy(this.selectedCoords);
            this.selectionHelper.visible = true;
        } else {
            // No block selected
            this.selectedCoords = null;
            this.selectionHelper.visible = false;
        }
    }

    /**
     * Applies player input to update position and velocity
     * @param {Number} dt - Delta time in seconds since last frame
     */
    applyInputs(dt) {
        // Only process input when pointer is locked (first-person mode active)
        if (this.controls.isLocked === true) {
            // Determine speed multiplier: 3x for sprint mode, 1.5x for shift sprint, 1x for normal
            const speedMultiplier = this.sprintMode ? 3 : (this.sprinting ? 1.5 : 1);
            
            // Apply sprint multiplier to horizontal velocity
            this.velocity.x = this.input.x * speedMultiplier;
            this.velocity.z = this.input.z * speedMultiplier;
            
            // Move player based on camera direction
            this.controls.moveRight(this.velocity.x * dt);
            this.controls.moveForward(this.velocity.z * dt);
            
            // Apply vertical velocity (gravity/jumping)
            this.position.y += this.velocity.y * dt;

            // Prevent falling through the world
            if (this.position.y < 0) {
                this.position.y = 0;
                this.velocity.y = 0;
            }
        }

        // Update position display in UI
        document.getElementById('info-player-position').innerHTML = this.toString();
    }

    /**
     * Applies a velocity change in world coordinates
     * Converts world-space velocity delta to camera-space and adds to current velocity
     * Used by physics system for collision response
     * @param {THREE.Vector3} dv - Velocity change in world coordinates
     */
    applyWorldDeltaVelocity(dv) {
        // Rotate velocity delta from world space to camera space
        dv.applyEuler(new Euler(0, -this.camera.rotation.y, 0));
        this.velocity.add(dv);
    }

    /**
     * Returns player position as a formatted string
     * @returns {string} Position string like "X: 12.345 Y: 67.890 Z: 23.456"
     */
    toString() {
        let str = '';
        str += `X: ${this.position.x.toFixed(3)} `;
        str += `Y: ${this.position.y.toFixed(3)} `;
        str += `Z: ${this.position.z.toFixed(3)}`;
        return str;
    }
}