import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { ChunkStoreWorldBaseClass } from '../scripts/world/chunk.js';

// Mock the Chunk class
jest.mock('../scripts/biome/chunk.js', () => ({
  Chunk: class MockChunk {
    constructor(chunkSize, params, dataStore) {
      this.chunkSize = chunkSize;
      this.params = params;
      this.dataStore = dataStore;
      this.position = { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.userData = {};
    }
    generate() {}
  }
}));

describe('ChunkStoreWorldBaseClass', () => {
  let world;

  beforeEach(() => {
    world = new ChunkStoreWorldBaseClass({});
  });

  describe('worldToChunkCoords', () => {
    test('should convert world coords to chunk and block coords', () => {
      const result = world.worldToChunkCoords(35, 10, 50);
      
      expect(result.chunk.x).toBe(1);
      expect(result.chunk.z).toBe(1);
      expect(result.block.x).toBe(3);
      expect(result.block.y).toBe(10);
      expect(result.block.z).toBe(18);
    });

    test('should handle negative world coordinates', () => {
      const result = world.worldToChunkCoords(-10, 5, -20);
      
      expect(result.chunk.x).toBe(-1);
      expect(result.chunk.z).toBe(-1);
    });

    test('should handle zero coordinates', () => {
      const result = world.worldToChunkCoords(0, 0, 0);
      
      expect(result.chunk.x).toBe(0);
      expect(result.chunk.z).toBe(0);
      expect(result.block.x).toBe(0);
      expect(result.block.y).toBe(0);
      expect(result.block.z).toBe(0);
    });

    test('should handle chunk boundary coordinates', () => {
      const result = world.worldToChunkCoords(32, 10, 32);
      
      expect(result.chunk.x).toBe(1);
      expect(result.chunk.z).toBe(1);
      expect(result.block.x).toBe(0);
      expect(result.block.z).toBe(0);
    });
  });

  describe('chunkToWorldCoords', () => {
    test('should convert chunk coords to world coords', () => {
      const result = world.chunkToWorldCoords(1, 10, 1);
      
      expect(result.chunk.x).toBe(32);
      expect(result.chunk.z).toBe(32);
    });

    test('should handle zero chunk coordinates', () => {
      const result = world.chunkToWorldCoords(0, 0, 0);
      
      expect(result.chunk.x).toBe(0);
      expect(result.chunk.z).toBe(0);
    });
  });

  describe('getChunk', () => {
    test('should return undefined when chunk does not exist', () => {
      const chunk = world.getChunk(0, 0);
      expect(chunk).toBeUndefined();
    });

    test('should find chunk by coordinates', () => {
      // Add a mock chunk
      const mockChunk = {
        userData: { x: 1, z: 2 }
      };
      world.children.push(mockChunk);
      
      const chunk = world.getChunk(1, 2);
      expect(chunk).toBe(mockChunk);
    });

    test('should return undefined for non-matching coordinates', () => {
      const mockChunk = {
        userData: { x: 1, z: 2 }
      };
      world.children.push(mockChunk);
      
      const chunk = world.getChunk(3, 4);
      expect(chunk).toBeUndefined();
    });
  });
});
