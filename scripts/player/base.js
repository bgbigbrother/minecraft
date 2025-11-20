import { Vector3, Vector2, PerspectiveCamera, CameraHelper, Raycaster, Group, Mesh, CylinderGeometry, MeshBasicMaterial, MeshStandardMaterial, BoxGeometry, Euler, Matrix4, Fog } from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { blocks } from '../textures/blocks.js';
import { simpleCharacter } from './body/simple';
import { LandingSoundGenerator } from '../audio/landingSoundGenerator.js';

/**
 * Base player class
 * Handles player physics, camera, movement, and block interaction
 */
export class PlayerBase {
    // Player collision cylinder dimensions
    height = 2; // Player height in blocks
    radius = 0.5; // Player radius for collision detection
    
    // Health system
    maxHealth = 100; // Maximum health (configurable)
    health = 100; // Current health
    
    // Fall damage tracking
    fallStartY = null; // Y position where current fall started (null when not falling)
    isFalling = false; // Whether player is currently in a falling state
    gameStartTime = null; // Timestamp when pointer controls were first locked (for immunity)
    spawnImmunityDuration = 5000; // 5 seconds in milliseconds
    damagePerBlock = 0.05; // 5% damage per block after the 3rd one
    
    // Movement parameters
    maxSpeed = 5; // Maximum walking speed
    jumpSpeed = 10; // Initial jump velocity
    sprinting = false; // Whether player is currently sprinting
    onGround = false; // Whether player is touching the ground
    inWater = false; // Whether player is currently in water
    waterSpeedMultiplier = 1.0; // Smooth transition multiplier for water speed (1.0 = normal, 0.5 = in water)

    // Movement vectors
    input = new Vector3(); // Input direction from keyboard (x, y, z where y is vertical for swimming)
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
        
        // Initialize landing sound generator
        this.landingSoundGenerator = new LandingSoundGenerator();
        
        // Initialize fall damage tracking
        this.initializeFallDamage();
        
        // Initialize health bar UI
        setTimeout(() => this.updateHealthBar(), 0);

        document.removeEventListener('game:controls:lock', this.initializeFallDamage);
        document.addEventListener('game:controls:lock', this.initializeFallDamage);
    }

    /**
     * Initializes fall damage tracking system
     * Sets initial fall state (gameStartTime will be set on first pointer lock)
     */
    initializeFallDamage = () => {
        this.gameStartTime = null;
        this.fallStartY = null;
        this.isFalling = false;
        this.healthRegenRate = 0.01; // 1% per minute
    }

    /**
     * Updates fall damage tracking and applies damage when player lands
     * @param {Number} dt - Delta time in seconds since last frame
     */
    updateFallDamage(dt) {
        // Record game start time on first pointer lock
        if (this.controls.isLocked && this.gameStartTime === null) {
            this.gameStartTime = performance.now();
        }
        
        // Check spawn immunity (only if game has started)
        let hasSpawnImmunity = false;
        if (this.gameStartTime !== null) {
            const timeSinceGameStart = performance.now() - this.gameStartTime;
            hasSpawnImmunity = timeSinceGameStart < this.spawnImmunityDuration;
        }
        
        // Detect fall start: moving down and not on ground
        if (this.velocity.y < 0 && !this.onGround) {
            if (!this.isFalling) {
                // Start of new fall
                this.isFalling = true;
                this.fallStartY = this.position.y;
            } else {
                // Continue tracking highest point during fall
                this.fallStartY = Math.max(this.fallStartY, this.position.y);
            }
        }
        
        // Detect landing: was falling and now on ground
        if (this.isFalling && this.onGround) {
            // Calculate fall distance
            const fallDistance = this.fallStartY - this.position.y;
            
            // Play landing sound for any fall (volume based on distance)
            this.playLandingSound(fallDistance);
            
            // Apply damage if fall exceeds safe height and no spawn immunity
            if (fallDistance > 3 && !hasSpawnImmunity) {
                const blocksAboveThreshold = fallDistance - 3;
                const damageAmount = blocksAboveThreshold * (this.maxHealth * this.damagePerBlock); // 1% per block
                this.takeDamage(damageAmount);
            }
            
            // Reset fall tracking
            this.isFalling = false;
            this.fallStartY = null;
        }
        
        // Reset fall tracking if moving upward (jumping, swimming up)
        if (this.velocity.y > 0) {
            this.isFalling = false;
            this.fallStartY = null;
        }
        
        // Apply health regeneration
        this.updateHealthRegeneration(dt);
    }

    /**
     * Updates health regeneration over time
     * @param {Number} dt - Delta time in seconds since last frame
     */
    updateHealthRegeneration(dt) {
        // Only regenerate if health is below maximum and controls are active
        if (this.health < this.maxHealth && this.controls.isLocked) {
            // Calculate regeneration amount
            // healthRegenRate is % per minute, dt is in seconds
            // Convert: (rate / 60) * dt gives regeneration per frame
            const regenAmount = (this.healthRegenRate * this.maxHealth / 60) * dt;
            
            // Apply regeneration without exceeding max health
            this.health = Math.min(this.maxHealth, this.health + regenAmount);
            
            // Update health bar
            this.updateHealthBar();
        }
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

            // Only process block selection for instanced meshes (chunks)
            // Skip other objects like dropped items
            if (!intersection.object.isInstancedMesh) {
                this.selectedCoords = null;
                this.selectionHelper.visible = false;
                return;
            }

            // Get the chunk containing the selected block
            const chunk = intersection.object.parent;

            // Get the transformation matrix for the specific block instance
            let blockMatrix = new Matrix4();
            intersection.object.getMatrixAt(intersection.instanceId, blockMatrix);
            
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
            // Smooth water speed transition over 0.1 seconds
            const targetWaterMultiplier = this.inWater ? 0.5 : 1.0;
            const lerpFactor = Math.min(dt / 0.1, 1.0); // Transition over 0.1 seconds
            this.waterSpeedMultiplier += (targetWaterMultiplier - this.waterSpeedMultiplier) * lerpFactor;
            
            // Determine speed multiplier: 3x for sprint mode, 1.5x for shift sprint, 1x for normal
            const sprintMultiplier = this.sprintMode ? 3 : (this.sprinting ? 1.5 : 1);
            
            // Combined speed multiplier with smooth water transition
            const speedMultiplier = sprintMultiplier * this.waterSpeedMultiplier;
            
            // Apply speed multiplier to horizontal velocity
            this.velocity.x = this.input.x * speedMultiplier;
            this.velocity.z = this.input.z * speedMultiplier;
            
            // Move player based on camera direction
            this.controls.moveRight(this.velocity.x * dt);
            this.controls.moveForward(this.velocity.z * dt);
            
            // Swimming: Allow vertical movement when in water
            if (this.inWater) {
                // Space key for swimming up
                if (this.input.y > 0) {
                    this.velocity.y = this.maxSpeed * this.waterSpeedMultiplier;
                }
                // Shift key for swimming down
                else if (this.input.y < 0) {
                    this.velocity.y = -this.maxSpeed * this.waterSpeedMultiplier;
                }
                // Neutral buoyancy when no vertical input
                else {
                    this.velocity.y *= 0.9; // Dampen vertical velocity
                }
            }
            
            // Apply vertical velocity (gravity/jumping when not in water)
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
     * Plays landing sound when player hits the ground
     * Volume scales with fall distance for more realistic feedback
     * @param {number} fallDistance - Distance fallen in blocks
     */
    playLandingSound(fallDistance) {
        if (fallDistance > 3) { // Only play for falls > 0.5 blocks
            // Scale volume based on fall distance (0.2 to 1.0)
            // Short falls are quieter, long falls are louder
            const volume = Math.min(1.0, (fallDistance / 10));
            
            // Play procedurally generated landing sound
            this.landingSoundGenerator.play(volume);
        }
    }

    /**
     * Damages the player by a specified amount
     * @param {number} amount - Amount of damage to apply
     */
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.updateHealthBar();
    }

    /**
     * Heals the player by a specified amount
     * @param {number} amount - Amount of health to restore
     */
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.updateHealthBar();
    }

    /**
     * Sets the player's health to a specific value
     * @param {number} value - New health value
     */
    setHealth(value) {
        this.health = Math.max(0, Math.min(this.maxHealth, value));
        this.updateHealthBar();
    }

    /**
     * Updates the health bar UI to reflect current health
     */
    updateHealthBar() {
        const healthBar = document.getElementById('health-bar-fill');
        if (healthBar) {
            const healthPercent = (this.health / this.maxHealth) * 100;
            healthBar.style.width = `${healthPercent}%`;
            
            // Update color based on health percentagew
            if (healthPercent >= 70) {
                // Green gradient for 70-100%
                healthBar.style.background = 'linear-gradient(to bottom, #126c12ff, #083808ff)';
            } else if (healthPercent >= 30) {
                // Yellow gradient for 30-70%
                healthBar.style.background = 'linear-gradient(to bottom, #e2e251ff, #4a4a0bff)';
            } else {
                // Red gradient for 0-30%
                healthBar.style.background = 'linear-gradient(to bottom, #ff4444, #cc0000)';
            }
        }
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