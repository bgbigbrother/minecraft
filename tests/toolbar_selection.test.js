/**
 * Tests for ToolbarUI selection tracking functionality
 * Verifies that toolbar slot selection works correctly
 */

import { ToolbarUI } from '../scripts/inventory/ToolbarUI';
import { InventoryManager } from '../scripts/inventory/InventoryManager';

// Mock DOM elements
beforeEach(() => {
  // Create toolbar container
  document.body.innerHTML = `
    <div id="toolbar">
      <img class="toolbar-icon selected" id="toolbar-0" src="textures/pickaxe.png" />
      <img class="toolbar-icon" id="toolbar-1" src="textures/empty_slot.png" />
      <img class="toolbar-icon" id="toolbar-2" src="textures/empty_slot.png" />
      <img class="toolbar-icon" id="toolbar-3" src="textures/empty_slot.png" />
      <img class="toolbar-icon" id="toolbar-4" src="textures/empty_slot.png" />
      <img class="toolbar-icon" id="toolbar-5" src="textures/empty_slot.png" />
      <img class="toolbar-icon" id="toolbar-6" src="textures/empty_slot.png" />
      <img class="toolbar-icon" id="toolbar-7" src="textures/empty_slot.png" />
      <img class="toolbar-icon" id="toolbar-8" src="textures/empty_slot.png" />
    </div>
  `;
});

describe('ToolbarUI Selection Tracking', () => {
  describe('setSelectedSlot', () => {
    test('updates selectedSlot property', () => {
      const inventory = new InventoryManager();
      const toolbarUI = new ToolbarUI(inventory);
      
      expect(toolbarUI.selectedSlot).toBe(0); // Default is pickaxe
      
      toolbarUI.setSelectedSlot(3);
      expect(toolbarUI.selectedSlot).toBe(3);
    });

    test('removes selection from previous slot', () => {
      const inventory = new InventoryManager();
      const toolbarUI = new ToolbarUI(inventory);
      
      // Start with slot 0 selected
      expect(document.getElementById('toolbar-0').classList.contains('selected')).toBe(true);
      
      // Select slot 2
      toolbarUI.setSelectedSlot(2);
      
      // Slot 0 should no longer be selected
      expect(document.getElementById('toolbar-0').classList.contains('selected')).toBe(false);
    });

    test('adds selection to new slot', () => {
      const inventory = new InventoryManager();
      const toolbarUI = new ToolbarUI(inventory);
      
      toolbarUI.setSelectedSlot(5);
      
      expect(document.getElementById('toolbar-5').classList.contains('selected')).toBe(true);
    });

    test('validates slot index range', () => {
      const inventory = new InventoryManager();
      const toolbarUI = new ToolbarUI(inventory);
      
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      toolbarUI.setSelectedSlot(-1);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid slot index: -1. Must be 0-8.');
      
      toolbarUI.setSelectedSlot(10);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid slot index: 10. Must be 0-8.');
      
      consoleSpy.mockRestore();
    });

    test('updates player activeBlockId when player reference exists', () => {
      const inventory = new InventoryManager();
      inventory.addItem(3, 5); // Add stone blocks
      
      const toolbarUI = new ToolbarUI(inventory);
      toolbarUI.render(); // Populate slot contents
      
      // Mock player object
      const mockPlayer = {
        activeBlockId: 0,
        tool: { container: { visible: true } }
      };
      toolbarUI.player = mockPlayer;
      
      // Select slot 1 (which has stone)
      toolbarUI.setSelectedSlot(1);
      
      expect(mockPlayer.activeBlockId).toBe(3); // Stone block ID
      expect(mockPlayer.tool.container.visible).toBe(false);
    });

    test('switches to pickaxe when selecting empty slot', () => {
      const inventory = new InventoryManager();
      const toolbarUI = new ToolbarUI(inventory);
      toolbarUI.render();
      
      // Mock player object
      const mockPlayer = {
        activeBlockId: 3,
        tool: { container: { visible: false } }
      };
      toolbarUI.player = mockPlayer;
      
      // Select empty slot 5
      toolbarUI.setSelectedSlot(5);
      
      expect(mockPlayer.activeBlockId).toBe(0); // Pickaxe
      expect(mockPlayer.tool.container.visible).toBe(true);
    });
  });

  describe('getSelectedBlockId', () => {
    test('returns null for pickaxe slot (slot 0)', () => {
      const inventory = new InventoryManager();
      const toolbarUI = new ToolbarUI(inventory);
      
      toolbarUI.setSelectedSlot(0);
      expect(toolbarUI.getSelectedBlockId()).toBeNull();
    });

    test('returns correct blockId for selected slot with item', () => {
      const inventory = new InventoryManager();
      inventory.addItem(3, 10); // Stone
      inventory.addItem(1, 5);  // Grass
      
      const toolbarUI = new ToolbarUI(inventory);
      toolbarUI.render(); // Populate slot contents
      
      toolbarUI.setSelectedSlot(1);
      expect(toolbarUI.getSelectedBlockId()).toBe(3); // Stone in slot 1
      
      toolbarUI.setSelectedSlot(2);
      expect(toolbarUI.getSelectedBlockId()).toBe(1); // Grass in slot 2
    });

    test('returns null for empty slot', () => {
      const inventory = new InventoryManager();
      const toolbarUI = new ToolbarUI(inventory);
      toolbarUI.render();
      
      toolbarUI.setSelectedSlot(5);
      expect(toolbarUI.getSelectedBlockId()).toBeNull();
    });

    test('returns null after slot becomes empty', () => {
      const inventory = new InventoryManager();
      inventory.addItem(3, 1); // One stone block
      
      const toolbarUI = new ToolbarUI(inventory);
      toolbarUI.render();
      
      toolbarUI.setSelectedSlot(1);
      expect(toolbarUI.getSelectedBlockId()).toBe(3);
      
      // Remove the item
      inventory.removeItem(3, 1);
      toolbarUI.render();
      
      // Should now return null
      expect(toolbarUI.getSelectedBlockId()).toBeNull();
    });
  });

  describe('Visual highlight', () => {
    test('selected slot has "selected" CSS class', () => {
      const inventory = new InventoryManager();
      const toolbarUI = new ToolbarUI(inventory);
      
      toolbarUI.setSelectedSlot(4);
      
      const slot4 = document.getElementById('toolbar-4');
      expect(slot4.classList.contains('selected')).toBe(true);
    });

    test('only one slot has "selected" class at a time', () => {
      const inventory = new InventoryManager();
      const toolbarUI = new ToolbarUI(inventory);
      
      toolbarUI.setSelectedSlot(2);
      toolbarUI.setSelectedSlot(7);
      
      // Count how many slots have the "selected" class
      const selectedSlots = document.querySelectorAll('.toolbar-icon.selected');
      expect(selectedSlots.length).toBe(1);
      expect(selectedSlots[0].id).toBe('toolbar-7');
    });

    test('selection persists across multiple changes', () => {
      const inventory = new InventoryManager();
      const toolbarUI = new ToolbarUI(inventory);
      
      toolbarUI.setSelectedSlot(1);
      toolbarUI.setSelectedSlot(3);
      toolbarUI.setSelectedSlot(6);
      
      expect(document.getElementById('toolbar-6').classList.contains('selected')).toBe(true);
      expect(document.getElementById('toolbar-1').classList.contains('selected')).toBe(false);
      expect(document.getElementById('toolbar-3').classList.contains('selected')).toBe(false);
    });
  });

  describe('Integration with inventory changes', () => {
    test('maintains selection when inventory is updated', () => {
      const inventory = new InventoryManager();
      inventory.addItem(3, 5);
      
      const toolbarUI = new ToolbarUI(inventory);
      toolbarUI.render();
      
      toolbarUI.setSelectedSlot(1);
      expect(toolbarUI.selectedSlot).toBe(1);
      
      // Add more items
      inventory.addItem(1, 3);
      toolbarUI.render();
      
      // Selection should remain on slot 1
      expect(toolbarUI.selectedSlot).toBe(1);
      expect(document.getElementById('toolbar-1').classList.contains('selected')).toBe(true);
    });

    test('switches to pickaxe when selected slot becomes empty', () => {
      const inventory = new InventoryManager();
      inventory.addItem(3, 1); // One stone
      
      const toolbarUI = new ToolbarUI(inventory);
      toolbarUI.render();
      
      // Mock player
      const mockPlayer = {
        activeBlockId: 3,
        tool: { container: { visible: false } }
      };
      toolbarUI.player = mockPlayer;
      
      toolbarUI.setSelectedSlot(1);
      expect(toolbarUI.selectedSlot).toBe(1);
      
      // Remove the last stone
      inventory.removeItem(3, 1);
      toolbarUI.render();
      
      // Should switch to pickaxe
      expect(toolbarUI.selectedSlot).toBe(0);
      expect(mockPlayer.activeBlockId).toBe(0);
    });
  });
});
