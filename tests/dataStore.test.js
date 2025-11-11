import { describe, test, expect, beforeEach } from '@jest/globals';
import { DataStore } from '../scripts/world/world_store.js';

describe('DataStore', () => {
  let dataStore;

  beforeEach(() => {
    dataStore = new DataStore();
  });

  test('should create empty data store', () => {
    expect(dataStore).toBeDefined();
    expect(dataStore.data).toEqual({});
  });

  test('should store block data', () => {
    dataStore.set(0, 0, 5, 10, 15, 1);
    expect(dataStore.contains(0, 0, 5, 10, 15)).toBe(true);
  });

  test('should retrieve stored block data', () => {
    dataStore.set(1, 2, 3, 4, 5, 42);
    const blockId = dataStore.get(1, 2, 3, 4, 5);
    expect(blockId).toBe(42);
  });

  test('should return undefined for non-existent block', () => {
    const blockId = dataStore.get(10, 20, 30, 40, 50);
    expect(blockId).toBeUndefined();
  });

  test('should return false for non-existent block in contains', () => {
    expect(dataStore.contains(10, 20, 30, 40, 50)).toBe(false);
  });

  test('should clear all data', () => {
    dataStore.set(0, 0, 1, 2, 3, 5);
    dataStore.set(1, 1, 4, 5, 6, 10);
    
    dataStore.clear();
    
    expect(dataStore.data).toEqual({});
    expect(dataStore.contains(0, 0, 1, 2, 3)).toBe(false);
    expect(dataStore.contains(1, 1, 4, 5, 6)).toBe(false);
  });

  test('should handle negative coordinates', () => {
    dataStore.set(-1, -2, 3, 4, 5, 99);
    expect(dataStore.get(-1, -2, 3, 4, 5)).toBe(99);
  });

  test('should overwrite existing block data', () => {
    dataStore.set(0, 0, 1, 1, 1, 5);
    dataStore.set(0, 0, 1, 1, 1, 10);
    
    expect(dataStore.get(0, 0, 1, 1, 1)).toBe(10);
  });

  test('should handle multiple blocks independently', () => {
    dataStore.set(0, 0, 1, 1, 1, 5);
    dataStore.set(0, 0, 2, 2, 2, 10);
    dataStore.set(1, 1, 3, 3, 3, 15);
    
    expect(dataStore.get(0, 0, 1, 1, 1)).toBe(5);
    expect(dataStore.get(0, 0, 2, 2, 2)).toBe(10);
    expect(dataStore.get(1, 1, 3, 3, 3)).toBe(15);
  });
});
