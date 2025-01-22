import { Group, Mesh, MeshBasicMaterial, BoxGeometry, SphereGeometry } from 'three';

const collisionMaterial = new MeshBasicMaterial({
    color: 0xff0000,
    transparent: true,
    opacity: 0.2
});
const collisionGeometry = new BoxGeometry(1.001, 1.001, 1.001);

const contactMaterial = new MeshBasicMaterial({ wireframe: true, color: 0x00ff00 });
const contactGeometry = new SphereGeometry(0.05, 6, 6);

export class BasePhysics {
    // Acceleration due to gravity
    gravity = 32;

    // Physic simulation rate
    simulationRate = 250;
    stepSize = 1 / this.simulationRate;
    // Accumulator to keep track of leftover dt
    accumulator = 0;

    constructor(scene) {
        this.helpers = new Group();
        this.helpers.visible = false;
        scene.add(this.helpers);
    }

    /**
     * Visualizes the block the player is colliding with
     * @param {THREE.Object3D} block 
     */
    addCollisionHelper(block) {
        const blockMesh = new Mesh(collisionGeometry, collisionMaterial);
        blockMesh.position.copy(block);
        this.helpers.add(blockMesh);
    }

    /**
     * Visualizes the contact at the point 'p'
     * @param {{ x, y, z }} p 
     */
    addContactPointerHelper(p) {
        const contactMesh = new Mesh(contactGeometry, contactMaterial);
        contactMesh.position.copy(p);
        this.helpers.add(contactMesh);
    }
}