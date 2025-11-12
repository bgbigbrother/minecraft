import * as THREE from 'three';
import { EditChunkStoreWorldBaseClass } from './edit_chunk';
import { DroppedItem } from '../inventory/DroppedItem';
import { blocks } from '../textures/blocks';

export class World extends EditChunkStoreWorldBaseClass {
  constructor(models) {
    super(models);
    
    // Array to track all dropped items in the world
    this.droppedItems = [];
  }

  /**
   * Regenerate the world data model and the meshes
   */
  generate(clearCache = false) {
    if (clearCache) {
        this.dataStore && this.dataStore.clear();
    }

    this.disposeChunks();

    for (let x = -this.drawDistance; x <= this.drawDistance; x++) {
      for (let z = -this.drawDistance; z <= this.drawDistance; z++) {
        this.generateChunk(x, z);
      }
    }
  }

  /**
   * Updates the visible portions of the world based on the
   * current player position
   * @param {Player} player 
   */
  update(dt, player) {
    const visibleChunks = this.getVisibleChunks(player);
    const chunksToAdd = this.getChunksToAdd(visibleChunks);
    this.removeUnusedChunks(visibleChunks);

    for (const chunk of chunksToAdd) {
      this.generateChunk(chunk.x, chunk.z);
    }

    this.children.forEach(child => {
      child.name === "Chunk" && child.update(dt)
    });
  }

  /**
   * Returns an array containing the coordinates of the chunks that 
   * are currently visible to the player
   * @param {Player} player 
   * @returns {{ x: number, z: number}[]}
   */
  getVisibleChunks(player) {
    const visibleChunks = [];

    const coords = this.worldToChunkCoords(
      player.position.x,
      player.position.y,
      player.position.z
    );

    const chunkX = coords.chunk.x;
    const chunkZ = coords.chunk.z;

    for (let x = chunkX - this.drawDistance; x <= chunkX + this.drawDistance; x++) {
      for (let z = chunkZ - this.drawDistance; z <= chunkZ + this.drawDistance; z++) {
        visibleChunks.push({ x, z });
      }
    }

    return visibleChunks;
  }

  /**
   * Returns an array containing the coordinates of the chunks that 
   * are not yet loaded and need to be added to the scene
   * @param {{ x: number, z: number}[]} visibleChunks 
   * @returns {{ x: number, z: number}[]}
   */
  getChunksToAdd(visibleChunks) {
    // Filter down the visible chunks to those not already in the world
    return visibleChunks.filter((chunk) => {
      const chunkExists = this.children
        .map((obj) => obj.userData)
        .find(({ x, z }) => (
          chunk.x === x && chunk.z === z
        ));

      return !chunkExists;
    })
  }

  /**
   * Removes current loaded chunks that are no longer visible to the player
   * @param {{ x: number, z: number}[]} visibleChunks 
   */
  removeUnusedChunks(visibleChunks) {
    // Filter down the visible chunks to those not already in the world
    const chunksToRemove = this.children.filter((chunk) => {
      const { x, z } = chunk.userData;
      const chunkExists = visibleChunks
        .find((visibleChunk) => (
          visibleChunk.x === x && visibleChunk.z === z
        ));

      return !chunkExists;
    });

    for (const chunk of chunksToRemove) {
      if (chunk.disposeInstances) {
        chunk.disposeInstances();
        this.remove(chunk);
      }
      // console.log(`Removing chunk at X: ${chunk.userData.x} Z: ${chunk.userData.z}`);
    }
  }

  disposeChunks() {
    this.traverse((chunk) => {
      if (chunk.disposeInstances) {
        chunk.disposeInstances();
      }
    });
    this.clear();
  }

  /**
   * Spawns a dropped item in the world when a block is broken
   * @param {number} blockId - The ID of the block type to spawn
   * @param {THREE.Vector3} position - The position where the block was broken
   */
  spawnDroppedItem(blockId, position) {
    try {
      // Validate block ID
      if (typeof blockId !== 'number' || isNaN(blockId) || blockId < 0) {
        console.warn(`Cannot spawn dropped item: invalid block ID ${blockId}`);
        return;
      }
      
      // Validate position
      if (!position || typeof position.x !== 'number' || typeof position.y !== 'number' || typeof position.z !== 'number') {
        console.warn('Cannot spawn dropped item: invalid position', position);
        return;
      }
      
      // Get the block definition to access its material
      const blockDefinition = Object.values(blocks).find(block => block.id === blockId);
      
      if (!blockDefinition) {
        console.warn(`Cannot spawn dropped item: block ID ${blockId} not found in blocks registry`);
        return;
      }

      // Calculate spawn position on top of nearest solid block below
      const spawnPosition = this.findSolidSurfaceBelow(position);
      
      // Create the dropped item (pass world reference for collision detection)
      const droppedItem = new DroppedItem(blockId, spawnPosition, blockDefinition, this);
      
      // Validate the dropped item was created successfully
      if (!droppedItem.mesh) {
        console.warn(`Failed to create mesh for dropped item (blockId: ${blockId})`);
        return;
      }
      
      // Add the mesh to the scene
      this.add(droppedItem.mesh);
      
      // Track the dropped item
      this.droppedItems.push(droppedItem);
    } catch (e) {
      console.warn(`Error spawning dropped item (blockId: ${blockId}):`, e.message || e);
      console.error(e);
      // Continue gameplay - block is removed but no item spawned
    }
  }

  /**
   * Finds the nearest solid block surface below the given position
   * @param {THREE.Vector3} position - Starting position to search from
   * @returns {THREE.Vector3} - Position on top of the nearest solid block
   */
  findSolidSurfaceBelow(position) {
    try {
      const searchPosition = position.clone();
      
      // Start searching from the block below the broken block
      searchPosition.y -= 2;
      
      // Search downward for a solid block (max 32 blocks down)
      for (let i = 0; i < 32; i++) {
        const block = this.getBlock(
          Math.floor(searchPosition.x),
          Math.floor(searchPosition.y),
          Math.floor(searchPosition.z)
        );
        
        // If we found a solid block (not empty/air), place item on top
        if (block && block.id !== 0) {
          return new THREE.Vector3(
            position.x,
            searchPosition.y + 1.5, // Place on top of the solid block (0.5 offset for visual)
            position.z
          );
        }
        
        searchPosition.y -= 1;
      }
    } catch (e) {
      // If chunk not loaded or other error, just use original position
    }
    
    // If no solid block found or error occurred, use the original position
    return position.clone();
  }
}