import { Group } from 'three';

export class WorldBaseClass extends Group {
    /**
   * Whether or not we want to load the chunks asynchronously
   */
  asyncLoading = true;

  /**
  * The number of chunks to render around the player.
  * When this is set to 0, the chunk the player is on
  * is the only one that is rendered. If it is set to 1,
  * the adjacent chunks are rendered; if set to 2, the
  * chunks adjacent to those are rendered, and so on.
  */
  drawDistance = 3;

  chunkSize = {
    width: 16,
    height: 32
  };

  params = {
    seed: 0,
    terrain: {
      scale: 100,
      magnitude: 8,
      offset: 6,
      waterOffset: 4
    },
    biomes: {
      scale: 500,
      variation: {
        amplitude: 0.2,
        scale: 50
      },
      tundraToTemperate: 0.25,
      temperateToJungle: 0.5,
      jungleToDesert: 0.75
    },
    trees: {
      trunk: {
        minHeight: 4,
        maxHeight: 7
      },
      canopy: {
        minRadius: 3,
        maxRadius: 3,
        density: 0.7 // Vary between 0.0 and 1.0
      },
      frequency: 0.005
    },
    clouds: {
      scale: 30,
      density: 0.5
    }
  };

  constructor() {
    super();
  }

  generate() {}
}