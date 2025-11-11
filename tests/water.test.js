import { describe, test, expect, beforeEach } from '@jest/globals';
import { Water } from '../scripts/biome/water.js';

describe('Water', () => {
  let water;
  let params;
  let size;

  beforeEach(() => {
    params = {
      waterOffset: 4
    };

    size = {
      width: 32,
      height: 32
    };

    water = new Water(size, params);
  });

  test('should create water instance', () => {
    expect(water).toBeDefined();
    expect(water.size).toEqual(size);
    expect(water.params).toEqual(params);
  });

  test('should have default waterOffset', () => {
    expect(water.params.waterOffset).toBe(4);
  });

  test('should generate water mesh', () => {
    water.generate();
    
    expect(water.children.length).toBe(1);
  });

  test('should position water at correct height', () => {
    water.generate();
    
    const waterMesh = water.children[0];
    expect(waterMesh.position.y).toBe(params.waterOffset + 0.4);
  });

  test('should scale water to chunk size', () => {
    water.generate();
    
    const waterMesh = water.children[0];
    expect(waterMesh.scale.x).toBe(size.width);
    expect(waterMesh.scale.y).toBe(size.width);
  });
});
