import { Group } from 'three';

/**
 * Base class for the voxel world
 * Extends Three.js Group to act as a container for all chunks
 */
export class WorldBaseClass extends Group {
  /**
   * Whether or not to load chunks asynchronously
   * When true, chunks generate during browser idle time to prevent frame drops
   */
  asyncLoading = true;

  /**
   * The number of chunks to render around the player (render distance)
   * - 0: Only the chunk the player is standing on
   * - 1: Player's chunk + adjacent chunks (3x3 grid)
   * - 2: 5x5 grid of chunks
   * - 3: 7x7 grid of chunks (default)
   */
  drawDistance = 3;

  /**
   * Dimensions of each chunk in blocks
   */
  chunkSize = {
    width: 32,  // Chunk width (X axis)
    height: 32  // Chunk height (Y axis)
  };

  /**
   * World generation parameters
   * These control terrain shape, biomes, trees, resources, etc.
   */
  params = {
    seed: 1, // Random seed for procedural generation (use Math.floor(Math.random() * 10000) for random)
    
    // Terrain height and shape parameters
    terrain: {
      scale: 100,       // Noise scale (larger = smoother terrain)
      magnitude: 8,     // Height variation multiplier
      offset: 6,        // Base terrain height
      waterOffset: 4,   // Water level height (deprecated, use waterLevel)
      waterLevel: 4    // Y-coordinate below which water fills empty blocks
    },
    // Biome distribution parameters
    biomes: {
      scale: 500,  // Size of biome regions (larger = bigger biomes)
      variation: {
        amplitude: 0.2,  // How much biomes blend together
        scale: 50        // Smoothness of biome transitions
      },
      // Thresholds for biome types (0.0 to 1.0)
      tundraToTemperate: 0.25,  // Below this = tundra (snow)
      temperateToJungle: 0.5,   // Between this and above = temperate (grass)
      jungleToDesert: 0.75      // Above this = desert (sand)
    },
    
    // Tree generation parameters
    trees: {
      trunk: {
        minHeight: 4,  // Minimum tree trunk height in blocks
        maxHeight: 7   // Maximum tree trunk height in blocks
      },
      canopy: {
        minRadius: 3,  // Minimum leaf canopy radius
        maxRadius: 3,  // Maximum leaf canopy radius
        density: 0.7   // Leaf density (0.0 = sparse, 1.0 = full)
      },
      frequency: 0.005  // Probability of tree spawning per block
    },
    
    // Cloud generation parameters
    clouds: {
      scale: 30,    // Size of cloud formations
      density: 0.5  // How many clouds to generate (0.0 to 1.0)
    }
  };

  constructor() {
    super();
  }

  /**
   * Generates the world
   * Override this method in subclasses
   */
  generate() {}
}