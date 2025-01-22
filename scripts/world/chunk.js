import { WorldChunk } from '../worldChunk';
import { StoreWorldBaseClass } from './store_world';

export class ChunkStoreWorldBaseClass extends StoreWorldBaseClass {
    constructor(models) {
        super();
        this.models = models;
    }

    /**
     * Generates the chunk at the (x, z) coordinates
     * @param {number} x 
     * @param {number} z
     */
    generateChunk(x, z) {
        const chunk = new WorldChunk(this.chunkSize, this.params, this.dataStore);
        chunk.position.set(x * this.chunkSize.width, 0, z * this.chunkSize.width);
        chunk.userData = { x, z };

        if (this.asyncLoading) {
            requestIdleCallback(chunk.generate.bind(chunk, this.models), { timeout: 1000 });
        } else {
            chunk.generate(this.models);
        }

        this.add(chunk);
        // console.log(`Adding chunk at X: ${x} Z: ${z}`);
    }

    /**
     * Returns the coordinates of the block at world (x,y,z)
     *  - `chunk` is the coordinates of the chunk containing the block
     *  - `block` is the coordinates of the block relative to the chunk
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns {{
     *  chunk: { x: number, z: number},
        *  block: { x: number, y: number, z: number}
        * }}
        */
    worldToChunkCoords(x, y, z) {
        const chunkCoords = {
            x: Math.floor(x / this.chunkSize.width),
            z: Math.floor(z / this.chunkSize.width)
        };
    
        const blockCoords = {
            x: x - this.chunkSize.width * chunkCoords.x,
            y,
            z: z - this.chunkSize.width * chunkCoords.z
        };
    
        return {
            chunk: chunkCoords,
            block: blockCoords
        }
    }

    /**
     * Returns the WorldChunk object at the specified coordinates
     * @param {number} chunkX
     * @param {number} chunkZ
     * @returns {WorldChunk | null}
     */
    getChunk(chunkX, chunkZ) {
        return this.children.find((chunk) => (
            chunk.userData.x === chunkX &&
            chunk.userData.z === chunkZ
        ));
    }
}