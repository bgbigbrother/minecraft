import { describe, test, expect, beforeEach, jest } from '@jest/globals';
import { EditChunkStoreWorldBaseClass } from '../scripts/world/edit_chunk.js';

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
    }
    generate() {}
    getBlock(x, y, z) {
      return { id: 1, instanceId: 0 };
    }
    addBlock(x, y, z, blockId) {}
    removeBlock(x, y, z) {}
    addBlockInstance(x, y, z) {}
    deleteBlockInstance(x, y, z) {}
    isBlockObscured(x, y, z) {
      return false;
    }
    inBounds(x, y, z) {
      return true;
    }
  }
}));

describe('EditChunkStoreWorldBaseClass', () => {
  let world;

  beforeEach(() => {
    world = new EditChunkStoreWorldBaseClass({});
    // Mock the spawnDroppedItem method that's called during removeBlock
    world.spawnDroppedItem = jest.fn();
  });

  test('should create world instance', () => {
    expect(world).toBeDefined();
  });

  test('should get block at world coordinates', () => {
    const mockChunk = {
      userData: { x: 0, z: 0 },
      loaded: true,
      getBlock: jest.fn(() => ({ id: 1, instanceId: 0 }))
    };
    world.children.push(mockChunk);

    const block = world.getBlock(5, 10, 5);
    
    expect(mockChunk.getBlock).toHaveBeenCalled();
  });

  test('should return null for unloaded chunk', () => {
    const block = world.getBlock(100, 10, 100);
    expect(block).toBeNull();
  });

  test('should add block at world coordinates', () => {
    const mockChunk = {
      userData: { x: 0, z: 0 },
      loaded: true,
      addBlock: jest.fn(),
      isBlockObscured: jest.fn(() => false)
    };
    world.children.push(mockChunk);

    world.addBlock(5, 10, 5, 2);
    
    expect(mockChunk.addBlock).toHaveBeenCalled();
  });

  test('should not remove bedrock layer', () => {
    const mockChunk = {
      userData: { x: 0, z: 0 },
      loaded: true,
      removeBlock: jest.fn()
    };
    world.children.push(mockChunk);

    world.removeBlock(5, 0, 5);
    
    expect(mockChunk.removeBlock).not.toHaveBeenCalled();
  });

  test('should remove block at world coordinates', () => {
    const mockChunk = {
      userData: { x: 0, z: 0 },
      loaded: true,
      getBlock: jest.fn(() => ({ id: 1, instanceId: 0 })),
      removeBlock: jest.fn(),
      addBlockInstance: jest.fn(),
      isBlockObscured: jest.fn(() => false)
    };
    world.children.push(mockChunk);

    world.removeBlock(5, 10, 5);
    
    expect(mockChunk.removeBlock).toHaveBeenCalled();
  });

  test('should prevent block placement when inventory check fails', () => {
    const mockChunk = {
      userData: { x: 0, z: 0 },
      loaded: true,
      addBlock: jest.fn(),
      isBlockObscured: jest.fn(() => false)
    };
    world.children.push(mockChunk);

    // Mock inventory manager that doesn't have the item
    const mockInventory = {
      hasItem: jest.fn(() => false)
    };

    const result = world.addBlock(5, 10, 5, 2, mockInventory);
    
    expect(result).toBe(false);
    expect(mockChunk.addBlock).not.toHaveBeenCalled();
    expect(mockInventory.hasItem).toHaveBeenCalledWith(2);
  });

  test('should allow block placement when inventory check passes', () => {
    const mockChunk = {
      userData: { x: 0, z: 0 },
      loaded: true,
      addBlock: jest.fn(),
      isBlockObscured: jest.fn(() => false)
    };
    world.children.push(mockChunk);

    // Mock inventory manager that has the item
    const mockInventory = {
      hasItem: jest.fn(() => true)
    };

    const result = world.addBlock(5, 10, 5, 2, mockInventory);
    
    expect(result).toBe(true);
    expect(mockChunk.addBlock).toHaveBeenCalled();
    expect(mockInventory.hasItem).toHaveBeenCalledWith(2);
  });

  test('should allow block placement without inventory manager', () => {
    const mockChunk = {
      userData: { x: 0, z: 0 },
      loaded: true,
      addBlock: jest.fn(),
      isBlockObscured: jest.fn(() => false)
    };
    world.children.push(mockChunk);

    // No inventory manager provided
    const result = world.addBlock(5, 10, 5, 2);
    
    expect(result).toBe(true);
    expect(mockChunk.addBlock).toHaveBeenCalled();
  });
});
