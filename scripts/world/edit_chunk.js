import * as THREE from 'three';
import { ChunkStoreWorldBaseClass } from './chunk';

/**
 * Extends world with block editing capabilities
 * Handles adding, removing, and modifying individual blocks
 */
export class EditChunkStoreWorldBaseClass extends ChunkStoreWorldBaseClass {
    constructor(models) {
        super(models);
    }
    
    /**
     * Gets the block data at world coordinates (x, y, z)
     * @param {number} x - World X coordinate
     * @param {number} y - World Y coordinate
     * @param {number} z - World Z coordinate
     * @returns {{id: number, instanceId: number} | null} Block data or null if chunk not loaded
     */
    getBlock(x, y, z) {
        // Convert world coordinates to chunk and block coordinates
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        // Only return block if chunk exists and is fully loaded
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
     * Adds a new block at world coordinates (x, y, z)
     * Also optimizes rendering by hiding adjacent blocks that are now obscured
     * @param {number} x - World X coordinate
     * @param {number} y - World Y coordinate
     * @param {number} z - World Z coordinate
     * @param {number} blockId - Type of block to place (from blocks.js)
     * @param {InventoryManager} inventoryManager - Optional inventory manager to check/deduct items
     * @returns {boolean} - True if block was placed, false if placement was prevented
     */
    addBlock(x, y, z, blockId, inventoryManager = null) {
        // If inventory manager is provided, check if player has the item
        if (inventoryManager) {
            if (!inventoryManager.hasItem(blockId)) {
                // Player doesn't have this item in inventory, prevent placement
                return false;
            }
        }

        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        if (chunk && chunk.loaded) {
            // Add the block to the chunk
            chunk.addBlock(
                coords.block.x,
                coords.block.y,
                coords.block.z,
                blockId
            );

            // Hide neighboring blocks if they are now completely surrounded
            // This optimization reduces the number of rendered faces
            this.hideBlock(x - 1, y, z); // Left
            this.hideBlock(x + 1, y, z); // Right
            this.hideBlock(x, y - 1, z); // Bottom
            this.hideBlock(x, y + 1, z); // Top
            this.hideBlock(x, y, z - 1); // Front
            this.hideBlock(x, y, z + 1); // Back
            
            return true;
        }
        
        return false;
    }

    /**
     * Removes the block at world coordinates (x, y, z)
     * Also reveals adjacent blocks that were previously hidden
     * @param {number} x - World X coordinate
     * @param {number} y - World Y coordinate
     * @param {number} z - World Z coordinate
     */
    removeBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        // Prevent removing bedrock layer (y = 0)
        if (coords.block.y === 0) return;

        if (chunk && chunk.loaded) {
            // Get the block type before removing it
            const block = this.getBlock(x, y, z);
            // Store the block ID as a value (not reference) before removal
            const blockId = block ? block.id : 0;
            
            // Remove the block from the chunk
            chunk.removeBlock(
                coords.block.x,
                coords.block.y,
                coords.block.z
            );

            // Spawn dropped item if block exists and is not empty (air)
            if (blockId !== 0) {
                const position = new THREE.Vector3(x, y, z);
                this.spawnDroppedItem(blockId, position);
            }

            // Reveal adjacent blocks that may have been hidden
            // These blocks now have an exposed face and need to be rendered
            this.revealBlock(x - 1, y, z); // Left
            this.revealBlock(x + 1, y, z); // Right
            this.revealBlock(x, y - 1, z); // Bottom
            this.revealBlock(x, y + 1, z); // Top
            this.revealBlock(x, y, z - 1); // Front
            this.revealBlock(x, y, z + 1); // Back
        }
    }

    /**
     * Reveals a block by adding its mesh instance back to the scene
     * Called when an adjacent block is removed
     * @param {number} x - World X coordinate
     * @param {number} y - World Y coordinate
     * @param {number} z - World Z coordinate
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
     * Hides a block by removing its mesh instance from the scene
     * Called when a block becomes completely surrounded by other blocks
     * @param {number} x - World X coordinate
     * @param {number} y - World Y coordinate
     * @param {number} z - World Z coordinate
     */
    hideBlock(x, y, z) {
        const coords = this.worldToChunkCoords(x, y, z);
        const chunk = this.getChunk(coords.chunk.x, coords.chunk.z);

        // Only hide if block is completely obscured by neighbors
        if (chunk && chunk.isBlockObscured(coords.block.x, coords.block.y, coords.block.z)) {
            chunk.deleteBlockInstance(
                coords.block.x,
                coords.block.y,
                coords.block.z
            )
        }
    }
}