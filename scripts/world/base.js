import { Group } from 'three';
import settings from './config';

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
  params = settings
  
  constructor() {
    super();
  }

  /**
   * Generates the world
   * Override this method in subclasses
   */
  generate() {}
}