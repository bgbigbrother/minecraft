import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';

/**
 * Integration test for GameRunning save functionality
 * Tests that the save button properly saves world data to localStorage
 */
describe('GameRunning Save Functionality', () => {
  let originalLocalStorage;
  let storageData;

  beforeEach(() => {
    // Clear module cache to get fresh storage module
    jest.resetModules();
    
    // Mock localStorage
    storageData = {};
    originalLocalStorage = global.localStorage;
    
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
  });

  afterEach(() => {
    global.localStorage = originalLocalStorage;
  });

  test('should save world data to localStorage when save button is clicked', () => {
    // Import storage functions
    const { saveWorld, loadWorld, getAllWorlds } = require('../src/menu/utils/storage.js');

    // Create test world data
    const worldName = 'Test World';
    const worldData = {
      params: { seed: 12345, biome: 'plains' },
      data: { '0,0,0': 1, '1,0,0': 2 },
      player: { 
        position: { x: 10, y: 20, z: 30 },
        health: 100,
        inventory: {}
      }
    };

    // Save the world
    saveWorld(worldName, worldData);

    // Verify it was saved
    const savedWorlds = getAllWorlds();
    expect(savedWorlds).toHaveLength(1);
    expect(savedWorlds[0].name).toBe(worldName);
    expect(savedWorlds[0].params).toEqual(worldData.params);
    expect(savedWorlds[0].data).toEqual(worldData.data);
    expect(savedWorlds[0].player).toEqual(worldData.player);
    expect(savedWorlds[0].timestamp).toBeDefined();
  });

  test('should update existing world when saving with same name', () => {
    const { saveWorld, getAllWorlds } = require('../src/menu/utils/storage.js');

    const worldName = 'Test World';
    
    // Save first version
    saveWorld(worldName, {
      params: { seed: 111 },
      data: { '0,0,0': 1 },
      player: { position: { x: 1, y: 1, z: 1 } }
    });

    // Save updated version
    saveWorld(worldName, {
      params: { seed: 222 },
      data: { '0,0,0': 2, '1,0,0': 3 },
      player: { position: { x: 10, y: 20, z: 30 } }
    });

    // Verify only one world exists with updated data
    const savedWorlds = getAllWorlds();
    expect(savedWorlds).toHaveLength(1);
    expect(savedWorlds[0].name).toBe(worldName);
    expect(savedWorlds[0].params.seed).toBe(222);
    expect(savedWorlds[0].data).toEqual({ '0,0,0': 2, '1,0,0': 3 });
  });

  test('should handle multiple saved worlds', () => {
    const { saveWorld, getAllWorlds, clearAllData } = require('../src/menu/utils/storage.js');

    // Clear any existing data first
    clearAllData(true);

    // Save multiple worlds
    saveWorld('World 1', {
      params: { seed: 111 },
      data: {},
      player: { position: { x: 1, y: 1, z: 1 } }
    });

    saveWorld('World 2', {
      params: { seed: 222 },
      data: {},
      player: { position: { x: 2, y: 2, z: 2 } }
    });

    saveWorld('World 3', {
      params: { seed: 333 },
      data: {},
      player: { position: { x: 3, y: 3, z: 3 } }
    });

    // Verify all worlds are saved
    const savedWorlds = getAllWorlds();
    expect(savedWorlds).toHaveLength(3);
    expect(savedWorlds.map(w => w.name)).toContain('World 1');
    expect(savedWorlds.map(w => w.name)).toContain('World 2');
    expect(savedWorlds.map(w => w.name)).toContain('World 3');
  });

  test('should load specific world by name', () => {
    const { saveWorld, loadWorld } = require('../src/menu/utils/storage.js');

    // Save multiple worlds
    saveWorld('World A', {
      params: { seed: 111 },
      data: { '0,0,0': 1 },
      player: { position: { x: 1, y: 1, z: 1 } }
    });

    saveWorld('World B', {
      params: { seed: 222 },
      data: { '0,0,0': 2 },
      player: { position: { x: 2, y: 2, z: 2 } }
    });

    // Load specific world
    const loadedWorld = loadWorld('World B');
    
    expect(loadedWorld).not.toBeNull();
    expect(loadedWorld.name).toBe('World B');
    expect(loadedWorld.params.seed).toBe(222);
    expect(loadedWorld.data).toEqual({ '0,0,0': 2 });
    expect(loadedWorld.player.position.x).toBe(2);
  });

  test('should return null when loading non-existent world', () => {
    const { loadWorld } = require('../src/menu/utils/storage.js');

    const loadedWorld = loadWorld('Non-existent World');
    
    expect(loadedWorld).toBeNull();
  });
});
