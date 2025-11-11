import { describe, test, expect, beforeEach, jest } from '@jest/globals';

// Mock localStorage globally
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn()
};

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true
});

import { StoreWorldBaseClass } from '../scripts/world/store_world.js';

describe('StoreWorldBaseClass', () => {
  let world;

  beforeEach(() => {
    // Reset mocks
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();

    // Mock document with proper status element
    const mockStatusElement = { innerHTML: '' };
    const originalGetElementById = document.getElementById;
    document.getElementById = jest.fn((id) => {
      if (id === 'status') return mockStatusElement;
      return originalGetElementById.call(document, id);
    });

    world = new StoreWorldBaseClass();
  });

  test('should create world instance', () => {
    expect(world).toBeDefined();
    expect(world.dataStore).toBeDefined();
  });

  test('should save world data to localStorage', () => {
    // Mock setTimeout to avoid timing issues
    global.setTimeout = jest.fn();
    
    world.save();
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'minecraft_params',
      expect.any(String)
    );
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'minecraft_data',
      expect.any(String)
    );
  });

  test('should load world data from localStorage', () => {
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
