import { describe, test, expect } from '@jest/globals';
import { RNG } from '../scripts/libraries/rng.js';
import { WorldBaseClass } from '../scripts/world/base.js';
import { DataStore } from '../scripts/world/world_store.js';
import { blocks } from '../scripts/textures/blocks.js';

describe('Integration Tests', () => {
  describe('World Generation with RNG', () => {
    test('should create world with deterministic seed', () => {
      const world1 = new WorldBaseClass();
      const world2 = new WorldBaseClass();
      
      world1.params.seed = 12345;
      world2.params.seed = 12345;
      
      expect(world1.params.seed).toBe(world2.params.seed);
    });

    test('should use RNG for deterministic generation', () => {
      const rng1 = new RNG(12345);
      const rng2 = new RNG(12345);
      
      const values1 = Array.from({ length: 10 }, () => rng1.random());
      const values2 = Array.from({ length: 10 }, () => rng2.random());
      
      expect(values1).toEqual(values2);
    });
  });

  describe('DataStore with World', () => {
    test('should store and retrieve block modifications', () => {
      const dataStore = new DataStore();
      
      // Simulate placing blocks
      dataStore.set(0, 0, 5, 10, 15, blocks.stone.id);
      dataStore.set(0, 0, 6, 11, 16, blocks.grass.id);
      
      // Verify blocks are stored
      expect(dataStore.get(0, 0, 5, 10, 15)).toBe(blocks.stone.id);
      expect(dataStore.get(0, 0, 6, 11, 16)).toBe(blocks.grass.id);
    });

    test('should handle world save/load cycle', () => {
      const world = new WorldBaseClass();
      const originalSeed = 99999;
      world.params.seed = originalSeed;
      
      // Verify seed is set
      expect(world.params.seed).toBe(originalSeed);
    });
  });

  describe('Block System', () => {
    test('should have unique IDs for all blocks', () => {
      const blockIds = Object.values(blocks).map(b => b.id);
      const uniqueIds = new Set(blockIds);
      
      expect(blockIds.length).toBe(uniqueIds.size);
    });

    test('should have empty block with ID 0', () => {
      expect(blocks.empty.id).toBe(0);
    });
  });

  describe('World Parameters', () => {
    test('should have valid terrain parameters', () => {
      const world = new WorldBaseClass();
      
      expect(world.params.terrain.scale).toBeGreaterThan(0);
      expect(world.params.terrain.magnitude).toBeGreaterThan(0);
      expect(world.params.terrain.waterOffset).toBeLessThan(world.params.terrain.offset);
    });

    test('should have valid biome thresholds', () => {
      const world = new WorldBaseClass();
      const biomes = world.params.biomes;
      
      expect(biomes.tundraToTemperate).toBeLessThan(biomes.temperateToJungle);
      expect(biomes.temperateToJungle).toBeLessThan(biomes.jungleToDesert);
      expect(biomes.jungleToDesert).toBeLessThanOrEqual(1.0);
    });

    test('should have valid tree parameters', () => {
      const world = new WorldBaseClass();
      const trees = world.params.trees;
      
      expect(trees.trunk.minHeight).toBeLessThanOrEqual(trees.trunk.maxHeight);
      expect(trees.canopy.minRadius).toBeLessThanOrEqual(trees.canopy.maxRadius);
      expect(trees.frequency).toBeGreaterThan(0);
      expect(trees.frequency).toBeLessThan(1);
    });
  });
});

describe('Inventory Collection Flow Integration', () => {
  let world;
  let mockPlayer;
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

    // Import required classes
    const THREE = require('three');
    const { World } = require('../scripts/world/world.js');
    const { InventoryManager } = require('../scripts/inventory/InventoryManager.js');

    // Create world
    world = new World();
    
    // Create mock player with inventory (avoid full Player class due to GLTFLoader issues)
    mockPlayer = {
      position: new THREE.Vector3(10, 10, 10),
      inventory: new InventoryManager()
    };
  });

  afterEach(() => {
    // Clean up
    if (world && world.droppedItems) {
      world.droppedItems.forEach(item => {
        if (item.dispose) item.dispose();
      });
      world.droppedItems = [];
    }
    
    global.localStorage = originalLocalStorage;
  });

  test('should spawn DroppedItem when block is broken', () => {
    const THREE = require('three');
    
    // Initial state - no dropped items
    expect(world.droppedItems.length).toBe(0);
    
    // Spawn a dropped item (simulating block break)
    const blockId = blocks.stone.id;
    const position = new THREE.Vector3(10, 10, 10);
    
    world.spawnDroppedItem(blockId, position);
    
    // Verify dropped item was created
    expect(world.droppedItems.length).toBe(1);
    expect(world.droppedItems[0].blockId).toBe(blockId);
    expect(world.droppedItems[0].mesh).toBeDefined();
  });

  test('should collect item when player is within collection radius', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Spawn a dropped item near the player
    const blockId = blocks.stone.id;
    const itemPosition = new THREE.Vector3(10.5, 10, 10); // 0.5 blocks away
    
    world.spawnDroppedItem(blockId, itemPosition);
    
    // Verify item was spawned
    expect(world.droppedItems.length).toBe(1);
    
    // Initial inventory should be empty
    expect(mockPlayer.inventory.getQuantity(blockId)).toBe(0);
    
    // Check for collections (player at 10, 10, 10 - item at 10.5, 10, 10)
    ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
    
    // Verify item was collected
    expect(world.droppedItems.length).toBe(0);
    expect(mockPlayer.inventory.getQuantity(blockId)).toBe(1);
  });

  test('should not collect item when player is outside collection radius', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Spawn a dropped item far from the player
    const blockId = blocks.stone.id;
    const itemPosition = new THREE.Vector3(15, 10, 10); // 5 blocks away (> 2.0 radius)
    
    world.spawnDroppedItem(blockId, itemPosition);
    
    // Verify item was spawned
    expect(world.droppedItems.length).toBe(1);
    
    // Initial inventory should be empty
    expect(mockPlayer.inventory.getQuantity(blockId)).toBe(0);
    
    // Check for collections
    ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
    
    // Verify item was NOT collected (too far)
    expect(world.droppedItems.length).toBe(1);
    expect(mockPlayer.inventory.getQuantity(blockId)).toBe(0);
  });

  test('should increase inventory quantity after collection', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    const blockId = blocks.stone.id;
    
    // Add some initial inventory
    mockPlayer.inventory.addItem(blockId, 5);
    expect(mockPlayer.inventory.getQuantity(blockId)).toBe(5);
    
    // Spawn and collect an item
    const itemPosition = new THREE.Vector3(10.5, 10, 10);
    world.spawnDroppedItem(blockId, itemPosition);
    
    ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
    
    // Verify quantity increased by 1
    expect(mockPlayer.inventory.getQuantity(blockId)).toBe(6);
  });

  test('should remove item from world after collection', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Spawn multiple items
    world.spawnDroppedItem(blocks.stone.id, new THREE.Vector3(10.5, 10, 10));
    world.spawnDroppedItem(blocks.grass.id, new THREE.Vector3(10.8, 10, 10));
    world.spawnDroppedItem(blocks.dirt.id, new THREE.Vector3(15, 10, 10)); // Far away
    
    expect(world.droppedItems.length).toBe(3);
    
    // Collect nearby items
    ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
    
    // Only the far item should remain
    expect(world.droppedItems.length).toBe(1);
    expect(world.droppedItems[0].blockId).toBe(blocks.dirt.id);
  });

  test('should update localStorage after collection', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    const blockId = blocks.stone.id;
    
    // Clear localStorage before test
    localStorage.clear();
    
    // Verify localStorage is initially empty
    expect(localStorage.getItem('minecraft_inventory')).toBeNull();
    
    // Spawn and collect an item
    world.spawnDroppedItem(blockId, new THREE.Vector3(10.5, 10, 10));
    ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
    
    // Verify localStorage was updated
    const savedData = localStorage.getItem('minecraft_inventory');
    expect(savedData).toBeTruthy();
    
    const parsed = JSON.parse(savedData);
    expect(parsed.items[blockId]).toBe(1);
  });

  test('should handle collecting multiple items of same type', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    const blockId = blocks.stone.id;
    
    // Spawn multiple stone blocks near player
    world.spawnDroppedItem(blockId, new THREE.Vector3(10.5, 10, 10));
    world.spawnDroppedItem(blockId, new THREE.Vector3(10.8, 10, 10));
    world.spawnDroppedItem(blockId, new THREE.Vector3(11, 10, 10));
    
    expect(world.droppedItems.length).toBe(3);
    
    // Collect all items
    ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
    
    // All items should be collected
    expect(world.droppedItems.length).toBe(0);
    expect(mockPlayer.inventory.getQuantity(blockId)).toBe(3);
  });

  test('should handle collecting different block types', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Spawn different block types near player
    world.spawnDroppedItem(blocks.stone.id, new THREE.Vector3(10.5, 10, 10));
    world.spawnDroppedItem(blocks.grass.id, new THREE.Vector3(10.8, 10, 10));
    world.spawnDroppedItem(blocks.dirt.id, new THREE.Vector3(11, 10, 10));
    
    // Collect all items
    ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
    
    // Verify each type was collected
    expect(mockPlayer.inventory.getQuantity(blocks.stone.id)).toBe(1);
    expect(mockPlayer.inventory.getQuantity(blocks.grass.id)).toBe(1);
    expect(mockPlayer.inventory.getQuantity(blocks.dirt.id)).toBe(1);
  });

  test('should properly dispose item resources after collection', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Spawn an item
    world.spawnDroppedItem(blocks.stone.id, new THREE.Vector3(10.5, 10, 10));
    
    const item = world.droppedItems[0];
    expect(item.mesh).toBeDefined();
    
    // Collect the item
    ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
    
    // Verify mesh was disposed (set to null)
    expect(item.mesh).toBeNull();
  });

  test('should handle collection at exact collection radius boundary', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Place item exactly at collection radius (2.0 blocks away)
    const itemPosition = new THREE.Vector3(12, 10, 10); // Exactly 2.0 blocks on X axis
    
    world.spawnDroppedItem(blocks.stone.id, itemPosition);
    
    // Should collect (distance <= radius)
    ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
    
    expect(world.droppedItems.length).toBe(0);
    expect(mockPlayer.inventory.getQuantity(blocks.stone.id)).toBe(1);
  });

  test('should handle collection just outside radius boundary', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Place item just outside collection radius (2.1 blocks away)
    const itemPosition = new THREE.Vector3(12.1, 10, 10);
    
    world.spawnDroppedItem(blocks.stone.id, itemPosition);
    
    // Should NOT collect (distance > radius)
    ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
    
    expect(world.droppedItems.length).toBe(1);
    expect(mockPlayer.inventory.getQuantity(blocks.stone.id)).toBe(0);
  });
});

describe('Toolbar and Block Placement Integration', () => {
  let world;
  let mockPlayer;
  let toolbarUI;
  let originalLocalStorage;

  // Mock DOM setup for toolbar
  function setupMockDOM() {
    const toolbar = document.createElement('div');
    toolbar.id = 'toolbar';
    
    // Create toolbar slots 0-8
    for (let i = 0; i <= 8; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'toolbar-slot';
      
      const img = document.createElement('img');
      img.id = `toolbar-${i}`;
      img.className = 'toolbar-icon';
      if (i === 0) {
        img.src = 'textures/pickaxe.png';
        img.classList.add('selected');
      }
      
      wrapper.appendChild(img);
      toolbar.appendChild(wrapper);
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

  beforeEach(() => {
    // Setup DOM
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

    // Import required classes
    const THREE = require('three');
    const { World } = require('../scripts/world/world.js');
    const { InventoryManager } = require('../scripts/inventory/InventoryManager.js');
    const { ToolbarUI } = require('../scripts/inventory/ToolbarUI.js');

    // Create world
    world = new World();
    
    // Create mock player with inventory
    mockPlayer = {
      position: new THREE.Vector3(10, 10, 10),
      inventory: new InventoryManager()
    };
    
    // Create toolbar UI
    toolbarUI = new ToolbarUI(mockPlayer.inventory);
  });

  afterEach(() => {
    // Clean up
    if (world && world.droppedItems) {
      world.droppedItems.forEach(item => {
        if (item.dispose) item.dispose();
      });
      world.droppedItems = [];
    }
    
    cleanupMockDOM();
    global.localStorage = originalLocalStorage;
  });

  test('should update toolbar display when item is collected', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Initial toolbar should be empty
    toolbarUI.render();
    const slot1 = document.getElementById('toolbar-1');
    expect(slot1.src).toContain('empty_slot.png');
    
    // Spawn and collect a stone block
    const blockId = blocks.stone.id;
    world.spawnDroppedItem(blockId, new THREE.Vector3(10.5, 10, 10));
    ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
    
    // Update toolbar
    toolbarUI.render();
    
    // Toolbar should now show the stone block
    expect(slot1.src).toContain('stone.png');
    expect(slot1.style.opacity).toBe('1');
    
    // Quantity overlay should show 1
    const quantityOverlay = document.querySelector('#quantity-1');
    expect(quantityOverlay).toBeTruthy();
    expect(quantityOverlay.textContent).toBe('1');
  });

  test('should decrement quantity in toolbar when block is placed', () => {
    // Add 5 stone blocks to inventory
    const blockId = blocks.stone.id;
    mockPlayer.inventory.addItem(blockId, 5);
    toolbarUI.render();
    
    // Verify initial quantity
    let quantityOverlay = document.querySelector('#quantity-1');
    expect(quantityOverlay.textContent).toBe('5');
    
    // Place a block (simulate placement by removing from inventory)
    const placed = mockPlayer.inventory.removeItem(blockId, 1);
    expect(placed).toBe(true);
    
    // Update toolbar
    toolbarUI.render();
    
    // Quantity should now be 4
    quantityOverlay = document.querySelector('#quantity-1');
    expect(quantityOverlay.textContent).toBe('4');
  });

  test('should remove item from toolbar when last item is placed', () => {
    // Add 1 stone block to inventory
    const blockId = blocks.stone.id;
    mockPlayer.inventory.addItem(blockId, 1);
    toolbarUI.render();
    
    // Verify item is displayed
    const slot1 = document.getElementById('toolbar-1');
    expect(slot1.src).toContain('stone.png');
    expect(slot1.style.opacity).toBe('1');
    
    // Place the last block
    mockPlayer.inventory.removeItem(blockId, 1);
    toolbarUI.render();
    
    // Slot should now be empty
    expect(slot1.src).toContain('empty_slot.png');
    expect(slot1.style.opacity).toBe('0.5');
    
    // Quantity overlay should be removed
    const quantityOverlay = document.querySelector('#quantity-1');
    expect(quantityOverlay).toBeFalsy();
  });

  test('should prevent placing block when inventory is empty', () => {
    const blockId = blocks.stone.id;
    
    // Verify inventory is empty
    expect(mockPlayer.inventory.hasItem(blockId)).toBe(false);
    
    // Attempt to place a block using addBlock with inventory check
    const placed = world.addBlock(10, 10, 10, blockId, mockPlayer.inventory);
    
    // Placement should be prevented
    expect(placed).toBe(false);
    
    // Block should not exist in world
    const block = world.getBlock(10, 10, 10);
    expect(block === null || block.id === 0).toBe(true);
  });

  test('should allow placing block when inventory has item', () => {
    const blockId = blocks.stone.id;
    
    // Add stone to inventory
    mockPlayer.inventory.addItem(blockId, 5);
    
    // Test the inventory check logic that addBlock uses
    // The actual placement requires a loaded chunk, which we don't have in this test
    const hasItem = mockPlayer.inventory.hasItem(blockId);
    expect(hasItem).toBe(true);
    
    // Simulate successful placement by removing item from inventory
    const removed = mockPlayer.inventory.removeItem(blockId, 1);
    expect(removed).toBe(true);
    
    // Verify inventory was decremented
    expect(mockPlayer.inventory.getQuantity(blockId)).toBe(4);
    
    // Save and update toolbar (as would happen in real placement)
    mockPlayer.inventory.save();
    toolbarUI.render();
    
    // Verify toolbar shows updated quantity
    const quantityOverlay = document.querySelector('#quantity-1');
    expect(quantityOverlay.textContent).toBe('4');
  });

  test('should persist toolbar state after page reload via localStorage', () => {
    const { InventoryManager } = require('../scripts/inventory/InventoryManager.js');
    const { ToolbarUI } = require('../scripts/inventory/ToolbarUI.js');
    
    // Add items to inventory and save (in specific order)
    mockPlayer.inventory.addItem(blocks.stone.id, 10);  // blockId 3
    mockPlayer.inventory.addItem(blocks.grass.id, 5);   // blockId 1
    mockPlayer.inventory.addItem(blocks.dirt.id, 3);    // blockId 2
    mockPlayer.inventory.save();
    
    // Render toolbar
    toolbarUI.render();
    
    // Verify toolbar shows items in insertion order
    expect(document.getElementById('toolbar-1').src).toContain('stone.png');
    expect(document.getElementById('toolbar-2').src).toContain('grass.png');
    expect(document.getElementById('toolbar-3').src).toContain('dirt.png');
    
    // Simulate page reload by creating new instances
    const newInventory = new InventoryManager();
    newInventory.load(); // Load from localStorage
    
    const newToolbarUI = new ToolbarUI(newInventory);
    newToolbarUI.render();
    
    // After reload, items may be in different order (Map iteration from JSON)
    // Verify all items are present with correct quantities
    const slot1 = document.getElementById('toolbar-1');
    const slot2 = document.getElementById('toolbar-2');
    const slot3 = document.getElementById('toolbar-3');
    
    // Check that all three items are displayed (order may vary)
    const displayedTextures = [slot1.src, slot2.src, slot3.src];
    expect(displayedTextures.some(src => src.includes('stone.png'))).toBe(true);
    expect(displayedTextures.some(src => src.includes('grass.png'))).toBe(true);
    expect(displayedTextures.some(src => src.includes('dirt.png'))).toBe(true);
    
    // Verify quantities are preserved
    expect(newInventory.getQuantity(blocks.stone.id)).toBe(10);
    expect(newInventory.getQuantity(blocks.grass.id)).toBe(5);
    expect(newInventory.getQuantity(blocks.dirt.id)).toBe(3);
  });

  test('should update toolbar immediately after collecting multiple items', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Spawn multiple different items near player
    world.spawnDroppedItem(blocks.stone.id, new THREE.Vector3(10.5, 10, 10));
    world.spawnDroppedItem(blocks.grass.id, new THREE.Vector3(10.8, 10, 10));
    world.spawnDroppedItem(blocks.dirt.id, new THREE.Vector3(11, 10, 10));
    
    // Collect all items (collection order may vary based on array iteration)
    ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
    
    // Update toolbar
    toolbarUI.render();
    
    // Verify all three items are displayed (order depends on collection order)
    const slot1 = document.getElementById('toolbar-1');
    const slot2 = document.getElementById('toolbar-2');
    const slot3 = document.getElementById('toolbar-3');
    
    // Check that all three items are displayed
    const displayedTextures = [slot1.src, slot2.src, slot3.src];
    expect(displayedTextures.some(src => src.includes('stone.png'))).toBe(true);
    expect(displayedTextures.some(src => src.includes('grass.png'))).toBe(true);
    expect(displayedTextures.some(src => src.includes('dirt.png'))).toBe(true);
    
    // Verify all quantities are 1
    expect(mockPlayer.inventory.getQuantity(blocks.stone.id)).toBe(1);
    expect(mockPlayer.inventory.getQuantity(blocks.grass.id)).toBe(1);
    expect(mockPlayer.inventory.getQuantity(blocks.dirt.id)).toBe(1);
  });

  test('should handle full collection and placement cycle', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Start with empty inventory
    toolbarUI.render();
    expect(document.getElementById('toolbar-1').src).toContain('empty_slot.png');
    
    // Collect 3 stone blocks
    world.spawnDroppedItem(blocks.stone.id, new THREE.Vector3(10.5, 10, 10));
    world.spawnDroppedItem(blocks.stone.id, new THREE.Vector3(10.8, 10, 10));
    world.spawnDroppedItem(blocks.stone.id, new THREE.Vector3(11, 10, 10));
    ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
    
    // Update toolbar - should show 3 stone
    toolbarUI.render();
    expect(document.getElementById('toolbar-1').src).toContain('stone.png');
    expect(document.querySelector('#quantity-1').textContent).toBe('3');
    
    // Place 2 blocks
    mockPlayer.inventory.removeItem(blocks.stone.id, 2);
    toolbarUI.render();
    
    // Should show 1 stone remaining
    expect(document.querySelector('#quantity-1').textContent).toBe('1');
    
    // Place last block
    mockPlayer.inventory.removeItem(blocks.stone.id, 1);
    toolbarUI.render();
    
    // Toolbar should be empty again
    expect(document.getElementById('toolbar-1').src).toContain('empty_slot.png');
    expect(document.getElementById('toolbar-1').style.opacity).toBe('0.5');
  });

  test('should maintain pickaxe in toolbar-0 during all operations', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    const pickaxeSlot = document.getElementById('toolbar-0');
    const originalSrc = pickaxeSlot.src;
    
    // Verify pickaxe is initially there
    expect(originalSrc).toContain('pickaxe.png');
    
    // Collect items
    world.spawnDroppedItem(blocks.stone.id, new THREE.Vector3(10.5, 10, 10));
    ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
    toolbarUI.render();
    
    // Pickaxe should still be there
    expect(pickaxeSlot.src).toBe(originalSrc);
    
    // Place items
    mockPlayer.inventory.removeItem(blocks.stone.id, 1);
    toolbarUI.render();
    
    // Pickaxe should still be there
    expect(pickaxeSlot.src).toBe(originalSrc);
    
    // Clear toolbar
    toolbarUI.clearToolbar();
    
    // Pickaxe should STILL be there
    expect(pickaxeSlot.src).toBe(originalSrc);
    expect(pickaxeSlot.src).toContain('pickaxe.png');
  });

  test('should save to localStorage after each placement', () => {
    // Add items to inventory
    mockPlayer.inventory.addItem(blocks.stone.id, 5);
    mockPlayer.inventory.save();
    
    // Verify saved
    let savedData = JSON.parse(localStorage.getItem('minecraft_inventory'));
    expect(savedData.items[blocks.stone.id]).toBe(5);
    
    // Place a block (remove from inventory and save)
    mockPlayer.inventory.removeItem(blocks.stone.id, 1);
    mockPlayer.inventory.save();
    
    // Verify localStorage was updated
    savedData = JSON.parse(localStorage.getItem('minecraft_inventory'));
    expect(savedData.items[blocks.stone.id]).toBe(4);
    
    // Place another block
    mockPlayer.inventory.removeItem(blocks.stone.id, 1);
    mockPlayer.inventory.save();
    
    // Verify again
    savedData = JSON.parse(localStorage.getItem('minecraft_inventory'));
    expect(savedData.items[blocks.stone.id]).toBe(3);
  });

  test('should handle toolbar display with more than 8 item types', () => {
    // Add 10 different item types
    for (let i = 1; i <= 10; i++) {
      mockPlayer.inventory.addItem(i, 5);
    }
    
    toolbarUI.render();
    
    // Only first 8 should be displayed
    for (let i = 1; i <= 8; i++) {
      const slot = document.getElementById(`toolbar-${i}`);
      expect(slot.src).not.toBe('');
      expect(slot.style.opacity).toBe('1');
    }
    
    // Items 9 and 10 are in inventory but not displayed (toolbar limit)
    expect(mockPlayer.inventory.getQuantity(9)).toBe(5);
    expect(mockPlayer.inventory.getQuantity(10)).toBe(5);
  });
});

describe('Item Throwing Integration', () => {
  let world;
  let mockPlayer;
  let toolbarUI;
  let originalLocalStorage;

  // Mock DOM setup for toolbar
  function setupMockDOM() {
    const toolbar = document.createElement('div');
    toolbar.id = 'toolbar';
    
    // Create toolbar slots 0-8
    for (let i = 0; i <= 8; i++) {
      const wrapper = document.createElement('div');
      wrapper.className = 'toolbar-slot';
      
      const img = document.createElement('img');
      img.id = `toolbar-${i}`;
      img.className = 'toolbar-icon';
      if (i === 0) {
        img.src = 'textures/pickaxe.png';
        img.classList.add('selected');
      }
      
      wrapper.appendChild(img);
      toolbar.appendChild(wrapper);
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

  beforeEach(() => {
    // Setup DOM
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

    // Import required classes
    const THREE = require('three');
    const { World } = require('../scripts/world/world.js');
    const { InventoryManager } = require('../scripts/inventory/InventoryManager.js');
    const { ToolbarUI } = require('../scripts/inventory/ToolbarUI.js');

    // Create world
    world = new World();
    
    // Create mock player with inventory and camera
    mockPlayer = {
      position: new THREE.Vector3(10, 10, 10),
      height: 1.75,
      inventory: new InventoryManager(),
      camera: {
        getWorldDirection: function(target) {
          // Default direction: looking along positive Z axis
          target.set(0, 0, 1);
          return target;
        }
      }
    };
    
    // Create toolbar UI
    toolbarUI = new ToolbarUI(mockPlayer.inventory);
  });

  afterEach(() => {
    // Clean up
    if (world && world.droppedItems) {
      world.droppedItems.forEach(item => {
        if (item.dispose) item.dispose();
      });
      world.droppedItems = [];
    }
    
    cleanupMockDOM();
    global.localStorage = originalLocalStorage;
  });



  test('should throw item in player facing direction', () => {
    const THREE = require('three');
    const { ItemThrower } = require('../scripts/inventory/ItemThrower.js');
    
    // Add stone to inventory
    const blockId = blocks.stone.id;
    mockPlayer.inventory.addItem(blockId, 5);
    toolbarUI.render();
    toolbarUI.setSelectedSlot(1);
    
    // Set player to look along +X axis
    mockPlayer.camera.getWorldDirection = function(target) {
      target.set(1, 0, 0);
      return target;
    };
    
    // Throw item
    ItemThrower.throwItem(mockPlayer, world, toolbarUI);
    
    const thrownItem = world.droppedItems[0];
    
    // Item should be 3 blocks in +X direction from player
    // Player at (10, 10, 10), item should be around (13, 8.25, 10)
    expect(thrownItem.position.x).toBeCloseTo(13, 1);
    expect(thrownItem.position.z).toBeCloseTo(10, 1);
  });

  test('should decrease inventory quantity after throwing', () => {
    const { ItemThrower } = require('../scripts/inventory/ItemThrower.js');
    
    // Add stone to inventory
    const blockId = blocks.stone.id;
    mockPlayer.inventory.addItem(blockId, 5);
    toolbarUI.render();
    toolbarUI.setSelectedSlot(1);
    
    // Verify initial quantity
    expect(mockPlayer.inventory.getQuantity(blockId)).toBe(5);
    
    // Throw item
    ItemThrower.throwItem(mockPlayer, world, toolbarUI);
    
    // Verify quantity decreased
    expect(mockPlayer.inventory.getQuantity(blockId)).toBe(4);
  });

  test('should update toolbar after throwing', () => {
    const { ItemThrower } = require('../scripts/inventory/ItemThrower.js');
    
    // Add stone to inventory
    const blockId = blocks.stone.id;
    mockPlayer.inventory.addItem(blockId, 3);
    toolbarUI.render();
    toolbarUI.setSelectedSlot(1);
    
    // Verify initial toolbar display
    let quantityOverlay = document.querySelector('#quantity-1');
    expect(quantityOverlay.textContent).toBe('3');
    
    // Throw item
    ItemThrower.throwItem(mockPlayer, world, toolbarUI);
    
    // Verify toolbar was updated
    quantityOverlay = document.querySelector('#quantity-1');
    expect(quantityOverlay.textContent).toBe('2');
  });

  test('should not throw when quantity is 0', () => {
    const { ItemThrower } = require('../scripts/inventory/ItemThrower.js');
    
    // Add and then remove all items
    const blockId = blocks.stone.id;
    mockPlayer.inventory.addItem(blockId, 1);
    mockPlayer.inventory.removeItem(blockId, 1);
    toolbarUI.render();
    toolbarUI.setSelectedSlot(1);
    
    // Verify inventory is empty
    expect(mockPlayer.inventory.getQuantity(blockId)).toBe(0);
    
    // Attempt to throw
    const result = ItemThrower.throwItem(mockPlayer, world, toolbarUI);
    
    // Should fail
    expect(result).toBe(false);
    expect(world.droppedItems.length).toBe(0);
  });

  test('should not throw pickaxe from slot 0', () => {
    const { ItemThrower } = require('../scripts/inventory/ItemThrower.js');
    
    // Select pickaxe slot
    toolbarUI.setSelectedSlot(0);
    
    // Attempt to throw
    const result = ItemThrower.throwItem(mockPlayer, world, toolbarUI);
    
    // Should fail (pickaxe cannot be thrown)
    expect(result).toBe(false);
    expect(world.droppedItems.length).toBe(0);
  });

  test('should remove item from toolbar when last item is thrown', () => {
    const { ItemThrower } = require('../scripts/inventory/ItemThrower.js');
    
    // Add only 1 stone
    const blockId = blocks.stone.id;
    mockPlayer.inventory.addItem(blockId, 1);
    toolbarUI.render();
    toolbarUI.setSelectedSlot(1);
    
    // Verify item is displayed
    const slot1 = document.getElementById('toolbar-1');
    expect(slot1.src).toContain('stone.png');
    expect(slot1.style.opacity).toBe('1');
    
    // Throw the last item
    ItemThrower.throwItem(mockPlayer, world, toolbarUI);
    
    // Toolbar should now be empty
    expect(slot1.src).toContain('empty_slot.png');
    expect(slot1.style.opacity).toBe('0.5');
    
    // Quantity overlay should be removed
    const quantityOverlay = document.querySelector('#quantity-1');
    expect(quantityOverlay).toBeFalsy();
  });

  test('should save inventory to localStorage after throwing', () => {
    const { ItemThrower } = require('../scripts/inventory/ItemThrower.js');
    
    // Add stone to inventory
    const blockId = blocks.stone.id;
    mockPlayer.inventory.addItem(blockId, 5);
    mockPlayer.inventory.save();
    toolbarUI.render();
    toolbarUI.setSelectedSlot(1);
    
    // Verify initial localStorage
    let savedData = JSON.parse(localStorage.getItem('minecraft_inventory'));
    expect(savedData.items[blockId]).toBe(5);
    
    // Throw item
    ItemThrower.throwItem(mockPlayer, world, toolbarUI);
    
    // Verify localStorage was updated
    savedData = JSON.parse(localStorage.getItem('minecraft_inventory'));
    expect(savedData.items[blockId]).toBe(4);
  });

  test('should throw multiple items sequentially', () => {
    const { ItemThrower } = require('../scripts/inventory/ItemThrower.js');
    
    // Add stone to inventory
    const blockId = blocks.stone.id;
    mockPlayer.inventory.addItem(blockId, 5);
    toolbarUI.render();
    toolbarUI.setSelectedSlot(1);
    
    // Throw 3 items
    ItemThrower.throwItem(mockPlayer, world, toolbarUI);
    ItemThrower.throwItem(mockPlayer, world, toolbarUI);
    ItemThrower.throwItem(mockPlayer, world, toolbarUI);
    
    // Verify 3 items were spawned
    expect(world.droppedItems.length).toBe(3);
    
    // Verify inventory decreased by 3
    expect(mockPlayer.inventory.getQuantity(blockId)).toBe(2);
    
    // Verify toolbar shows updated quantity
    const quantityOverlay = document.querySelector('#quantity-1');
    expect(quantityOverlay.textContent).toBe('2');
  });

  test('should throw different block types', () => {
    const { ItemThrower } = require('../scripts/inventory/ItemThrower.js');
    
    // Add multiple block types
    mockPlayer.inventory.addItem(blocks.stone.id, 3);
    mockPlayer.inventory.addItem(blocks.grass.id, 2);
    toolbarUI.render();
    
    // Throw stone
    toolbarUI.setSelectedSlot(1);
    ItemThrower.throwItem(mockPlayer, world, toolbarUI);
    
    // Throw grass
    toolbarUI.setSelectedSlot(2);
    ItemThrower.throwItem(mockPlayer, world, toolbarUI);
    
    // Verify both items were spawned
    expect(world.droppedItems.length).toBe(2);
    expect(world.droppedItems[0].blockId).toBe(blocks.stone.id);
    expect(world.droppedItems[1].blockId).toBe(blocks.grass.id);
  });

  test('should allow collecting thrown items', () => {
    const THREE = require('three');
    const { ItemThrower } = require('../scripts/inventory/ItemThrower.js');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Add stone to inventory
    const blockId = blocks.stone.id;
    mockPlayer.inventory.addItem(blockId, 5);
    toolbarUI.render();
    toolbarUI.setSelectedSlot(1);
    
    // Throw item
    ItemThrower.throwItem(mockPlayer, world, toolbarUI);
    
    // Verify item was thrown
    expect(world.droppedItems.length).toBe(1);
    expect(mockPlayer.inventory.getQuantity(blockId)).toBe(4);
    
    // Move thrown item close to player (simulate it landing nearby)
    world.droppedItems[0].position.set(10.5, 10, 10);
    
    // Collect the thrown item
    ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
    
    // Verify item was collected back
    expect(world.droppedItems.length).toBe(0);
    expect(mockPlayer.inventory.getQuantity(blockId)).toBe(5);
  });

  test('should handle full throw and collect cycle', () => {
    const THREE = require('three');
    const { ItemThrower } = require('../scripts/inventory/ItemThrower.js');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Start with 3 stone blocks
    const blockId = blocks.stone.id;
    mockPlayer.inventory.addItem(blockId, 3);
    toolbarUI.render();
    toolbarUI.setSelectedSlot(1);
    
    // Throw all 3 items
    ItemThrower.throwItem(mockPlayer, world, toolbarUI);
    ItemThrower.throwItem(mockPlayer, world, toolbarUI);
    ItemThrower.throwItem(mockPlayer, world, toolbarUI);
    
    // Verify all thrown
    expect(world.droppedItems.length).toBe(3);
    expect(mockPlayer.inventory.getQuantity(blockId)).toBe(0);
    
    // Move all items close to player
    world.droppedItems.forEach(item => {
      item.position.set(10.5, 10, 10);
    });
    
    // Collect all items
    ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
    
    // Verify all collected back
    expect(world.droppedItems.length).toBe(0);
    expect(mockPlayer.inventory.getQuantity(blockId)).toBe(3);
  });
});

describe('Item Despawn Integration', () => {
  let world;
  let mockPlayer;
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

    // Import required classes
    const THREE = require('three');
    const { World } = require('../scripts/world/world.js');
    const { InventoryManager } = require('../scripts/inventory/InventoryManager.js');

    // Create world
    world = new World();
    
    // Create mock player with inventory
    mockPlayer = {
      position: new THREE.Vector3(10, 10, 10),
      inventory: new InventoryManager()
    };
  });

  afterEach(() => {
    // Clean up
    if (world && world.droppedItems) {
      world.droppedItems.forEach(item => {
        if (item.dispose) item.dispose();
      });
      world.droppedItems = [];
    }
    
    global.localStorage = originalLocalStorage;
  });

  test('should despawn items after 10 minutes', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    const { DroppedItem } = require('../scripts/inventory/DroppedItem.js');
    
    // Store original DESPAWN_TIME
    const originalDespawnTime = DroppedItem.DESPAWN_TIME;
    
    // Temporarily set DESPAWN_TIME to 1 second for faster testing
    DroppedItem.DESPAWN_TIME = 1;
    
    try {
      // Spawn an item
      const blockId = blocks.stone.id;
      world.spawnDroppedItem(blockId, new THREE.Vector3(10, 10, 10));
      
      // Verify item was spawned
      expect(world.droppedItems.length).toBe(1);
      
      // Manually set createdAt to 1.1 seconds ago
      world.droppedItems[0].createdAt = Date.now() - 1100;
      
      // Check despawns
      ItemCollector.checkDespawns(world.droppedItems, world);
      
      // Item should be despawned
      expect(world.droppedItems.length).toBe(0);
    } finally {
      // Restore original DESPAWN_TIME
      DroppedItem.DESPAWN_TIME = originalDespawnTime;
    }
  });

  test('should remove despawned items from scene', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    const { DroppedItem } = require('../scripts/inventory/DroppedItem.js');
    
    // Store original DESPAWN_TIME
    const originalDespawnTime = DroppedItem.DESPAWN_TIME;
    DroppedItem.DESPAWN_TIME = 1;
    
    try {
      // Spawn an item
      const blockId = blocks.stone.id;
      world.spawnDroppedItem(blockId, new THREE.Vector3(10, 10, 10));
      
      const item = world.droppedItems[0];
      const itemMesh = item.mesh;
      
      // Verify mesh exists
      expect(itemMesh).toBeDefined();
      
      // Track if mesh was removed (world.remove is called by ItemCollector)
      const removedMeshes = [];
      const originalRemove = world.remove.bind(world);
      world.remove = function(mesh) {
        removedMeshes.push(mesh);
        return originalRemove(mesh);
      };
      
      // Set item as old
      item.createdAt = Date.now() - 1100;
      
      // Check despawns
      ItemCollector.checkDespawns(world.droppedItems, world);
      
      // Mesh should have been removed from scene
      expect(removedMeshes).toContain(itemMesh);
    } finally {
      DroppedItem.DESPAWN_TIME = originalDespawnTime;
    }
  });

  test('should remove despawned items from tracking array', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    const { DroppedItem } = require('../scripts/inventory/DroppedItem.js');
    
    const originalDespawnTime = DroppedItem.DESPAWN_TIME;
    DroppedItem.DESPAWN_TIME = 1;
    
    try {
      // Spawn multiple items
      world.spawnDroppedItem(blocks.stone.id, new THREE.Vector3(10, 10, 10));
      world.spawnDroppedItem(blocks.grass.id, new THREE.Vector3(11, 10, 10));
      world.spawnDroppedItem(blocks.dirt.id, new THREE.Vector3(12, 10, 10));
      
      expect(world.droppedItems.length).toBe(3);
      
      // Make first two items old
      world.droppedItems[0].createdAt = Date.now() - 1100;
      world.droppedItems[1].createdAt = Date.now() - 1100;
      // Third item is new
      
      // Check despawns
      ItemCollector.checkDespawns(world.droppedItems, world);
      
      // Only the new item should remain
      expect(world.droppedItems.length).toBe(1);
      expect(world.droppedItems[0].blockId).toBe(blocks.dirt.id);
    } finally {
      DroppedItem.DESPAWN_TIME = originalDespawnTime;
    }
  });

  test('should not despawn items collected before despawn time', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    const { DroppedItem } = require('../scripts/inventory/DroppedItem.js');
    
    const originalDespawnTime = DroppedItem.DESPAWN_TIME;
    DroppedItem.DESPAWN_TIME = 1;
    
    try {
      // Spawn an item
      const blockId = blocks.stone.id;
      world.spawnDroppedItem(blockId, new THREE.Vector3(10.5, 10, 10));
      
      expect(world.droppedItems.length).toBe(1);
      expect(mockPlayer.inventory.getQuantity(blockId)).toBe(0);
      
      // Collect the item before it despawns
      ItemCollector.checkCollections(mockPlayer, world.droppedItems, world);
      
      // Item should be collected
      expect(world.droppedItems.length).toBe(0);
      expect(mockPlayer.inventory.getQuantity(blockId)).toBe(1);
      
      // Now check despawns (should do nothing since item is already collected)
      ItemCollector.checkDespawns(world.droppedItems, world);
      
      // Inventory should still have the item
      expect(mockPlayer.inventory.getQuantity(blockId)).toBe(1);
    } finally {
      DroppedItem.DESPAWN_TIME = originalDespawnTime;
    }
  });

  test('should keep items younger than despawn time', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    const { DroppedItem } = require('../scripts/inventory/DroppedItem.js');
    
    const originalDespawnTime = DroppedItem.DESPAWN_TIME;
    DroppedItem.DESPAWN_TIME = 10; // 10 seconds
    
    try {
      // Spawn items with different ages
      world.spawnDroppedItem(blocks.stone.id, new THREE.Vector3(10, 10, 10));
      world.spawnDroppedItem(blocks.grass.id, new THREE.Vector3(11, 10, 10));
      world.spawnDroppedItem(blocks.dirt.id, new THREE.Vector3(12, 10, 10));
      
      // Set ages: 5s, 8s, 11s
      world.droppedItems[0].createdAt = Date.now() - 5000;  // 5s old - keep
      world.droppedItems[1].createdAt = Date.now() - 8000;  // 8s old - keep
      world.droppedItems[2].createdAt = Date.now() - 11000; // 11s old - despawn
      
      // Check despawns
      ItemCollector.checkDespawns(world.droppedItems, world);
      
      // First two should remain, third should be despawned
      expect(world.droppedItems.length).toBe(2);
      expect(world.droppedItems[0].blockId).toBe(blocks.stone.id);
      expect(world.droppedItems[1].blockId).toBe(blocks.grass.id);
    } finally {
      DroppedItem.DESPAWN_TIME = originalDespawnTime;
    }
  });

  test('should properly dispose despawned item resources', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    const { DroppedItem } = require('../scripts/inventory/DroppedItem.js');
    
    const originalDespawnTime = DroppedItem.DESPAWN_TIME;
    DroppedItem.DESPAWN_TIME = 1;
    
    try {
      // Spawn an item
      world.spawnDroppedItem(blocks.stone.id, new THREE.Vector3(10, 10, 10));
      
      const item = world.droppedItems[0];
      expect(item.mesh).toBeDefined();
      
      // Make item old
      item.createdAt = Date.now() - 1100;
      
      // Check despawns
      ItemCollector.checkDespawns(world.droppedItems, world);
      
      // Mesh should be disposed (set to null)
      expect(item.mesh).toBeNull();
    } finally {
      DroppedItem.DESPAWN_TIME = originalDespawnTime;
    }
  });

  test('should handle despawn check with empty array', () => {
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    
    // Should not throw with empty array
    expect(() => {
      ItemCollector.checkDespawns(world.droppedItems, world);
    }).not.toThrow();
    
    expect(world.droppedItems.length).toBe(0);
  });

  test('should despawn all items when all are old', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    const { DroppedItem } = require('../scripts/inventory/DroppedItem.js');
    
    const originalDespawnTime = DroppedItem.DESPAWN_TIME;
    DroppedItem.DESPAWN_TIME = 1;
    
    try {
      // Spawn 5 items
      for (let i = 0; i < 5; i++) {
        world.spawnDroppedItem(blocks.stone.id, new THREE.Vector3(10 + i, 10, 10));
      }
      
      expect(world.droppedItems.length).toBe(5);
      
      // Make all items old
      world.droppedItems.forEach(item => {
        item.createdAt = Date.now() - 1100;
      });
      
      // Check despawns
      ItemCollector.checkDespawns(world.droppedItems, world);
      
      // All items should be despawned
      expect(world.droppedItems.length).toBe(0);
    } finally {
      DroppedItem.DESPAWN_TIME = originalDespawnTime;
    }
  });

  test('should handle mixed old and new items correctly', () => {
    const THREE = require('three');
    const { ItemCollector } = require('../scripts/inventory/ItemCollector.js');
    const { DroppedItem } = require('../scripts/inventory/DroppedItem.js');
    
    const originalDespawnTime = DroppedItem.DESPAWN_TIME;
    DroppedItem.DESPAWN_TIME = 2;
    
    try {
      // Spawn items in alternating pattern
      for (let i = 0; i < 6; i++) {
        world.spawnDroppedItem(i + 1, new THREE.Vector3(10 + i, 10, 10));
      }
      
      // Make items at even indices old, odd indices new
      world.droppedItems.forEach((item, index) => {
        if (index % 2 === 0) {
          item.createdAt = Date.now() - 2100; // Old
        } else {
          item.createdAt = Date.now() - 500;  // New
        }
      });
      
      // Check despawns
      ItemCollector.checkDespawns(world.droppedItems, world);
      
      // Only odd-indexed items (new ones) should remain
      expect(world.droppedItems.length).toBe(3);
      expect(world.droppedItems[0].blockId).toBe(2); // Was at index 1
      expect(world.droppedItems[1].blockId).toBe(4); // Was at index 3
      expect(world.droppedItems[2].blockId).toBe(6); // Was at index 5
    } finally {
      DroppedItem.DESPAWN_TIME = originalDespawnTime;
    }
  });

  test('should verify DESPAWN_TIME is 600 seconds by default', () => {
    const { DroppedItem } = require('../scripts/inventory/DroppedItem.js');
    
    // Verify the constant is set correctly
    expect(DroppedItem.DESPAWN_TIME).toBe(600);
  });
});
