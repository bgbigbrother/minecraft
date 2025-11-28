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
    
    // Mock methods that are defined in child classes
    world.disposeChunks = jest.fn();
    world.droppedItems = [];
  });

  test('should create world instance', () => {
    expect(world).toBeDefined();
    expect(world.dataStore).toBeDefined();
    expect(world.name).toBe('Test World');
  });

  test('should get player state correctly', () => {
    const playerState = world.getPlayerState();
    
    expect(playerState).toEqual({
      position: { x: 10, y: 32, z: 30 },
      health: 85,
      inventory: { items: { 1: 5, 2: 3 } },
      animationState: {
        currentState: 'IDLE',
        combatMode: false
      }
    });
  });

  test('should return default player state when no player', () => {
    world.player = null;
    const playerState = world.getPlayerState();
    
    expect(playerState).toEqual({
      position: { x: 32, y: 32, z: 32 },
      health: 100,
      inventory: {},
      animationState: {
        currentState: 'IDLE',
        combatMode: false
      }
    });
  });

  test('should load world data from event detail', async () => {
    const worldData = {
      params: { seed: 123 },
      data: { '0,0,1,1,1': 2 },
      name: 'Test World',
      player: {
        position: { x: 10, y: 20, z: 30 },
        health: 85,
        inventory: { items: { 1: 5, 2: 3 } }
      }
    };

    // Mock the generate method to avoid errors
    world.generate = jest.fn();

    // Create event with world data
    const event = new CustomEvent('game:menu:load', {
      detail: worldData
    });

    world.load(event);
    
    // Wait for setTimeout to execute
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Check that reset was called (which clears chunks)
    expect(world.disposeChunks).toHaveBeenCalled();
    expect(world.params).toEqual(worldData.params);
    expect(world.dataStore.data).toEqual(worldData.data);
    expect(world.name).toBe('Test World');
    expect(world.generate).toHaveBeenCalled();
  });

  test('should handle missing event detail gracefully', () => {
    // Mock console.error to avoid noise in test output
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Mock the generate method
    world.generate = jest.fn();

    // Create event with missing data
    const event = new CustomEvent('game:menu:load', {
      detail: {}
    });

    world.load(event);
    
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(world.generate).not.toHaveBeenCalled();
    
    consoleErrorSpy.mockRestore();
  });

  test('should restore player state from loaded data', () => {
    const playerData = {
      position: { x: 100, y: 200, z: 300 },
      health: 50,
      inventory: { items: { 5: 20 } },
      animationState: {
        currentState: 'COMBAT_IDLE',
        combatMode: true
      }
    };

    // Add setAnimationState method to mock player
    mockPlayer.setAnimationState = jest.fn();

    world.restorePlayerState(playerData);
    
    // Trigger the world loaded event to execute the restoration
    const event = new CustomEvent('game:engine:world:loaded');
    document.dispatchEvent(event);
    
    expect(mockPlayer.position.set).toHaveBeenCalledWith(100, 200, 300);
    expect(mockPlayer.setHealth).toHaveBeenCalledWith(50);
    expect(mockPlayer.inventory.fromJSON).toHaveBeenCalledWith({ items: { 5: 20 } });
    expect(mockPlayer.inventory.save).toHaveBeenCalled();
    expect(mockPlayer.setAnimationState).toHaveBeenCalledWith({
      currentState: 'COMBAT_IDLE',
      combatMode: true
    });
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

  test('should get player animation state when player has getAnimationState method', () => {
    mockPlayer.getAnimationState = jest.fn(() => ({
      currentState: 'PUNCH_LEFT',
      combatMode: true
    }));

    const playerState = world.getPlayerState();
    
    expect(mockPlayer.getAnimationState).toHaveBeenCalled();
    expect(playerState.animationState).toEqual({
      currentState: 'PUNCH_LEFT',
      combatMode: true
    });
  });

  test('should use default animation state when player lacks getAnimationState method', () => {
    // Ensure player doesn't have getAnimationState method
    delete mockPlayer.getAnimationState;

    const playerState = world.getPlayerState();
    
    expect(playerState.animationState).toEqual({
      currentState: 'IDLE',
      combatMode: false
    });
  });

  test('should handle missing animation state in restore gracefully', () => {
    const playerData = {
      position: { x: 100, y: 200, z: 300 },
      health: 50,
      inventory: { items: { 5: 20 } }
      // No animationState
    };

    mockPlayer.setAnimationState = jest.fn();

    world.restorePlayerState(playerData);
    
    // Trigger the world loaded event
    const event = new CustomEvent('game:engine:world:loaded');
    document.dispatchEvent(event);
    
    // Should not call setAnimationState when animationState is missing
    expect(mockPlayer.setAnimationState).not.toHaveBeenCalled();
  });

  test('should register event listeners', () => {
    const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
    new StoreWorldBaseClass();
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'game:menu:load',
      expect.any(Function)
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      'game:menu:save',
      expect.any(Function)
    );
    addEventListenerSpy.mockRestore();
  });
});
