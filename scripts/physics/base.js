import { Group, Mesh, MeshBasicMaterial, BoxGeometry, SphereGeometry } from 'three';

// Visual helpers for debugging collisions
// Red semi-transparent boxes show blocks involved in collision detection
const collisionMaterial = new MeshBasicMaterial({
    color: 0xff0000, // Red
    transparent: true,
    opacity: 0.2
});
const collisionGeometry = new BoxGeometry(1.001, 1.001, 1.001); // Slightly larger than block

// Green wireframe spheres show exact contact points
const contactMaterial = new MeshBasicMaterial({ wireframe: true, color: 0x00ff00 });
const contactGeometry = new SphereGeometry(0.05, 6, 6); // Small sphere

/**
 * Base physics class
 * Provides foundation for physics simulation with debug visualization
 */
export class BasePhysics {
    /**
     * Acceleration due to gravity (blocks per second squared)
     * Higher value = faster falling
     */
    gravity = 32;

    /**
     * Physics simulation rate (updates per second)
     * Higher rate = more accurate but more CPU intensive
     */
    simulationRate = 250;
    
    /**
     * Time step for each physics update (in seconds)
     */
    stepSize = 1 / this.simulationRate;
    
    /**
     * Accumulator for leftover delta time
     * Ensures consistent physics regardless of frame rate
     */
    accumulator = 0;

    /**
     * Initializes physics system with debug helpers
     * @param {THREE.Scene} scene - The Three.js scene to add helpers to
     */
    constructor(scene) {
        // Group containing all debug visualization meshes
        this.helpers = new Group();
        this.helpers.visible = false; // Hidden by default (toggle in UI)
        scene.add(this.helpers);
    }

    /**
     * Adds a visual helper to show a block involved in collision
     * Creates a red semi-transparent box around the block
     * @param {THREE.Object3D} block - Block position to visualize
     */
    addCollisionHelper(block) {
        const blockMesh = new Mesh(collisionGeometry, collisionMaterial);
        blockMesh.position.copy(block);
        this.helpers.add(blockMesh);
    }

    /**
     * Adds a visual helper to show an exact collision contact point
     * Creates a small green wireframe sphere at the contact point
     * @param {{ x: number, y: number, z: number }} p - Contact point position
     */
    addContactPointerHelper(p) {
        const contactMesh = new Mesh(contactGeometry, contactMaterial);
        contactMesh.position.copy(p);
        this.helpers.add(contactMesh);
    }
}