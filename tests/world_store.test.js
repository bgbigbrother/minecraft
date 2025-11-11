import { describe, test, expect, beforeEach } from '@jest/globals';
import { DataStore } from '../scripts/world/world_store.js';

describe('DataStore', () => {
  let dataStore;

  beforeEach(() => {
    dataStore = new DataStore();
  });

  test('should create data store instance', () => {
    expect(dataStore).toBeDefined();
    expect(dataStore.data).toEqual({});
  });

  test('should clear data', () => {
    dataStore.set(0, 0, 1, 1, 1, 5);
    dataStore.clear();
    expect(dataStore.data).toEqual({});
  });

  test('should check if data contains block', () => {
    dataStore.set(0, 0, 1, 1, 1, 5);
    expect(dataStore.contains(0, 0, 1, 1, 1)).toBe(true);
    expect(dataStore.contains(0, 0, 2, 2, 2)).toBe(false);
  });

  test('should get block data', () => {
    dataStore.set(0, 0, 1, 1, 1, 5);
    expect(dataStore.get(0, 0, 1, 1, 1)).toBe(5);
  });

  test('should return undefined for non-existent block', () => {
    expect(dataStore.get(0, 0, 1, 1, 1)).toBeUndefined();
  });

  test('should set block data', () => {
    dataStore.set(0, 0, 1, 1, 1, 5);
    expect(dataStore.data['0,0,1,1,1']).toBe(5);
  });

  test('should handle multiple blocks', () => {
    dataStore.set(0, 0, 1, 1, 1, 5);
    dataStore.set(1, 1, 2, 2, 2, 10);
    
    expect(dataStore.get(0, 0, 1, 1, 1)).toBe(5);
    expect(dataStore.get(1, 1, 2, 2, 2)).toBe(10);
  });

  test('should overwrite existing block data', () => {
    dataStore.set(0, 0, 1, 1, 1, 5);
    dataStore.set(0, 0, 1, 1, 1, 10);
    
    expect(dataStore.get(0, 0, 1, 1, 1)).toBe(10);
  });
});
