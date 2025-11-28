import { Vector3 } from 'three';

/**
 * ItemThrower module
 * Handles throwing items from the player's inventory into the world
 */
export class ItemThrower {
  // Distance in blocks to throw items away from player
  static THROW_DISTANCE = 3.0;

  /**
   * Calculates the position where a thrown item should spawn
   * Position is 3 blocks away from player in the direction they are facing
   * @param {Player} player - The player throwing the item
   * @returns {THREE.Vector3} The calculated throw position
   */
  static calculateThrowPosition(player) {
    // Get the direction the player's camera is facing (normalized)
    const direction = new Vector3();
    player.camera.getWorldDirection(direction);
    
    // Calculate throw position: player position + (direction * distance)
    const throwPosition = new Vector3();
    throwPosition.copy(player.position);
    
    const offsetX = (Math.random() - 0.5) * 1; // Range: -0.3 to +0.3
    const offsetZ = (Math.random() - 0.5) * 1; // Range: -0.3 to +0.3
    
    // Multiply direction by throw distance and add to player position
    throwPosition.x += direction.x * this.THROW_DISTANCE + offsetX;
    throwPosition.y += direction.y - player.height / 2;
    throwPosition.z += direction.z * this.THROW_DISTANCE + offsetZ;
    
    return throwPosition;
  }

  /**
   * Throws an item from the player's inventory into the world
   * @param {Player} player - The player throwing the item
   * @param {World} world - The game world
   * @param {ToolbarUI} toolbarUI - The toolbar UI instance
   * @returns {boolean} True if item was thrown successfully, false otherwise
   */
  static throwItem(player, world, toolbarUI) {
    // Get the currently selected block ID from the toolbar
    const blockId = toolbarUI.getSelectedBlockId();
    
    // Return false if no item is selected (empty slot or destroy mode)
    if (blockId === null) {
      return false;
    }
    
    // Check if player has the item in inventory
    if (!player.inventory.hasItem(blockId)) {
      return false;
    }
    
    // Calculate where to spawn the thrown item
    const throwPosition = this.calculateThrowPosition(player);
    
    // Remove one item from inventory
    const removed = player.inventory.removeItem(blockId, 1);
    
    // Safety check: if removal failed, don't spawn item
    if (!removed) {
      return false;
    }
    
    // Spawn the dropped item in the world
    world.spawnDroppedItem(blockId, throwPosition);
    
    // Persist inventory changes to localStorage
    player.inventory.save();
    
    // Update toolbar display to reflect new quantity
    toolbarUI.render();
    
    return true;
  }
}
