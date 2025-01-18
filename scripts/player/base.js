import { Vector3, Vector2, PerspectiveCamera, CameraHelper, Raycaster, Group, Mesh, CylinderGeometry, MeshBasicMaterial, BoxGeometry, Euler, Matrix4, Fog } from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { blocks } from '../textures/blocks.js';

export class PlayerBase {
    height = 1.75;
    radius = 0.5;
    maxSpeed = 5;

    jumpSpeed = 10;
    sprinting = false;
    onGround = false;

    input = new Vector3();
    velocity = new Vector3();
    #worldVelocity = new Vector3();
    center_screen = new Vector2();

    camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
    cameraHelper = new CameraHelper(this.camera);
    controls = new PointerLockControls(this.camera, document.body);
    debugCamera = false;

    raycaster = new Raycaster(new Vector3(), new Vector3(), 0, 3);
    selectedCoords = null;
    activeBlockId = blocks.empty.id;

    center_screen = new Vector2();

    tool = {
        // Group that will contain the tool mesh
        container: new Group(),
        // Whether or not the tool is currently animating
        animate: false,
        // The time the animation was started
        animationStart: 0,
        // The rotation speed of the tool
        animationSpeed: 0.025,
        // Reference to the current animation
        animation: null
    }
    constructor() {
        // The tool is parented to the camera
        this.camera.add(this.tool.container);
        this.cameraHelper.visible = false;

        // Set raycaster to use layer 0 so it doesn't interact with water mesh on layer 1
        this.raycaster.layers.set(0);
        this.camera.layers.enable(1);

        // Wireframe mesh visualizing the player's bounding cylinder
        this.boundsHelper = new Mesh(
            new CylinderGeometry(this.radius, this.radius, this.height, 16),
            new MeshBasicMaterial({ wireframe: true })
        );
        this.boundsHelper.visible = false;

        // Helper used to highlight the currently active block
        const selectionMaterial = new MeshBasicMaterial({
            transparent: true,
            opacity: 0.3,
            color: 0xffffaa
        });
        const selectionGeometry = new BoxGeometry(1.01, 1.01, 1.01);
        this.selectionHelper = new Mesh(selectionGeometry, selectionMaterial);
    }

    /**
     * Returns the velocity of the player in world coordinates
     * @returns {THREE.Vector3}
     */
    get worldVelocity() {
        this.#worldVelocity.copy(this.velocity);
        this.#worldVelocity.applyEuler(new Euler(0, this.camera.rotation.y, 0));
        return this.#worldVelocity;
    }

    /**
     * Returns the current world position of the player
     * @returns {THREE.Vector3}
     */
    get position() {
        return this.camera.position;
    }

    /**
     * Updates the scene fog if the player is on a plane
     */
    updateSceneFog() {
        if(this.scene) {
            if(this.position.y < this.world.params.terrain.waterOffset + 0.4) {
                this.scene.fog = new Fog(0x3030f2, 1, 10); // Adjust near and far for density
            } else if (this.scene.fog) {
                // Player is above water, reset fog
                this.scene.fog = null; // Remove fog
            }
        }
    }

    /**
     * Updates the position of the player's bounding cylinder helper
     */
    updateBoundsHelper() {
        this.boundsHelper.position.copy(this.camera.position);
        this.boundsHelper.position.y -= this.height / 2;
    }

    /**
     * Updates the raycaster used for block selection
     * @param {World} world 
     */
    updateRaycaster(world) {
        this.raycaster.setFromCamera(this.center_screen, this.camera);
        const intersections = this.raycaster.intersectObject(world, true);

        if (intersections.length > 0) {
            const intersection = intersections[0];

            // Get the chunk associated with the selected block
            const chunk = intersection.object.parent;

            // Get the transformation matrix for the selected block
            const blockMatrix = new Matrix4();
            intersection.object.getMatrixAt(intersection.instanceId, blockMatrix);

            // Set the selected coordinates to the origin of the chunk,
            // then apply the transformation matrix of the block to get
            // the block coordinates
            this.selectedCoords = chunk.position.clone();
            this.selectedCoords.applyMatrix4(blockMatrix);

            if (this.activeBlockId !== blocks.empty.id) {
                // If we are adding a block, move it 1 block over in the direction
                // of where the ray intersected the cube
                this.selectedCoords.add(intersection.normal);
            }

            this.selectionHelper.position.copy(this.selectedCoords);
            this.selectionHelper.visible = true;
        } else {
            this.selectedCoords = null;
            this.selectionHelper.visible = false;
        }
    }

    /**
     * Updates the state of the player based on the current user inputs
     * @param {Number} dt 
     */
    applyInputs(dt) {
        if (this.controls.isLocked === true) {
            this.velocity.x = this.input.x * (this.sprinting ? 1.5 : 1);
            this.velocity.z = this.input.z * (this.sprinting ? 1.5 : 1);
            this.controls.moveRight(this.velocity.x * dt);
            this.controls.moveForward(this.velocity.z * dt);
            this.position.y += this.velocity.y * dt;

            if (this.position.y < 0) {
                this.position.y = 0;
                this.velocity.y = 0;
            }
        }

        document.getElementById('info-player-position').innerHTML = this.toString();
    }

    /**
     * Applies a change in velocity 'dv' that is specified in the world frame
     * @param {THREE.Vector3} dv 
     */
    applyWorldDeltaVelocity(dv) {
        dv.applyEuler(new Euler(0, -this.camera.rotation.y, 0));
        this.velocity.add(dv);
    }

    /**
     * Returns player position in a readable string form
     * @returns {string}
     */
    toString() {
        let str = '';
        str += `X: ${this.position.x.toFixed(3)} `;
        str += `Y: ${this.position.y.toFixed(3)} `;
        str += `Z: ${this.position.z.toFixed(3)}`;
        return str;
    }
}