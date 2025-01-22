import { ChunkStoreWorldBaseClass } from './chunk';

export class EditChunkStoreWorldBaseClass extends ChunkStoreWorldBaseClass {
    constructor(models) {
        super(models);
    }
    
    /**
     * Gets the block data at (x, y, z)
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @returns {{id: number, instanceId: number} | null}
     */
    getBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk && chunk.loaded) {
            return chunk.getBlock(
                coords.block.x,
                coords.block.y,
                coords.block.z
            );
        } else {
            return null;
        }
    }

    /**
     * Adds a new block at (x,y,z) of type `blockId`
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {number} blockId 
     */
    addBlock(x, y, z, blockId) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk && chunk.loaded) {
            chunk.addBlock(
                coords.block.x,
                coords.block.y,
                coords.block.z,
                blockId
            );

            // Hide neighboring blocks if they are completely obscured
            this.hideBlock(x - 1, y, z);
            this.hideBlock(x + 1, y, z);
            this.hideBlock(x, y - 1, z);
            this.hideBlock(x, y + 1, z);
            this.hideBlock(x, y, z - 1);
            this.hideBlock(x, y, z + 1);
        }
    }

    /**
     * Removes the block at (x, y, z) and sets it to empty
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    removeBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        // Don't allow removing the first layer of blocks
        if (coords.block.y === 0) return;

        if (chunk && chunk.loaded) {
            chunk.removeBlock(
                coords.block.x,
                coords.block.y,
                coords.block.z
            );

            // Reveal adjacent neighbors if they are hidden
            this.revealBlock(x - 1, y, z);
            this.revealBlock(x + 1, y, z);
            this.revealBlock(x, y - 1, z);
            this.revealBlock(x, y + 1, z);
            this.revealBlock(x, y, z - 1);
            this.revealBlock(x, y, z + 1);
        }
    }

    /**
     * Reveals the block at (x,y,z) by adding a new mesh instance
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    revealBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk && chunk.loaded) {
            chunk.addBlockInstance(
                coords.block.x,
                coords.block.y,
                coords.block.z
            )
        }
    }

    /**
     * Hides the block at (x,y,z) by removing the mesh instance
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    hideBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk && chunk.isBlockObscured(coords.block.x, coords.block.y, coords.block.z)) {
            chunk.deleteBlockInstance(
                coords.block.x,
                coords.block.y,
                coords.block.z
            )
        }
    }
}