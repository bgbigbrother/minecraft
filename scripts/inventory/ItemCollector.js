/**
 * ItemCollector - Handles automatic collection of dropped items
 * 
 * Checks for dropped items within collection radius and automatically
 * collects them, adding to player inventory and cleaning up resources.
 */
export class ItemCollector {
  // Collection radius in blocks (2.0 blocks as per requirements)
  static COLLECTION_RADIUS = 2.0;

  /**
   * Check for and collect any dropped items within range of the player
   * @param {object} player - Player instance with inventory and position
   * @param {Array} droppedItems - Array of DroppedItem instances
   * @param {object} world - World instance for scene management
   */
  static checkCollections(player, droppedItems, world) {
    if (!player || !droppedItems || !world) {
      return;
    }

    // Validate player position exists
    if (!player.position) {
      console.warn('Cannot check collections: player has no position');
      return;
    }

    // Get player position
    const playerPosition = player.position;
    
    // Check each dropped item for collection
    // Iterate backwards to safely remove items during iteration
    for (let i = droppedItems.length - 1; i >= 0; i--) {
      const item = droppedItems[i];
      
      // Skip invalid items
      if (!item || !item.position) {
        console.warn(`Skipping invalid dropped item at index ${i}`);
        continue;
      }
      
      try {
        // Calculate 3D Euclidean distance between player and item
        const distance = this.calculateDistance(playerPosition, item.position);
        
        // If within collection radius, collect the item
        if (distance <= this.COLLECTION_RADIUS) {
          this.collectItem(player, item, world, i, droppedItems);
        }
      } catch (e) {
        console.warn(`Error processing dropped item at index ${i}:`, e.message || e);
        // Continue checking other items
      }
    }
  }

  /**
   * Calculate 3D Euclidean distance between two positions
   * @param {THREE.Vector3} pos1 - First position
   * @param {THREE.Vector3} pos2 - Second position
   * @returns {number} - Distance in blocks
   */
  static calculateDistance(pos1, pos2) {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    const dz = pos1.z - pos2.z;
    
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Collect a specific item, adding it to inventory and cleaning up
   * @param {object} player - Player instance with inventory
   * @param {DroppedItem} item - The item to collect
   * @param {object} world - World instance for scene management
   * @param {number} index - Index of item in droppedItems array
   * @param {Array} droppedItems - Array of DroppedItem instances
   */
  static collectItem(player, item, world, index, droppedItems) {
    try {
      // Validate item has required properties
      if (!item || typeof item.blockId !== 'number') {
        console.warn('Cannot collect item: invalid item data', item);
        return;
      }
      
      // Validate player has inventory
      if (!player || !player.inventory) {
        console.warn('Cannot collect item: player has no inventory');
        return;
      }
      
      // Add item to player's inventory
      player.inventory.addItem(item.blockId, 1);
      
      // Save inventory to localStorage synchronously
      player.inventory.save();
      
      // Remove mesh from scene
      if (item.mesh) {
        world.remove(item.mesh);
      }
      
      // Clean up Three.js resources
      if (item.dispose) {
        item.dispose();
      }
      
      // Remove from droppedItems array
      droppedItems.splice(index, 1);
    } catch (e) {
      console.warn('Error collecting item:', e.message || e);
      console.error(e);
      // Continue gameplay - item will remain in world for retry
    }
  }

  /**
   * Check for and remove dropped items that have exceeded their despawn time
   * @param {Array} droppedItems - Array of DroppedItem instances
   * @param {object} world - World instance for scene management
   */
  static checkDespawns(droppedItems, world) {
    if (!droppedItems || !world) {
      return;
    }

    // Iterate in reverse order to safely remove items during iteration
    for (let i = droppedItems.length - 1; i >= 0; i--) {
      const item = droppedItems[i];
      
      // Skip invalid items
      if (!item) {
        console.warn(`Skipping invalid dropped item at index ${i}`);
        continue;
      }
      
      try {
        // Check if item should despawn
        if (item.shouldDespawn && item.shouldDespawn()) {
          // Remove mesh from world (world extends Group, so use world.remove directly)
          if (item.mesh) {
            world.remove(item.mesh);
          }
          
          // Clean up Three.js resources
          if (item.dispose) {
            item.dispose();
          }
          
          // Remove item from droppedItems array
          droppedItems.splice(i, 1);
        }
      } catch (e) {
        console.warn(`Error checking despawn for item at index ${i}:`, e.message || e);
        // Continue checking other items
      }
    }
  }
}
