import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { World } from '../scripts/world/world.js';

// Mock the Chunk class
jest.mock('../scripts/biome/chunk.js', () => ({
  Chunk: class MockChunk {
    constructor(chunkSize, params, dataStore) {
      this.chunkSize = chunkSize;
      this.params = params;
      this.dataStore = dataStore;
      this.position = { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.userData = {};
      this.loaded = true;
      this.name = "Chunk";
    }
    generate() {
      this.loaded = true;
    }
    update() {}
    disposeInstances() {
      this.disposed = true;
    }
  }
}));

// Mock DataStore
jest.mock('../scripts/world/world_store.js', () => ({
  DataStore: class MockDataStore {
    constructor() {
      this.data = {};
    }
    clear() {
      this.data = {};
    }
  }
}));

describe('World', () => {
  let world;
  let mockModels;

  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Mock DOM elements
    document.body.innerHTML = '<div id="status"></div>';
    
    mockModels = {
      cow: { model: 'cow_model' },
      tree: { model: 'tree_model' }
    };
    
    world = new World(mockModels);
  });

  describe('constructor', () => {
    test('should create a world instance with models', () => {
      expect(world).toBeDefined();
      expect(world.models).toBe(mockModels);
    });

    test('should inherit properties from base classes', () => {
      expect(world.drawDistance).toBe(3);
      expect(world.chunkSize).toEqual({ width: 32, height: 32 });
      expect(world.asyncLoading).toBe(true);
      expect(world.params).toBeDefined();
    });
  });

  describe('generate', () => {
    test('should generate chunks within draw distance', () => {
      world.drawDistance = 1;
      world.generate();
      
      // With drawDistance = 1, should generate 3x3 = 9 chunks
      // (-1,-1), (-1,0), (-1,1), (0,-1), (0,0), (0,1), (1,-1), (1,0), (1,1)
      expect(world.children.length).toBe(9);
    });

    test('should generate correct number of chunks for drawDistance = 0', () => {
      world.drawDistance = 0;
      world.generate();
      
      // With drawDistance = 0, should generate 1x1 = 1 chunk at (0,0)
      expect(world.children.length).toBe(1);
    });

    test('should generate correct number of chunks for drawDistance = 2', () => {
      world.drawDistance = 2;
      world.generate();
      
      // With drawDistance = 2, should generate 5x5 = 25 chunks
      expect(world.children.length).toBe(25);
    });

    test('should clear existing chunks before regenerating', () => {
      world.drawDistance = 1;
      world.generate();
      
      const firstGenCount = world.children.length;
      
      world.generate();
      
      // Should have same number of chunks, not doubled
      expect(world.children.length).toBe(firstGenCount);
    });

    test('should clear dataStore cache when clearCache is true', () => {
      const clearSpy = jest.spyOn(world.dataStore, 'clear');
      
      world.generate(true);
      
      expect(clearSpy).toHaveBeenCalled();
    });

    test('should not clear dataStore cache when clearCache is false', () => {
      const clearSpy = jest.spyOn(world.dataStore, 'clear');
      
      world.generate(false);
      
      expect(clearSpy).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    let mockPlayer;

    beforeEach(() => {
      mockPlayer = {
        position: { x: 0, y: 10, z: 0 }
      };
      world.drawDistance = 1;
      world.generate();
    });

    test('should call update on all chunks', () => {
      const dt = 0.016; // ~60fps
      
      // Add update spy to chunks
      world.children.forEach(chunk => {
        chunk.update = jest.fn();
      });
      
      world.update(dt, mockPlayer);
      
      world.children.forEach(chunk => {
        expect(chunk.update).toHaveBeenCalledWith(dt);
      });
    });

    test('should not add or remove chunks when player is at origin', () => {
      const initialChunkCount = world.children.length;
      
      world.update(0.016, mockPlayer);
      
      expect(world.children.length).toBe(initialChunkCount);
    });

    test('should add new chunks when player moves', () => {
      const initialChunks = world.children.map(c => ({ x: c.userData.x, z: c.userData.z }));
      
      // Move player to a new chunk area (just 1 chunk away)
      mockPlayer.position.x = 48; // 1.5 chunks away
      mockPlayer.position.z = 48;
      
      world.update(0.016, mockPlayer);
      
      const newChunks = world.children.map(c => ({ x: c.userData.x, z: c.userData.z }));
      
      // Should have some different chunks now
      const hasNewChunks = newChunks.some(nc => 
        !initialChunks.some(ic => ic.x === nc.x && ic.z === nc.z)
      );
      
      expect(hasNewChunks).toBe(true);
    });

    test('should remove chunks outside draw distance', () => {
      // Move player far away
      mockPlayer.position.x = 200;
      mockPlayer.position.z = 200;
      
      world.update(0.016, mockPlayer);
      
      // Should have removed old chunks and added new ones
      // Total should still be 9 for drawDistance = 1
      expect(world.children.length).toBe(9);
    });
  });

  describe('getVisibleChunks', () => {
    let mockPlayer;

    beforeEach(() => {
      mockPlayer = {
        position: { x: 0, y: 10, z: 0 }
      };
      world.drawDistance = 1;
    });

    test('should return correct visible chunks for player at origin', () => {
      const visibleChunks = world.getVisibleChunks(mockPlayer);
      
      expect(visibleChunks.length).toBe(9);
      expect(visibleChunks).toContainEqual({ x: 0, z: 0 });
      expect(visibleChunks).toContainEqual({ x: -1, z: -1 });
      expect(visibleChunks).toContainEqual({ x: 1, z: 1 });
    });

    test('should return correct visible chunks for player in positive coordinates', () => {
      mockPlayer.position.x = 64; // Chunk 2
      mockPlayer.position.z = 64; // Chunk 2
      
      const visibleChunks = world.getVisibleChunks(mockPlayer);
      
      expect(visibleChunks.length).toBe(9);
      expect(visibleChunks).toContainEqual({ x: 2, z: 2 });
      expect(visibleChunks).toContainEqual({ x: 1, z: 1 });
      expect(visibleChunks).toContainEqual({ x: 3, z: 3 });
    });

    test('should return correct visible chunks for player in negative coordinates', () => {
      mockPlayer.position.x = -64; // Chunk -2
      mockPlayer.position.z = -64; // Chunk -2
      
      const visibleChunks = world.getVisibleChunks(mockPlayer);
      
      expect(visibleChunks.length).toBe(9);
      expect(visibleChunks).toContainEqual({ x: -2, z: -2 });
      expect(visibleChunks).toContainEqual({ x: -3, z: -3 });
      expect(visibleChunks).toContainEqual({ x: -1, z: -1 });
    });

    test('should scale with draw distance', () => {
      world.drawDistance = 2;
      
      const visibleChunks = world.getVisibleChunks(mockPlayer);
      
      // drawDistance = 2 means 5x5 = 25 chunks
      expect(visibleChunks.length).toBe(25);
    });
  });

  describe('getChunksToAdd', () => {
    beforeEach(() => {
      world.drawDistance = 1;
      world.generate();
    });

    test('should return empty array when all visible chunks exist', () => {
      const visibleChunks = [
        { x: 0, z: 0 },
        { x: 1, z: 0 },
        { x: -1, z: 0 }
      ];
      
      const chunksToAdd = world.getChunksToAdd(visibleChunks);
      
      expect(chunksToAdd.length).toBe(0);
    });

    test('should return chunks that need to be added', () => {
      const visibleChunks = [
        { x: 0, z: 0 },  // Exists
        { x: 5, z: 5 },  // Does not exist
        { x: 6, z: 6 }   // Does not exist
      ];
      
      const chunksToAdd = world.getChunksToAdd(visibleChunks);
      
      expect(chunksToAdd.length).toBe(2);
      expect(chunksToAdd).toContainEqual({ x: 5, z: 5 });
      expect(chunksToAdd).toContainEqual({ x: 6, z: 6 });
    });

    test('should handle empty visible chunks array', () => {
      const chunksToAdd = world.getChunksToAdd([]);
      
      expect(chunksToAdd.length).toBe(0);
    });
  });

  describe('removeUnusedChunks', () => {
    beforeEach(() => {
      world.drawDistance = 1;
      world.generate();
    });

    test('should not remove chunks that are still visible', () => {
      const visibleChunks = world.children.map(chunk => ({
        x: chunk.userData.x,
        z: chunk.userData.z
      }));
      
      const initialCount = world.children.length;
      
      world.removeUnusedChunks(visibleChunks);
      
      expect(world.children.length).toBe(initialCount);
    });

    test('should remove chunks that are no longer visible', () => {
      const visibleChunks = [
        { x: 0, z: 0 }
      ];
      
      world.removeUnusedChunks(visibleChunks);
      
      // Should only have 1 chunk left
      expect(world.children.length).toBe(1);
      expect(world.children[0].userData).toEqual({ x: 0, z: 0 });
    });

    test('should call disposeInstances on removed chunks', () => {
      const visibleChunks = [{ x: 0, z: 0 }];
      
      // Track which chunks get disposed
      const disposedChunks = [];
      world.children.forEach(chunk => {
        const originalDispose = chunk.disposeInstances;
        chunk.disposeInstances = function() {
          disposedChunks.push(chunk);
          originalDispose.call(this);
        };
      });
      
      world.removeUnusedChunks(visibleChunks);
      
      // Should have disposed 8 chunks (9 total - 1 kept)
      expect(disposedChunks.length).toBe(8);
    });

    test('should handle empty visible chunks array', () => {
      world.removeUnusedChunks([]);
      
      // All chunks should be removed
      expect(world.children.length).toBe(0);
    });
  });

  describe('disposeChunks', () => {
    beforeEach(() => {
      world.drawDistance = 1;
      world.generate();
    });

    test('should dispose all chunks', () => {
      const chunks = [...world.children];
      
      world.disposeChunks();
      
      chunks.forEach(chunk => {
        expect(chunk.disposed).toBe(true);
      });
    });

    test('should clear all children', () => {
      world.disposeChunks();
      
      expect(world.children.length).toBe(0);
    });

    test('should handle world with no chunks', () => {
      world.clear();
      
      expect(() => world.disposeChunks()).not.toThrow();
      expect(world.children.length).toBe(0);
    });
  });
});
