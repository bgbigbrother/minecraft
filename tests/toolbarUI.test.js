/**
 * Unit tests for ToolbarUI class
 * Tests icon mapping, rendering, slot updates, and edge cases
 */

import { ToolbarUI } from '../scripts/inventory/ToolbarUI';
import { InventoryManager } from '../scripts/inventory/InventoryManager';

// Mock DOM elements
function setupMockDOM() {
  // Create toolbar container
  const toolbar = document.createElement('div');
  toolbar.id = 'toolbar';
  
  // Create toolbar slots 0-8
  for (let i = 0; i <= 8; i++) {
    const img = document.createElement('img');
    img.id = `toolbar-${i}`;
    img.className = 'toolbar-icon';
    if (i === 0) {
      img.src = 'textures/pickaxe.png';
      img.classList.add('selected');
    }
    toolbar.appendChild(img);
  }
  
  document.body.appendChild(toolbar);
  return toolbar;
}

function cleanupMockDOM() {
  const toolbar = document.getElementById('toolbar');
  if (toolbar) {
    toolbar.remove();
  }
}

describe('ToolbarUI', () => {
  let inventoryManager;
  let toolbarUI;
  let originalLocalStorage;
  
  beforeEach(() => {
    setupMockDOM();
    
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
    
    inventoryManager = new InventoryManager();
    toolbarUI = new ToolbarUI(inventoryManager);
  });
  
  afterEach(() => {
    cleanupMockDOM();
    global.localStorage = originalLocalStorage;
  });
  
  // Test createIconMap() returns correct texture paths for all block IDs
  describe('createIconMap', () => {
    test('returns a Map with correct texture paths for all block IDs', () => {
      const iconMap = toolbarUI.createIconMap();
      
      // Verify it's a Map
      expect(iconMap instanceof Map).toBe(true);
      
      // Test key block types with their expected texture paths
      expect(iconMap.get(1)).toBe('textures/grass.png');
      expect(iconMap.get(2)).toBe('textures/dirt.png');
      expect(iconMap.get(3)).toBe('textures/stone.png');
      expect(iconMap.get(4)).toBe('textures/coal_ore.png');
      expect(iconMap.get(5)).toBe('textures/iron_ore.png');
      expect(iconMap.get(6)).toBe('textures/tree_top.png');
      expect(iconMap.get(7)).toBe('textures/leaves.png');
      expect(iconMap.get(8)).toBe('textures/sand.png');
      expect(iconMap.get(10)).toBe('textures/snow.png');
      expect(iconMap.get(11)).toBe('textures/jungle_tree_top.png');
      expect(iconMap.get(12)).toBe('textures/jungle_leaves.png');
      expect(iconMap.get(13)).toBe('textures/cactus_top.png');
      expect(iconMap.get(14)).toBe('textures/grass.png');
    });
    
    test('uses top texture for blocks with multiple textures', () => {
      const iconMap = toolbarUI.createIconMap();
      
      // Tree uses tree_top.png (not tree_side.png)
      expect(iconMap.get(6)).toBe('textures/tree_top.png');
      
      // Jungle tree uses jungle_tree_top.png
      expect(iconMap.get(11)).toBe('textures/jungle_tree_top.png');
      
      // Cactus uses cactus_top.png
      expect(iconMap.get(13)).toBe('textures/cactus_top.png');
      
      // Snow uses snow.png (top texture)
      expect(iconMap.get(10)).toBe('textures/snow.png');
    });
    
    test('contains mappings for all common block types', () => {
      const iconMap = toolbarUI.createIconMap();
      
      // Verify we have mappings for at least the main block types
      expect(iconMap.size).toBeGreaterThanOrEqual(10);
    });
  });
  
  // Test render() updates correct number of slots based on inventory size
  describe('render', () => {
    test('updates correct number of slots based on inventory size', () => {
      // Add 3 items
      inventoryManager.addItem(1, 10); // grass
      inventoryManager.addItem(2, 5);  // dirt
      inventoryManager.addItem(3, 8);  // stone
      
      toolbarUI.render();
      
      // First 3 slots should have items
      expect(document.getElementById('toolbar-1').src).toContain('grass.png');
      expect(document.getElementById('toolbar-2').src).toContain('dirt.png');
      expect(document.getElementById('toolbar-3').src).toContain('stone.png');
      expect(document.getElementById('toolbar-1').style.opacity).toBe('1');
      expect(document.getElementById('toolbar-2').style.opacity).toBe('1');
      expect(document.getElementById('toolbar-3').style.opacity).toBe('1');
    });
    
    test('displays items in localStorage order', () => {
      // Add items in specific order
      inventoryManager.addItem(3, 5);  // stone first
      inventoryManager.addItem(1, 10); // grass second
      inventoryManager.addItem(4, 2);  // coal ore third
      
      toolbarUI.render();
      
      // Should display in the order they were added
      expect(document.getElementById('toolbar-1').src).toContain('stone.png');
      expect(document.getElementById('toolbar-2').src).toContain('grass.png');
      expect(document.getElementById('toolbar-3').src).toContain('coal_ore.png');
    });
    
    test('updates toolbar when inventory changes', () => {
      inventoryManager.addItem(1, 10);
      toolbarUI.render();
      
      expect(document.getElementById('toolbar-1').src).toContain('grass.png');
      
      // Add another item
      inventoryManager.addItem(2, 5);
      toolbarUI.render();
      
      expect(document.getElementById('toolbar-1').src).toContain('grass.png');
      expect(document.getElementById('toolbar-2').src).toContain('dirt.png');
    });
    
    test('handles empty inventory correctly', () => {
      // Render with empty inventory
      toolbarUI.render();
      
      // All slots should be empty
      for (let i = 1; i <= 8; i++) {
        const slot = document.getElementById(`toolbar-${i}`);
        expect(slot.src).toContain('empty_slot.png');
        expect(slot.style.opacity).toBe('0.5');
      }
    });
    
    test('does not modify toolbar-0 (pickaxe)', () => {
      const pickaxeSlot = document.getElementById('toolbar-0');
      const originalSrc = pickaxeSlot.src;
      
      inventoryManager.addItem(1, 10);
      inventoryManager.addItem(2, 5);
      toolbarUI.render();
      
      // Pickaxe should remain unchanged
      expect(pickaxeSlot.src).toBe(originalSrc);
      expect(pickaxeSlot.src).toContain('pickaxe.png');
    });
  });
  
  // Test updateSlot() sets correct src and quantity text
  describe('updateSlot', () => {
    test('sets correct src and quantity text for valid item', () => {
      toolbarUI.updateSlot(1, 3, 42); // stone, quantity 42
      
      const slot = document.getElementById('toolbar-1');
      expect(slot.src).toContain('stone.png');
      expect(slot.style.opacity).toBe('1');
      
      // Check quantity overlay exists and has correct text
      const quantityOverlay = slot.parentElement.querySelector('#quantity-1');
      expect(quantityOverlay).toBeTruthy();
      expect(quantityOverlay.textContent).toBe('42');
    });
    
    test('updates quantity text when called multiple times', () => {
      toolbarUI.updateSlot(1, 3, 10);
      let quantityOverlay = document.querySelector('#quantity-1');
      expect(quantityOverlay.textContent).toBe('10');
      
      toolbarUI.updateSlot(1, 3, 5);
      quantityOverlay = document.querySelector('#quantity-1');
      expect(quantityOverlay.textContent).toBe('5');
    });
    
    test('clears slot when blockId is null', () => {
      // First add an item
      toolbarUI.updateSlot(1, 3, 10);
      
      // Then clear it
      toolbarUI.updateSlot(1, null, 0);
      
      const slot = document.getElementById('toolbar-1');
      expect(slot.src).toContain('empty_slot.png');
      expect(slot.style.opacity).toBe('0.5');
      
      // Quantity overlay should be removed
      const quantityOverlay = slot.parentElement.querySelector('#quantity-1');
      expect(quantityOverlay).toBeFalsy();
    });
    
    test('clears slot when quantity is 0', () => {
      toolbarUI.updateSlot(1, 3, 10);
      toolbarUI.updateSlot(1, 3, 0);
      
      const slot = document.getElementById('toolbar-1');
      expect(slot.src).toContain('empty_slot.png');
      expect(slot.style.opacity).toBe('0.5');
    });
    
    test('blocks attempts to modify toolbar-0 (pickaxe)', () => {
      const pickaxeSlot = document.getElementById('toolbar-0');
      const originalSrc = pickaxeSlot.src;
      
      toolbarUI.updateSlot(0, 3, 10);
      
      // Pickaxe should remain unchanged
      expect(pickaxeSlot.src).toBe(originalSrc);
      expect(pickaxeSlot.src).toContain('pickaxe.png');
    });
    
    test('handles invalid block IDs gracefully', () => {
      toolbarUI.updateSlot(1, 999, 10); // Non-existent block ID
      
      const slot = document.getElementById('toolbar-1');
      expect(slot.src === '' || slot.src === 'http://localhost/').toBe(true);
      expect(slot.style.opacity).toBe('0.3');
    });
  });
  
  // Test clearToolbar() resets all slots except pickaxe
  describe('clearToolbar', () => {
    test('resets all item slots (1-8)', () => {
      // Add items to all slots
      for (let i = 1; i <= 8; i++) {
        inventoryManager.addItem(i, 10);
      }
      toolbarUI.render();
      
      // Clear toolbar
      toolbarUI.clearToolbar();
      
      // All item slots should be empty
      for (let i = 1; i <= 8; i++) {
        const slot = document.getElementById(`toolbar-${i}`);
        expect(slot.src).toContain('empty_slot.png');
        expect(slot.style.opacity).toBe('0.5');
        
        // Quantity overlays should be removed
        const quantityOverlay = slot.parentElement.querySelector(`#quantity-${i}`);
        expect(quantityOverlay).toBeFalsy();
      }
    });
    
    test('preserves toolbar-0 (pickaxe)', () => {
      const pickaxeSlot = document.getElementById('toolbar-0');
      const originalSrc = pickaxeSlot.src;
      
      // Add items and render
      inventoryManager.addItem(1, 10);
      inventoryManager.addItem(2, 5);
      toolbarUI.render();
      
      // Clear toolbar
      toolbarUI.clearToolbar();
      
      // Pickaxe should remain unchanged
      expect(pickaxeSlot.src).toBe(originalSrc);
      expect(pickaxeSlot.src).toContain('pickaxe.png');
    });
    
    test('can be called multiple times safely', () => {
      inventoryManager.addItem(1, 10);
      toolbarUI.render();
      
      toolbarUI.clearToolbar();
      toolbarUI.clearToolbar();
      toolbarUI.clearToolbar();
      
      // Should still be cleared
      const slot1 = document.getElementById('toolbar-1');
      expect(slot1.src).toContain('empty_slot.png');
      expect(slot1.style.opacity).toBe('0.5');
    });
  });
  
  // Test toolbar handles empty inventory correctly
  describe('empty inventory handling', () => {
    test('displays empty slots when inventory is empty', () => {
      toolbarUI.render();
      
      // All slots should be empty
      for (let i = 1; i <= 8; i++) {
        const slot = document.getElementById(`toolbar-${i}`);
        expect(slot.src).toContain('empty_slot.png');
        expect(slot.style.opacity).toBe('0.5');
      }
    });
  });
  
  // Test toolbar limits display to 8 items when more exist
  describe('slot limit handling', () => {
    test('limits display to 8 items when more than 8 exist', () => {
      // Add 10 different items
      for (let i = 1; i <= 10; i++) {
        inventoryManager.addItem(i, 5);
      }
      
      toolbarUI.render();
      
      // Only first 8 should be displayed
      for (let i = 1; i <= 8; i++) {
        const slot = document.getElementById(`toolbar-${i}`);
        expect(slot.src).not.toBe('');
        expect(slot.style.opacity).toBe('1');
      }
      
      // Items 9 and 10 should not be visible (no slot for them)
      // This is correct behavior - toolbar only has 8 slots
    });
    
    test('displays exactly 8 items when inventory has exactly 8', () => {
      // Add exactly 8 items
      for (let i = 1; i <= 8; i++) {
        inventoryManager.addItem(i, 5);
      }
      
      toolbarUI.render();
      
      // All 8 slots should be filled
      for (let i = 1; i <= 8; i++) {
        const slot = document.getElementById(`toolbar-${i}`);
        expect(slot.src).not.toBe('');
        expect(slot.style.opacity).toBe('1');
      }
    });
  });
  
  // Edge cases
  describe('edge cases', () => {
    test('displays empty slots when fewer than 8 items exist', () => {
      // Add only 3 items
      inventoryManager.addItem(1, 10); // grass
      inventoryManager.addItem(2, 5);  // dirt
      inventoryManager.addItem(3, 8);  // stone
      
      toolbarUI.render();
      
      // First 3 slots should have items
      expect(document.getElementById('toolbar-1').src).toContain('grass.png');
      expect(document.getElementById('toolbar-2').src).toContain('dirt.png');
      expect(document.getElementById('toolbar-3').src).toContain('stone.png');
      
      // Remaining slots should be empty
      const slot4 = document.getElementById('toolbar-4');
      expect(slot4.src).toContain('empty_slot.png');
      expect(slot4.style.opacity).toBe('0.5');
      
      const slot5 = document.getElementById('toolbar-5');
      expect(slot5.src).toContain('empty_slot.png');
      expect(slot5.style.opacity).toBe('0.5');
    });
    
    test('toolbar updates when last item of a type is placed', () => {
      // Add a single item
      inventoryManager.addItem(3, 1); // 1 stone
      toolbarUI.render();
      
      // Verify item is displayed
      expect(document.getElementById('toolbar-1').src).toContain('stone.png');
      
      // Remove the last item (simulating placement)
      inventoryManager.removeItem(3, 1);
      toolbarUI.render();
      
      // Slot should now be empty
      const slot1 = document.getElementById('toolbar-1');
      expect(slot1.src).toContain('empty_slot.png');
      expect(slot1.style.opacity).toBe('0.5');
    });
    
    test('handles zero quantity items correctly', () => {
      inventoryManager.addItem(1, 5);
      toolbarUI.render();
      
      // Manually set quantity to 0 (edge case)
      toolbarUI.updateSlot(1, 1, 0);
      
      // Slot should be cleared
      const slot1 = document.getElementById('toolbar-1');
      expect(slot1.src).toContain('empty_slot.png');
      expect(slot1.style.opacity).toBe('0.5');
    });
    
    test('handles negative quantity items correctly', () => {
      inventoryManager.addItem(1, 5);
      toolbarUI.render();
      
      // Manually set negative quantity (edge case)
      toolbarUI.updateSlot(1, 1, -5);
      
      // Slot should be cleared
      const slot1 = document.getElementById('toolbar-1');
      expect(slot1.src).toContain('empty_slot.png');
      expect(slot1.style.opacity).toBe('0.5');
    });
    
    test('filters out zero quantity items from inventory', () => {
      // Add items
      inventoryManager.addItem(1, 10);
      inventoryManager.addItem(2, 5);
      
      // Manually set one to zero in the Map (edge case)
      inventoryManager.items.set(2, 0);
      
      toolbarUI.render();
      
      // Only item with positive quantity should be displayed
      expect(document.getElementById('toolbar-1').src).toContain('grass.png');
      
      // Second slot should be empty since item 2 has zero quantity
      const slot2 = document.getElementById('toolbar-2');
      expect(slot2.src).toContain('empty_slot.png');
      expect(slot2.style.opacity).toBe('0.5');
    });
  });
});
