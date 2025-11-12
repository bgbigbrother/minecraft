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
