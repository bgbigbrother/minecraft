import { describe, it, expect, beforeEach } from '@jest/globals';
import { ItemThrower } from '../scripts/inventory/ItemThrower.js';
import { InventoryManager } from '../scripts/inventory/InventoryManager.js';
import * as THREE from 'three';

describe('ItemThrower', () => {
  let mockPlayer;
  let mockWorld;
  let mockToolbarUI;
  let mockInventory;
  let originalLocalStorage;

  beforeEach(() => {
    // Mock localStorage
    originalLocalStorage = global.localStorage;
    const storageData = {};
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

    // Create real inventory manager
    mockInventory = new InventoryManager();

    // Create a proper THREE.Vector3 for position
    const playerPosition = new THREE.Vector3(10, 5, 10);

    // Mock player with camera, position, and height
    mockPlayer = {
      position: playerPosition,
      height: 1.75, // Standard player height
      camera: {
        getWorldDirection: function(target) {
          // Default direction: looking along positive Z axis
          target.set(0, 0, 1);
          return target;
        }
      },
      inventory: mockInventory
    };

    // Mock world with spawnDroppedItem tracking
    mockWorld = {
      spawnedItems: [],
      spawnDroppedItem: function(blockId, position) {
        this.spawnedItems.push({ blockId, position: position.clone() });
      }
    };

    // Mock toolbar UI
    mockToolbarUI = {
      selectedBlockId: null,
      renderCalled: false,
      getSelectedBlockId: function() {
        return this.selectedBlockId;
      },
      render: function() {
        this.renderCalled = true;
      }
    };
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
  });

  describe('calculateThrowPosition', () => {
    it('should return position 3 blocks in front of player', () => {
      // Player at (10, 5, 10) with height 1.75, looking along +Z axis
      const throwPosition = ItemThrower.calculateThrowPosition(mockPlayer);

      // Expected: X = 10 + 0*3 = 10
      // Y = 5 - 1.75 = 3.25 (subtracts player height)
      // Z = 10 + 1*3 = 13
      expect(throwPosition.x).toBeCloseTo(10, 5);
      expect(throwPosition.y).toBeCloseTo(3.25, 5);
      expect(throwPosition.z).toBeCloseTo(13, 5);
    });

    it('should calculate position based on camera direction', () => {
      // Change camera direction to look along +X axis
      mockPlayer.camera.getWorldDirection = function(target) {
        target.set(1, 0, 0);
        return target;
      };

      const throwPosition = ItemThrower.calculateThrowPosition(mockPlayer);

      // Expected: X = 10 + 1*3 = 13
      // Y = 5 - 1.75 = 3.25
      // Z = 10 + 0*3 = 10
      expect(throwPosition.x).toBeCloseTo(13, 5);
      expect(throwPosition.y).toBeCloseTo(3.25, 5);
      expect(throwPosition.z).toBeCloseTo(10, 5);
    });

    it('should use THROW_DISTANCE constant', () => {
      expect(ItemThrower.THROW_DISTANCE).toBe(3.0);
    });

    it('should subtract player height from Y position', () => {
      // Player at ground level
      mockPlayer.position.y = 0;

      const throwPosition = ItemThrower.calculateThrowPosition(mockPlayer);

      // Y = 0 - 1.75 = -1.75
      expect(throwPosition.y).toBeCloseTo(-1.75, 5);
    });

    it('should handle diagonal camera directions', () => {
      // Look diagonally (normalized)
      mockPlayer.camera.getWorldDirection = function(target) {
        target.set(1, 0, 1);
        target.normalize();
        return target;
      };

      const throwPosition = ItemThrower.calculateThrowPosition(mockPlayer);

      // Direction is (1/√2, 0, 1/√2), distance is 3
      // Expected X: 10 + 3 * (1/√2) ≈ 10 + 2.121 = 12.121
      // Expected Y: 5 - 1.75 = 3.25
      // Expected Z: 10 + 3 * (1/√2) ≈ 10 + 2.121 = 12.121
      expect(throwPosition.x).toBeCloseTo(12.121, 2);
      expect(throwPosition.y).toBeCloseTo(3.25, 5);
      expect(throwPosition.z).toBeCloseTo(12.121, 2);
    });

    it('should handle upward camera directions', () => {
      // Look upward at 45 degrees
      mockPlayer.camera.getWorldDirection = function(target) {
        target.set(0, 1, 1);
        target.normalize();
        return target;
      };

      const throwPosition = ItemThrower.calculateThrowPosition(mockPlayer);

      // Y calculation: player.position.y - player.height = 5 - 1.75 = 3.25
      // Note: Y direction component is not used in the calculation
      expect(throwPosition.y).toBeCloseTo(3.25, 5);
      // Z should be affected by direction: 10 + (1/√2)*3 ≈ 12.121
      expect(throwPosition.z).toBeCloseTo(12.121, 2);
    });
  });

  describe('throwItem', () => {
    beforeEach(() => {
      // Add some items to inventory
      mockInventory.addItem(3, 10); // 10 stone blocks
      mockInventory.addItem(1, 5);  // 5 grass blocks
    });

    it('should return false when no item selected', () => {
      // No item selected (null)
      mockToolbarUI.selectedBlockId = null;

      const result = ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);

      expect(result).toBe(false);
      expect(mockWorld.spawnedItems.length).toBe(0);
    });

    it('should return false when pickaxe selected', () => {
      // Pickaxe is represented by null in getSelectedBlockId
      mockToolbarUI.selectedBlockId = null;

      const result = ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);

      expect(result).toBe(false);
      expect(mockWorld.spawnedItems.length).toBe(0);
    });

    it('should return false when quantity is 0', () => {
      // Select a block that doesn't exist in inventory
      mockToolbarUI.selectedBlockId = 99;

      const result = ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);

      expect(result).toBe(false);
      expect(mockWorld.spawnedItems.length).toBe(0);
    });

    it('should remove item from inventory on success', () => {
      // Select stone (blockId 3) which has 10 in inventory
      mockToolbarUI.selectedBlockId = 3;

      const initialQuantity = mockInventory.getQuantity(3);
      expect(initialQuantity).toBe(10);

      const result = ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);

      expect(result).toBe(true);
      expect(mockInventory.getQuantity(3)).toBe(9);
    });

    it('should spawn DroppedItem at calculated position', () => {
      mockToolbarUI.selectedBlockId = 3;

      const result = ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);

      expect(result).toBe(true);
      expect(mockWorld.spawnedItems.length).toBe(1);
      
      const spawnedItem = mockWorld.spawnedItems[0];
      expect(spawnedItem.blockId).toBe(3);
      
      // Position should be 3 blocks in front of player
      // X = 10, Y = 5 - 1.75 = 3.25, Z = 13
      expect(spawnedItem.position.x).toBeCloseTo(10, 5);
      expect(spawnedItem.position.y).toBeCloseTo(3.25, 5);
      expect(spawnedItem.position.z).toBeCloseTo(13, 5);
    });

    it('should update toolbar display', () => {
      mockToolbarUI.selectedBlockId = 3;
      mockToolbarUI.renderCalled = false;

      ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);

      expect(mockToolbarUI.renderCalled).toBe(true);
    });

    it('should save inventory to localStorage', () => {
      mockToolbarUI.selectedBlockId = 3;

      ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);

      // Verify localStorage was updated
      const savedData = localStorage.getItem('minecraft_inventory');
      expect(savedData).toBeTruthy();
      
      const parsed = JSON.parse(savedData);
      expect(parsed.items['3']).toBe(9); // 10 - 1 = 9
    });

    it('should throw multiple items sequentially', () => {
      mockToolbarUI.selectedBlockId = 3;

      // Throw 3 times
      ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);
      ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);
      ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);

      expect(mockInventory.getQuantity(3)).toBe(7); // 10 - 3 = 7
      expect(mockWorld.spawnedItems.length).toBe(3);
    });

    it('should return false when trying to throw last item after it runs out', () => {
      // Add only 1 item
      mockInventory.clear();
      mockInventory.addItem(3, 1);
      mockToolbarUI.selectedBlockId = 3;

      // First throw should succeed
      const result1 = ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);
      expect(result1).toBe(true);
      expect(mockInventory.getQuantity(3)).toBe(0);

      // Second throw should fail (no items left)
      const result2 = ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);
      expect(result2).toBe(false);
      expect(mockWorld.spawnedItems.length).toBe(1); // Only one item spawned
    });

    it('should handle different block types', () => {
      // Throw grass (blockId 1)
      mockToolbarUI.selectedBlockId = 1;
      ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);

      // Throw stone (blockId 3)
      mockToolbarUI.selectedBlockId = 3;
      ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);

      expect(mockWorld.spawnedItems.length).toBe(2);
      expect(mockWorld.spawnedItems[0].blockId).toBe(1);
      expect(mockWorld.spawnedItems[1].blockId).toBe(3);
    });

    it('should throw items in the direction player is facing', () => {
      // Change player direction to look along -X axis
      mockPlayer.camera.getWorldDirection = function(target) {
        target.set(-1, 0, 0);
        return target;
      };

      mockToolbarUI.selectedBlockId = 3;
      ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);

      const spawnedItem = mockWorld.spawnedItems[0];
      
      // Should spawn at (10-3, 6.6, 10) = (7, 6.6, 10)
      expect(spawnedItem.position.x).toBeCloseTo(7, 5);
      expect(spawnedItem.position.z).toBeCloseTo(10, 5);
    });

    it('should not throw if removeItem fails', () => {
      // This is a safety check - if removeItem returns false, don't spawn
      mockToolbarUI.selectedBlockId = 3;
      
      // Mock removeItem to fail
      const originalRemoveItem = mockInventory.removeItem.bind(mockInventory);
      mockInventory.removeItem = function() {
        return false; // Simulate failure
      };

      const result = ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);

      expect(result).toBe(false);
      expect(mockWorld.spawnedItems.length).toBe(0);

      // Restore original method
      mockInventory.removeItem = originalRemoveItem;
    });

    it('should return true only on successful throw', () => {
      mockToolbarUI.selectedBlockId = 3;

      const result = ItemThrower.throwItem(mockPlayer, mockWorld, mockToolbarUI);

      expect(result).toBe(true);
      expect(mockInventory.getQuantity(3)).toBe(9);
      expect(mockWorld.spawnedItems.length).toBe(1);
      expect(mockToolbarUI.renderCalled).toBe(true);
    });
  });
});
