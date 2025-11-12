/**
 * InventoryManager - Manages player's collected blocks and persistence
 * 
 * Stores block types and quantities using a Map structure.
 * Automatically saves to localStorage for persistence across sessions.
 */
export class InventoryManager {
  constructor() {
    // Map<blockId: number, quantity: number>
    this.items = new Map();
    this.storageKey = 'minecraft_inventory';
  }

  /**
   * Add items to the inventory
   * @param {number} blockId - The block type ID
   * @param {number} quantity - Number of items to add (default: 1)
   */
  addItem(blockId, quantity = 1) {
    // Validate block ID
    if (typeof blockId !== 'number' || isNaN(blockId) || blockId < 0) {
      console.warn(`Invalid block ID provided to addItem: ${blockId}`);
      return;
    }
    
    // Validate quantity
    if (typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
      console.warn(`Invalid quantity provided to addItem: ${quantity}`);
      return;
    }
    
    const currentQuantity = this.items.get(blockId) || 0;
    this.items.set(blockId, currentQuantity + quantity);
  }

  /**
   * Remove items from the inventory
   * @param {number} blockId - The block type ID
   * @param {number} quantity - Number of items to remove (default: 1)
   * @returns {boolean} - True if successful, false if insufficient quantity
   */
  removeItem(blockId, quantity = 1) {
    // Validate block ID
    if (typeof blockId !== 'number' || isNaN(blockId) || blockId < 0) {
      console.warn(`Invalid block ID provided to removeItem: ${blockId}`);
      return false;
    }
    
    // Validate quantity
    if (typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
      console.warn(`Invalid quantity provided to removeItem: ${quantity}`);
      return false;
    }
    
    const currentQuantity = this.items.get(blockId) || 0;
    
    if (currentQuantity < quantity) {
      return false;
    }
    
    const newQuantity = currentQuantity - quantity;
    if (newQuantity === 0) {
      this.items.delete(blockId);
    } else {
      this.items.set(blockId, newQuantity);
    }
    
    return true;
  }

  /**
   * Get the quantity of a specific block type
   * @param {number} blockId - The block type ID
   * @returns {number} - Quantity of the block (0 if not in inventory)
   */
  getQuantity(blockId) {
    return this.items.get(blockId) || 0;
  }

  /**
   * Check if inventory has at least one of a block type
   * @param {number} blockId - The block type ID
   * @returns {boolean} - True if block exists in inventory
   */
  hasItem(blockId) {
    return this.items.has(blockId) && this.items.get(blockId) > 0;
  }

  /**
   * Clear all items from inventory
   */
  clear() {
    this.items.clear();
  }

  /**
   * Convert inventory to JSON-serializable object
   * @returns {object} - Plain object representation
   */
  toJSON() {
    const itemsObject = {};
    for (const [blockId, quantity] of this.items.entries()) {
      itemsObject[blockId] = quantity;
    }
    
    return {
      items: itemsObject,
      version: 1
    };
  }

  /**
   * Restore inventory from JSON data
   * @param {object} data - Plain object with inventory data
   */
  fromJSON(data) {
    this.items.clear();
    
    if (!data || !data.items) {
      console.warn('No valid inventory data provided to fromJSON');
      return;
    }
    
    let invalidEntries = 0;
    
    for (const [blockId, quantity] of Object.entries(data.items)) {
      const id = parseInt(blockId, 10);
      const qty = parseInt(quantity, 10);
      
      if (!isNaN(id) && !isNaN(qty) && qty > 0 && id >= 0) {
        this.items.set(id, qty);
      } else {
        invalidEntries++;
        console.warn(`Skipping invalid inventory entry: blockId=${blockId}, quantity=${quantity}`);
      }
    }
    
    if (invalidEntries > 0) {
      console.warn(`Loaded inventory with ${invalidEntries} invalid entries skipped`);
    }
  }

  /**
   * Save inventory to localStorage
   */
  save() {
    try {
      const data = this.toJSON();
      const jsonString = JSON.stringify(data);
      localStorage.setItem(this.storageKey, jsonString);
    } catch (e) {
      // Handle various localStorage errors
      if (e.name === 'QuotaExceededError') {
        console.warn('Failed to save inventory: localStorage quota exceeded. Consider clearing old data.', e);
      } else if (e.name === 'SecurityError') {
        console.warn('Failed to save inventory: localStorage access denied (private browsing mode?).', e);
      } else {
        console.warn('Failed to save inventory to localStorage:', e.message || e);
      }
      // Continue gameplay without persistence - game remains playable
    }
  }

  /**
   * Load inventory from localStorage
   */
  load() {
    try {
      const savedData = localStorage.getItem(this.storageKey);
      
      if (!savedData) {
        // No saved data, initialize empty inventory (normal for first-time players)
        this.items.clear();
        return;
      }
      
      const data = JSON.parse(savedData);
      this.fromJSON(data);
    } catch (e) {
      // Handle various loading errors
      if (e instanceof SyntaxError) {
        console.warn('Failed to load inventory: corrupted JSON data, starting fresh.', e.message);
      } else if (e.name === 'SecurityError') {
        console.warn('Failed to load inventory: localStorage access denied.', e.message);
      } else {
        console.warn('Failed to load inventory from localStorage, starting fresh:', e.message || e);
      }
      // Initialize empty inventory on error - game remains playable
      this.items.clear();
    }
  }
}
