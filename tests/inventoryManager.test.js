import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { InventoryManager } from '../scripts/inventory/InventoryManager.js';

describe('InventoryManager', () => {
  let inventory;
  let originalLocalStorage;

  beforeEach(() => {
    // Mock localStorage with fresh data object for each test
    originalLocalStorage = global.localStorage;
    const storageData = {}; // Fresh object for each test
    global.localStorage = {
      getItem(key) {
        return storageData[key] || null;
      },
      setItem(key, value) {
        storageData[key] = value;
      },
      removeItem(key) {
        delete storageData[key];
      },
      clear() {
        Object.keys(storageData).forEach(key => delete storageData[key]);
      }
    };
    
    // Create new inventory after localStorage is mocked
    inventory = new InventoryManager();
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
  });

  describe('addItem', () => {
    it('should add a new item with quantity 1', () => {
      inventory.addItem(3); // stone
      expect(inventory.getQuantity(3)).toBe(1);
    });

    it('should increment quantity when adding existing item', () => {
      inventory.addItem(3); // stone
      inventory.addItem(3);
      inventory.addItem(3);
      expect(inventory.getQuantity(3)).toBe(3);
    });

    it('should add multiple items at once', () => {
      inventory.addItem(3, 5); // 5 stone blocks
      expect(inventory.getQuantity(3)).toBe(5);
    });

    it('should handle multiple different block types', () => {
      inventory.addItem(1, 10); // grass
      inventory.addItem(3, 5);  // stone
      inventory.addItem(4, 2);  // coal ore
      
      expect(inventory.getQuantity(1)).toBe(10);
      expect(inventory.getQuantity(3)).toBe(5);
      expect(inventory.getQuantity(4)).toBe(2);
    });

    it('should ignore invalid block IDs', () => {
      inventory.addItem(-1);
      inventory.addItem(NaN);
      inventory.addItem('invalid');
      
      expect(inventory.items.size).toBe(0);
    });

    it('should ignore invalid quantities', () => {
      inventory.addItem(3, 0);
      inventory.addItem(3, -5);
      inventory.addItem(3, NaN);
      
      expect(inventory.getQuantity(3)).toBe(0);
    });
  });

  describe('removeItem', () => {
    beforeEach(() => {
      inventory.addItem(3, 10); // Add 10 stone blocks
    });

    it('should decrement quantity when removing items', () => {
      const result = inventory.removeItem(3, 3);
      expect(result).toBe(true);
      expect(inventory.getQuantity(3)).toBe(7);
    });

    it('should remove item entry when quantity reaches zero', () => {
      const result = inventory.removeItem(3, 10);
      expect(result).toBe(true);
      expect(inventory.getQuantity(3)).toBe(0);
      expect(inventory.hasItem(3)).toBe(false);
    });

    it('should return false when insufficient quantity', () => {
      const result = inventory.removeItem(3, 15);
      expect(result).toBe(false);
      expect(inventory.getQuantity(3)).toBe(10); // Quantity unchanged
    });

    it('should return false when item does not exist', () => {
      const result = inventory.removeItem(99);
      expect(result).toBe(false);
    });

    it('should return false for invalid block IDs', () => {
      const result1 = inventory.removeItem(-1);
      const result2 = inventory.removeItem(NaN);
      const result3 = inventory.removeItem('invalid');
      
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
    });

    it('should return false for invalid quantities', () => {
      const result1 = inventory.removeItem(3, 0);
      const result2 = inventory.removeItem(3, -5);
      const result3 = inventory.removeItem(3, NaN);
      
      expect(result1).toBe(false);
      expect(result2).toBe(false);
      expect(result3).toBe(false);
      expect(inventory.getQuantity(3)).toBe(10); // Quantity unchanged
    });
  });

  describe('getQuantity', () => {
    it('should return 0 for items not in inventory', () => {
      expect(inventory.getQuantity(99)).toBe(0);
    });

    it('should return correct quantity for existing items', () => {
      inventory.addItem(3, 42);
      expect(inventory.getQuantity(3)).toBe(42);
    });
  });

  describe('hasItem', () => {
    it('should return false for items not in inventory', () => {
      expect(inventory.hasItem(99)).toBe(false);
    });

    it('should return true for items in inventory', () => {
      inventory.addItem(3);
      expect(inventory.hasItem(3)).toBe(true);
    });

    it('should return false after all items are removed', () => {
      inventory.addItem(3, 5);
      inventory.removeItem(3, 5);
      expect(inventory.hasItem(3)).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all items from inventory', () => {
      inventory.addItem(1, 10);
      inventory.addItem(3, 5);
      inventory.addItem(4, 2);
      
      inventory.clear();
      
      expect(inventory.getQuantity(1)).toBe(0);
      expect(inventory.getQuantity(3)).toBe(0);
      expect(inventory.getQuantity(4)).toBe(0);
      expect(inventory.items.size).toBe(0);
    });
  });

  describe('JSON serialization', () => {
    it('should serialize to JSON correctly', () => {
      inventory.addItem(1, 10);
      inventory.addItem(3, 5);
      inventory.addItem(4, 2);
      
      const json = inventory.toJSON();
      
      expect(json).toEqual({
        items: {
          1: 10,
          3: 5,
          4: 2
        },
        version: 1
      });
    });

    it('should serialize empty inventory', () => {
      const json = inventory.toJSON();
      
      expect(json).toEqual({
        items: {},
        version: 1
      });
    });

    it('should deserialize from JSON correctly', () => {
      const data = {
        items: {
          1: 10,
          3: 5,
          4: 2
        },
        version: 1
      };
      
      inventory.fromJSON(data);
      
      expect(inventory.getQuantity(1)).toBe(10);
      expect(inventory.getQuantity(3)).toBe(5);
      expect(inventory.getQuantity(4)).toBe(2);
    });

    it('should handle round-trip serialization', () => {
      inventory.addItem(1, 10);
      inventory.addItem(3, 5);
      inventory.addItem(4, 2);
      
      const json = inventory.toJSON();
      const newInventory = new InventoryManager();
      newInventory.fromJSON(json);
      
      expect(newInventory.getQuantity(1)).toBe(10);
      expect(newInventory.getQuantity(3)).toBe(5);
      expect(newInventory.getQuantity(4)).toBe(2);
    });

    it('should skip invalid entries during deserialization', () => {
      const data = {
        items: {
          1: 10,
          '-1': 5,      // Invalid: negative ID
          'invalid': 3, // Invalid: non-numeric ID
          3: -2,        // Invalid: negative quantity
          4: 0,         // Invalid: zero quantity
          5: 'abc'      // Invalid: non-numeric quantity
        },
        version: 1
      };
      
      inventory.fromJSON(data);
      
      expect(inventory.getQuantity(1)).toBe(10);
      expect(inventory.getQuantity(-1)).toBe(0);
      expect(inventory.getQuantity(3)).toBe(0);
      expect(inventory.getQuantity(4)).toBe(0);
      expect(inventory.getQuantity(5)).toBe(0);
    });

    it('should handle missing items field', () => {
      const data = { version: 1 };
      
      inventory.addItem(1, 10); // Add some items first
      inventory.fromJSON(data);
      
      expect(inventory.items.size).toBe(0);
    });

    it('should handle null data', () => {
      inventory.addItem(1, 10); // Add some items first
      inventory.fromJSON(null);
      
      expect(inventory.items.size).toBe(0);
    });
  });

  describe('localStorage persistence', () => {
    it('should save inventory to localStorage', () => {
      inventory.addItem(1, 10);
      inventory.addItem(3, 5);
      
      inventory.save();
      
      const savedData = localStorage.getItem('minecraft_inventory');
      expect(savedData).toBeTruthy();
      
      const parsed = JSON.parse(savedData);
      expect(parsed.items).toEqual({
        1: 10,
        3: 5
      });
    });

    it('should load inventory from localStorage', () => {
      const data = {
        items: {
          1: 10,
          3: 5,
          4: 2
        },
        version: 1
      };
      
      localStorage.setItem('minecraft_inventory', JSON.stringify(data));
      
      inventory.load();
      
      expect(inventory.getQuantity(1)).toBe(10);
      expect(inventory.getQuantity(3)).toBe(5);
      expect(inventory.getQuantity(4)).toBe(2);
    });

    it('should handle missing localStorage data', () => {
      // Create a fresh inventory for this test
      const testInventory = new InventoryManager();
      
      // Ensure no saved data exists
      localStorage.removeItem('minecraft_inventory');
      
      // Load should not throw and should initialize empty inventory
      testInventory.load();
      
      // Should initialize empty inventory when no saved data exists
      expect(testInventory.items.size).toBe(0);
    });

    it('should handle corrupted JSON in localStorage', () => {
      localStorage.setItem('minecraft_inventory', 'invalid json {{{');
      
      inventory.addItem(1, 10); // Add some items first
      inventory.load();
      
      // Should initialize empty inventory on corrupted data
      expect(inventory.items.size).toBe(0);
    });

    it('should handle localStorage save failures gracefully', () => {
      // Save original setItem
      const originalSetItem = localStorage.setItem;
      
      // Mock localStorage to throw an error
      localStorage.setItem = () => {
        const error = new Error('Quota exceeded');
        error.name = 'QuotaExceededError';
        throw error;
      };
      
      inventory.addItem(1, 10);
      
      // Should not throw, just log warning
      expect(() => inventory.save()).not.toThrow();
      
      // Inventory should still be usable
      expect(inventory.getQuantity(1)).toBe(10);
      
      // Restore original setItem
      localStorage.setItem = originalSetItem;
    });

    it('should handle localStorage load failures gracefully', () => {
      // Clear any existing data
      localStorage.clear();
      
      // Create a fresh inventory for this test (constructor doesn't call load)
      const testInventory = new InventoryManager();
      
      // Verify it starts empty
      expect(testInventory.items.size).toBe(0);
      
      // Save the original getItem before overriding
      const originalGetItem = localStorage.getItem;
      
      // Mock localStorage to throw an error
      localStorage.getItem = () => {
        const error = new Error('Access denied');
        error.name = 'SecurityError';
        throw error;
      };
      
      // Should not throw, just log warning
      expect(() => testInventory.load()).not.toThrow();
      
      // Should still be empty after failed load (load() clears on error)
      expect(testInventory.items.size).toBe(0);
      
      // Restore original getItem
      localStorage.getItem = originalGetItem;
      
      // Verify inventory is still usable after error
      testInventory.addItem(1, 5);
      expect(testInventory.getQuantity(1)).toBe(5);
    });

    it('should persist and restore complete inventory state', () => {
      inventory.addItem(1, 10);
      inventory.addItem(3, 5);
      inventory.addItem(4, 2);
      
      inventory.save();
      
      const newInventory = new InventoryManager();
      newInventory.load();
      
      expect(newInventory.getQuantity(1)).toBe(10);
      expect(newInventory.getQuantity(3)).toBe(5);
      expect(newInventory.getQuantity(4)).toBe(2);
    });
  });
});
