import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock localStorage globally
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn()
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true
});

// Mock the storage utility
jest.mock('../src/menu/utils/storage.js', () => ({
  saveWorld: jest.fn(),
  loadWorld: jest.fn(),
  getAllWorlds: jest.fn(() => [])
}));

import { StoreWorldBaseClass } from '../scripts/world/store_world.js';
import { saveWorld } from '../src/menu/utils/storage.js';

describe('StoreWorldBaseClass', () => {
  let world;
  let mockPlayer;

  beforeEach(() => {
    // Reset mocks
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    jest.clearAllMocks();

    // Mock document with proper status element
    const mockStatusElement = { innerHTML: '' };
    const originalGetElementById = document.getElementById;
    document.getElementById = jest.fn((id) => {
      if (id === 'status') return mockStatusElement;
      return originalGetElementById.call(document, id);
    });

    // Create mock player with inventory
    mockPlayer = {
      position: { 
        x: 10, 
        y: 20, 
        z: 30,
        set: jest.fn()
      },
      health: 85,
      inventory: {
        toJSON: jest.fn(() => ({ items: { 1: 5, 2: 3 } })),
        fromJSON: jest.fn(),
        save: jest.fn()
      },
      setHealth: jest.fn()
    };

    world = new StoreWorldBaseClass();
    world.name = 'Test World';
    world.player = mockPlayer;
  });

  test('should create world instance', () => {
    expect(world).toBeDefined();
    expect(world.dataStore).toBeDefined();
    expect(world.name).toBe('Test World');
  });

  test('should save world data using storage utility', () => {
    // Mock setTimeout to avoid timing issues
    global.setTimeout = jest.fn();
    
    world.save();
    
    // Verify saveWorld was called with correct parameters
    expect(saveWorld).toHaveBeenCalledWith('Test World', {
      params: world.params,
      data: world.dataStore.data,
      player: {
        position: { x: 10, y: 20, z: 30 },
        health: 85,
        inventory: { items: { 1: 5, 2: 3 } }
      }
    });
  });

  test('should get player state correctly', () => {
    const playerState = world.getPlayerState();
    
    expect(playerState).toEqual({
      position: { x: 10, y: 20, z: 30 },
      health: 85,
      inventory: { items: { 1: 5, 2: 3 } }
    });
  });

  test('should return default player state when no player', () => {
    world.player = null;
    const playerState = world.getPlayerState();
    
    expect(playerState).toEqual({
      position: { x: 32, y: 32, z: 32 },
      health: 100,
      inventory: {}
    });
  });

  test('should load world data from localStorage (legacy F2 support)', () => {
    const mockParams = { seed: 123 };
    const mockData = { '0,0,1,1,1': 2 };
    
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'minecraft_params') return JSON.stringify(mockParams);
      if (key === 'minecraft_data') return JSON.stringify(mockData);
      return null;
    });

    // Mock the generate method to avoid errors
    world.generate = jest.fn();
    
    // Mock setTimeout to avoid timing issues
    global.setTimeout = jest.fn();

    world.load();
    
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('minecraft_params');
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('minecraft_data');
    expect(world.generate).toHaveBeenCalled();
  });

  test('should load world from data object', () => {
    const worldData = {
      params: { seed: 456 },
      data: { '1,1,1,1,1': 3 },
      player: {
        position: { x: 50, y: 60, z: 70 },
        health: 75,
        inventory: { items: { 3: 10 } }
      }
    };

    // Mock the generate method
    world.generate = jest.fn();
    
    // Mock setTimeout
    global.setTimeout = jest.fn();

    world.loadFromData(worldData);
    
    expect(world.params).toEqual(worldData.params);
    expect(world.dataStore.data).toEqual(worldData.data);
    expect(world.generate).toHaveBeenCalled();
  });

  test('should restore player state from loaded data', () => {
    const playerData = {
      position: { x: 100, y: 200, z: 300 },
      health: 50,
      inventory: { items: { 5: 20 } }
    };

    world.restorePlayerState(playerData);
    
    expect(mockPlayer.position.set).toHaveBeenCalledWith(100, 200, 300);
    expect(mockPlayer.setHealth).toHaveBeenCalledWith(50);
    expect(mockPlayer.inventory.fromJSON).toHaveBeenCalledWith({ items: { 5: 20 } });
    expect(mockPlayer.inventory.save).toHaveBeenCalled();
  });

  test('should handle missing player when restoring state', () => {
    world.player = null;
    const playerData = {
      position: { x: 100, y: 200, z: 300 },
      health: 50
    };

    // Should not throw error
    expect(() => world.restorePlayerState(playerData)).not.toThrow();
  });

  test('should register keyboard shortcuts', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    new StoreWorldBaseClass();
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'keydown',
      expect.any(Function)
    );
    addEventListenerSpy.mockRestore();
  });
});
