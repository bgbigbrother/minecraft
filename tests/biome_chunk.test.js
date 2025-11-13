import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { Chunk } from '../scripts/biome/chunk.js';

// Mock dependencies
jest.mock('../scripts/mobs/cow.js', () => ({
  Cow: class MockCow {
    constructor(model) {
      this.model = { name: 'Cow' };
    }
    generate(chunk) {}
    update(deltaTime) {}
  }
}));

jest.mock('../scripts/biome/biome.js', () => ({
  Biome: class MockBiome {
    constructor(params, dataStore, size) {
      this.params = params;
      this.dataStore = dataStore;
      this.size = size;
      this.position = { x: 0, y: 0, z: 0 };
      this.biome = 'Temperate';
      this.children = [];
    }
    generateTerrain() {}
    generateMeshes() {}
    setBlockId(x, y, z, id) {}
    add(obj) {
      this.children.push(obj);
    }
    traverse(callback) {
      this.children.forEach(callback);
    }
    clear() {
      this.children = [];
    }
  }
}));

describe('Chunk', () => {
  let chunk;
  let mockDataStore;
  let mockParams;
  let mockModels;

  beforeEach(() => {
    mockDataStore = {
      contains: jest.fn().mockReturnValue(false),
      get: jest.fn().mockReturnValue(0)
    };

    mockParams = {
      seed: 12345,
      terrain: {
        scale: 30,
        magnitude: 10,
        offset: 10,
        waterOffset: 10
      },
      biomes: {
        scale: 100,
        variation: {
          amplitude: 0.1,
          scale: 50
        },
        tundraToTemperate: 0.3,
        temperateToJungle: 0.5,
        jungleToDesert: 0.7
      },
      trees: {
        frequency: 0.01
      },
      clouds: {}
    };

    mockModels = {
      cow: { name: 'CowModel' }
    };

    chunk = new Chunk(32, mockParams, mockDataStore);
  });

  describe('constructor', () => {
    test('should initialize with correct properties', () => {
      expect(chunk.loaded).toBe(false);
      expect(chunk.name).toBe('Chunk');
      expect(chunk.animals).toEqual([]);
    });

    test('should accept size parameter', () => {
      const customChunk = new Chunk(64, mockParams, mockDataStore);
      expect(customChunk.size).toBe(64);
    });
  });

  describe('generate', () => {
    test('should set loaded to true after generation', () => {
      chunk.generateTerrain = jest.fn();
      chunk.loadPlayerChanges = jest.fn();
      chunk.generateMeshes = jest.fn();
      
      chunk.generate(mockModels);
      
      expect(chunk.loaded).toBe(true);
    });

    test('should call generateTerrain', () => {
      chunk.generateTerrain = jest.fn();
      chunk.loadPlayerChanges = jest.fn();
      chunk.generateMeshes = jest.fn();
      
      chunk.generate(mockModels);
      
      expect(chunk.generateTerrain).toHaveBeenCalled();
    });

    test('should call loadPlayerChanges', () => {
      chunk.generateTerrain = jest.fn();
      chunk.loadPlayerChanges = jest.fn();
      chunk.generateMeshes = jest.fn();
      
      chunk.generate(mockModels);
      
      expect(chunk.loadPlayerChanges).toHaveBeenCalled();
    });

    test('should call generateMeshes', () => {
      chunk.generateTerrain = jest.fn();
      chunk.loadPlayerChanges = jest.fn();
      chunk.generateMeshes = jest.fn();
      
      chunk.generate(mockModels);
      
      expect(chunk.generateMeshes).toHaveBeenCalled();
    });

    test('should add cow in Temperate biome', () => {
      chunk.biome = 'Temperate';
      chunk.generateTerrain = jest.fn();
      chunk.loadPlayerChanges = jest.fn();
      chunk.generateMeshes = jest.fn();
      
      chunk.generate(mockModels);
      
      expect(chunk.animals.length).toBe(1);
    });

    test('should add cow in Jungle biome', () => {
      chunk.biome = 'Jungle';
      chunk.generateTerrain = jest.fn();
      chunk.loadPlayerChanges = jest.fn();
      chunk.generateMeshes = jest.fn();
      
      chunk.generate(mockModels);
      
      expect(chunk.animals.length).toBe(1);
    });

    test('should not add cow in Desert biome', () => {
      chunk.biome = 'Desert';
      chunk.generateTerrain = jest.fn();
      chunk.loadPlayerChanges = jest.fn();
      chunk.generateMeshes = jest.fn();
      
      chunk.generate(mockModels);
      
      expect(chunk.animals.length).toBe(0);
    });

    test('should not add cow in Tundra biome', () => {
      chunk.biome = 'Tundra';
      chunk.generateTerrain = jest.fn();
      chunk.loadPlayerChanges = jest.fn();
      chunk.generateMeshes = jest.fn();
      
      chunk.generate(mockModels);
      
      expect(chunk.animals.length).toBe(0);
    });
  });

  describe('update', () => {
    test('should update all animals', () => {
      const mockAnimal1 = { update: jest.fn() };
      const mockAnimal2 = { update: jest.fn() };
      chunk.animals = [mockAnimal1, mockAnimal2];
      
      const deltaTime = 0.016;
      const mockWorld = {};
      chunk.update(deltaTime, mockWorld);
      
      expect(mockAnimal1.update).toHaveBeenCalledWith(deltaTime, mockWorld);
      expect(mockAnimal2.update).toHaveBeenCalledWith(deltaTime, mockWorld);
    });

    test('should handle empty animals array', () => {
      chunk.animals = [];
      expect(() => chunk.update(0.016, {})).not.toThrow();
    });

    test('should call update on each animal once', () => {
      const mockAnimal = { update: jest.fn() };
      chunk.animals = [mockAnimal];
      
      chunk.update(0.016, {});
      
      expect(mockAnimal.update).toHaveBeenCalledTimes(1);
    });
  });

  describe('loadPlayerChanges', () => {
    beforeEach(() => {
      chunk.size = { width: 2, height: 2 };
      chunk.position = { x: 0, z: 0 };
      chunk.setBlockId = jest.fn();
    });

    test('should not set blocks when dataStore is empty', () => {
      mockDataStore.contains.mockReturnValue(false);
      
      chunk.loadPlayerChanges();
      
      expect(chunk.setBlockId).not.toHaveBeenCalled();
    });

    test('should set blocks when dataStore contains changes', () => {
      mockDataStore.contains.mockReturnValue(true);
      mockDataStore.get.mockReturnValue(5);
      
      chunk.loadPlayerChanges();
      
      expect(chunk.setBlockId).toHaveBeenCalled();
      expect(mockDataStore.get).toHaveBeenCalled();
    });

    test('should iterate through all positions', () => {
      chunk.loadPlayerChanges();
      
      // Should check 2x2x2 = 8 positions
      expect(mockDataStore.contains).toHaveBeenCalledTimes(8);
    });

    test('should use correct chunk position', () => {
      chunk.position = { x: 10, z: 20 };
      mockDataStore.contains.mockReturnValue(true);
      
      chunk.loadPlayerChanges();
      
      expect(mockDataStore.contains).toHaveBeenCalledWith(10, 20, expect.any(Number), expect.any(Number), expect.any(Number));
    });

    test('should apply correct block id from dataStore', () => {
      mockDataStore.contains.mockReturnValue(true);
      mockDataStore.get.mockReturnValue(42);
      
      chunk.loadPlayerChanges();
      
      expect(chunk.setBlockId).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), expect.any(Number), 42);
    });
  });

  describe('disposeInstances', () => {
    test('should call dispose on objects with dispose method', () => {
      const mockObj1 = { dispose: jest.fn() };
      const mockObj2 = { dispose: jest.fn() };
      chunk.children = [mockObj1, mockObj2];
      chunk.clear = jest.fn();
      
      chunk.disposeInstances();
      
      expect(mockObj1.dispose).toHaveBeenCalled();
      expect(mockObj2.dispose).toHaveBeenCalled();
    });

    test('should not throw on objects without dispose method', () => {
      const mockObj = { name: 'test' };
      chunk.children = [mockObj];
      chunk.clear = jest.fn();
      
      expect(() => chunk.disposeInstances()).not.toThrow();
    });

    test('should call clear after disposing', () => {
      chunk.clear = jest.fn();
      chunk.children = [];
      
      chunk.disposeInstances();
      
      expect(chunk.clear).toHaveBeenCalled();
    });

    test('should handle empty children array', () => {
      chunk.children = [];
      chunk.clear = jest.fn();
      
      expect(() => chunk.disposeInstances()).not.toThrow();
      expect(chunk.clear).toHaveBeenCalled();
    });
  });
});
