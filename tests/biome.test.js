import { describe, test, expect, beforeEach } from '@jest/globals';
import { Biome } from '../scripts/biome/biome.js';

describe('Biome', () => {
  let biome;
  let params;
  let dataStore;

  beforeEach(() => {
    params = {
      seed: 1,
      terrain: {
        scale: 100,
        magnitude: 8,
        offset: 6,
        waterOffset: 4
      },
      biomes: {
        scale: 500,
        tundraToTemperate: 0.25,
        temperateToJungle: 0.5,
        jungleToDesert: 0.75,
        variation: {
          amplitude: 0.3,
          scale: 100
        }
      },
      trees: {
        frequency: 0.005,
        trunk: { minHeight: 4, maxHeight: 7 },
        canopy: { minRadius: 2, maxRadius: 4, density: 0.8 }
      },
      clouds: {
        scale: 30,
        density: 0.5
      }
    };

    dataStore = {
      contains: () => false,
      get: () => undefined
    };

    biome = new Biome(params, dataStore, { width: 32, height: 32 });
  });

  test('should create biome instance', () => {
    expect(biome).toBeDefined();
    expect(biome.params).toEqual(params);
  });

  test('should have RNG initialized with seed', () => {
    expect(biome.rng).toBeDefined();
  });

  test('should have null biome by default', () => {
    expect(biome.biome).toBeNull();
  });

  test('should generate terrain', () => {
    biome.position = { x: 0, z: 0 };
    biome.generateTerrain();
    
    // Check that some blocks were generated
    let hasBlocks = false;
    for (let x = 0; x < biome.size.width; x++) {
      for (let z = 0; z < biome.size.width; z++) {
        for (let y = 0; y < biome.size.height; y++) {
          if (biome.getBlock(x, y, z).id !== 0) {
            hasBlocks = true;
            break;
          }
        }
      }
    }
    expect(hasBlocks).toBe(true);
  });
});
