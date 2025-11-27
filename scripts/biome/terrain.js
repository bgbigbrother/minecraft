import * as THREE from 'three';
import { blocks } from '../textures/blocks.js';
import { resources } from '../textures/resources';

export class Terrain extends THREE.Group {
    data = [];

    constructor(dataStore, size) {
        super();
        this.dataStore = dataStore;
        this.size = size;
        this.initializeTerrain();
    }

    /**
    * Initializes an empty world
    */
    initializeTerrain() {
        this.data = [];
        for (let x = 0; x < this.size.width; x++) {
            const slice = [];
            for (let y = 0; y < this.size.height; y++) {
                const row = [];
                for (let z = 0; z < this.size.width; z++) {
                    row.push({
                        id: blocks.empty.id,
                        instanceId: null
                    });
                }
                slice.push(row);
            }
            this.data.push(slice);
        }
    }

    /**
     * Gets the block data at (x, y, z)
     * @param {number} x
     * @param {number} y
     * @param {number} z
     * @returns {{id: number, instanceId: number}}
     */
    getBlock(x, y, z) {
        // Round coordinates to handle floating point precision issues
        x = Math.floor(x);
        y = Math.floor(y);
        z = Math.floor(z);
        
        if (this.inBounds(x, y, z)) {
            return this.data[x][y][z];
        } else {
            return null;
        }
    }

    /**
    * Sets the block id for the block at (x, y, z)
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @param {number} id
    */
    setBlockId(x, y, z, id) {
        // Round coordinates to handle floating point precision issues
        x = Math.floor(x);
        y = Math.floor(y);
        z = Math.floor(z);
        
        if (this.inBounds(x, y, z)) {
            this.data[x][y][z].id = id;
        }
    }

    /**
    * Sets the block instance id for the block at (x, y, z)
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @param {number} instanceId
    */
    setBlockInstanceId(x, y, z, instanceId) {
        // Round coordinates to handle floating point precision issues
        x = Math.floor(x);
        y = Math.floor(y);
        z = Math.floor(z);
        
        if (this.inBounds(x, y, z)) {
            this.data[x][y][z].instanceId = instanceId;
        }
    }

    /**
    * Checks if the (x, y, z) coordinates are within bounds
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @returns {boolean}
    */
    inBounds(x, y, z) {
        if (x >= 0 && x < this.size.width &&
            y >= 0 && y < this.size.height &&
            z >= 0 && z < this.size.width) {
            return true;
        } else {
            return false;
        }
    }

    /**
    * Returns true if this block is completely hidden by other blocks
    * @param {number} x
    * @param {number} y
    * @param {number} z
    * @returns {boolean}
    */
    isBlockObscured(x, y, z) {
        // Round coordinates to handle floating point precision issues
        x = Math.floor(x);
        y = Math.floor(y);
        z = Math.floor(z);
        
        const up = this.getBlock(x, y + 1, z)?.id ?? blocks.empty.id;
        const down = this.getBlock(x, y - 1, z)?.id ?? blocks.empty.id;
        const left = this.getBlock(x + 1, y, z)?.id ?? blocks.empty.id;
        const right = this.getBlock(x - 1, y, z)?.id ?? blocks.empty.id;
        const forward = this.getBlock(x, y, z + 1)?.id ?? blocks.empty.id;
        const back = this.getBlock(x, y, z - 1)?.id ?? blocks.empty.id;

        // If any of the block's sides is exposed, it is not obscured
        if (up === blocks.empty.id ||
            down === blocks.empty.id ||
            left === blocks.empty.id ||
            right === blocks.empty.id ||
            forward === blocks.empty.id ||
            back === blocks.empty.id) {
            return false;
        } else {
            return true;
        }
    }

    /**
   * Create a new instance for the block at (x,y,z)
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   */
    addBlockInstance(x, y, z) {
        const block = this.getBlock(x, y, z);

        // Verify the block exists, it isn't an empty block type, and it doesn't already have an instance
        if (block && block.id !== blocks.empty.id && block.instanceId === null) {
            // Get the mesh and instance id of the block
            let mesh = this.children.find((instanceMesh) => instanceMesh.name === block.id);
            
            // If mesh doesn't exist, create it for this chunk
            if (!mesh) {
                const blockType = Object.values(blocks).find(b => b.id === block.id);
                
                // Check if this is a model block that hasn't loaded yet
                if (blockType && blockType.isModel && !blockType.geometry) {
                    console.warn(`[Terrain] Cannot add instance for ${blockType.name} - geometry not loaded yet`);
                    return;
                }
                
                // Create the instanced mesh for this block type
                const maxCount = this.size.width * this.size.width * this.size.height;
                const blockGeometry = blockType.geometry || new THREE.BoxGeometry();
                
                mesh = new THREE.InstancedMesh(blockGeometry, blockType.material, maxCount);
                mesh.name = block.id;
                mesh.count = 0;
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                
                // Add the mesh to this chunk
                this.add(mesh);
            }
            
            const instanceId = mesh.count++;
            this.setBlockInstanceId(x, y, z, instanceId);

            // Compute the transformation matrix for the new instance and update the instanced
            const matrix = new THREE.Matrix4();
            matrix.setPosition(x, y, z);
            mesh.setMatrixAt(instanceId, matrix);
            mesh.instanceMatrix.needsUpdate = true;
            mesh.computeBoundingSphere();
            
            const blockType = Object.values(blocks).find(b => b.id === block.id);
            if (blockType && blockType.isModel) {
                console.log(`[Terrain] Added instance for ${blockType.name} at (${x},${y},${z}), instanceId: ${instanceId}, mesh.count: ${mesh.count}`);
            }
        }
    }

    /**
     * Removes the mesh instance associated with `block` by swapping it
     * with the last instance and decrementing the instance count.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    deleteBlockInstance(x, y, z) {
        const block = this.getBlock(x, y, z);

        if (block.id === blocks.empty.id || block.instanceId === null) return;

        // Get the mesh and instance id of the block
        const mesh = this.children.find((instanceMesh) => instanceMesh.name === block.id);
        const instanceId = block.instanceId;

        // Swapping the transformation matrix of the block in the last position
        // with the block that we are going to remove
        const lastMatrix = new THREE.Matrix4();
        mesh.getMatrixAt(mesh.count - 1, lastMatrix);

        // Updating the instance id of the block in the last position to its new instance id
        const v = new THREE.Vector3();
        v.applyMatrix4(lastMatrix);
        this.setBlockInstanceId(v.x, v.y, v.z, instanceId);

        // Swapping the transformation matrices
        mesh.setMatrixAt(instanceId, lastMatrix);

        // This effectively removes the last instance from the scene
        mesh.count--;

        // Notify the instanced mesh we updated the instance matrix
        // Also re-compute the bounding sphere so raycasting works
        mesh.instanceMatrix.needsUpdate = true;
        mesh.computeBoundingSphere();

        // Remove the instance associated with the block and update the data model
        this.setBlockInstanceId(x, y, z, null);
    }

    /**
     * Adds a new block at (x,y,z) of type `blockId`
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {number} blockId 
     */
    addBlock(x, y, z, blockId) {
        if (this.getBlock(x, y, z).id === blocks.empty.id) {
            this.setBlockId(x, y, z, blockId);
            this.addBlockInstance(x, y, z);
            this.dataStore.set(this.position.x, this.position.z, x, y, z, blockId);
        }
    }

    /**
     * Removes the block at (x, y, z)
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    removeBlock(x, y, z) {
        const block = this.getBlock(x, y, z);
        if (block && block.id !== blocks.empty.id) {
            this.deleteBlockInstance(x, y, z);
            this.setBlockId(x, y, z, blocks.empty.id);
            this.dataStore.set(this.position.x, this.position.z, x, y, z, blocks.empty.id);
        }
    }

    /**
     * Determines if a resource block should be generated at (x, y, z)
     * @param {SimplexNoise} simplex 
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    generateBlockIfNeeded(simplex, x, y, z) {
        this.setBlockId(x, y, z, blocks.dirt.id);
        resources.forEach(resource => {
            const value = simplex.noise3d(
                (this.position.x + x) / resource.scale.x,
                (this.position.y + y) / resource.scale.y,
                (this.position.z + z) / resource.scale.z);

            if (value > resource.scarcity) {
                this.setBlockId(x, y, z, resource.id);
            }
        });
    }
}