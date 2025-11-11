import { describe, test, expect, beforeEach } from '@jest/globals';
import { Clouds } from '../scripts/biome/clouds.js';
import { RNG } from '../scripts/libraries/rng.js';

describe('Clouds', () => {
  let clouds;
  let params;
  let size;

  beforeEach(() => {
    params = {
      scale: 30,
      density: 0.5
    };

    size = {
      width: 32,
      height: 32
    };

    clouds = new Clouds(size, params);
  });

  test('should create clouds instance', () => {
    expect(clouds).toBeDefined();
    expect(clouds.size).toEqual(size);
    expect(clouds.params).toEqual(params);
  });

  test('should have default params', () => {
    expect(clouds.params.scale).toBe(30);
    expect(clouds.params.density).toBe(0.5);
  });

  test('should generate cloud mesh', () => {
    const rng = new RNG(1);
    clouds.generate(rng);
    
    expect(clouds.children.length).toBeGreaterThan(0);
  });

  test('should position clouds at correct height', () => {
    const rng = new RNG(1);
    clouds.generate(rng);
    
    const cloudMesh = clouds.children[0];
    expect(cloudMesh.position.y).toBe(size.height);
  });
});
