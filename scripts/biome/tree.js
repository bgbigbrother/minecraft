import { blocks } from '../textures/blocks.js';

export class Tree {
  params = {
    trunk: {
      minHeight: 4,
      maxHeight: 7
    },
    canopy: {
      minRadius: 3,
      maxRadius: 3,
      density: 0.7 // Vary between 0.0 and 1.0
    },
  };
  
  blocks = [];

   /**
   * Creates a tree template
   * @param {string} biome 
   * @param {object} rng 
   * @param {number} x 
   * @param {number} y 
   * @param {number} z 
   * @param {object} params 
   */
  constructor(biome, rng, x, y, z, params) {
    this.biome = biome;
    this.rng = rng;
    this.x = x;
    this.y = y;
    this.z = z;
    this.params = params;
  }

  /**
   * Generates tree blocks
   * @returns {Array} Array of block data {x, y, z, id}
   */
  generate() {
    this.blocks = [];
    this.generateTrunk();
    
    if (this.biome === 'Temperate' || this.biome === 'Jungle') {
      this.generateCanopy();
    }
    
    return this.blocks;
  }

  generateTrunk() {
    const minH = this.params.trunk.minHeight;
    const maxH = this.params.trunk.maxHeight;
    const h = Math.round(minH + (maxH - minH) * this.rng.random());

    for (let treeY = this.y; treeY < this.y + h; treeY++) {
      let blockId;
      if (this.biome === 'Temperate' || this.biome === 'Tundra') {
        blockId = blocks.tree.id;
      } else if (this.biome === 'Jungle') {
        blockId = blocks.jungleTree.id;
      } else if (this.biome === 'Desert') {
        blockId = blocks.cactus.id;
      }

      this.blocks.push({
        x: this.x,
        y: treeY,
        z: this.z,
        id: blockId
      });
    }
  }

  generateCanopy() {
    const minR = this.params.canopy.minRadius;
    const maxR = this.params.canopy.maxRadius;
    const r = Math.round(minR + (maxR - minR) * this.rng.random());
    const centerY = this.y + this.getTrunkHeight();

    for (let x = -r; x <= r; x++) {
      for (let y = -r; y <= r; y++) {
        for (let z = -r; z <= r; z++) {
          const n = this.rng.random();

          if (x * x + y * y + z * z > r * r) continue;
          
          if (n < this.params.canopy.density) {
            let blockId;
            if (this.biome === 'Temperate') {
              blockId = blocks.leaves.id;
            } else if (this.biome === 'Jungle') {
              blockId = blocks.jungleLeaves.id;
            }

            this.blocks.push({
              x: this.x + x,
              y: centerY + y,
              z: this.z + z,
              id: blockId
            });
          }
        }
      }
    }
  }

  getTrunkHeight() {
    const minH = this.params.trunk.minHeight;
    const maxH = this.params.trunk.maxHeight;
    return Math.round(minH + (maxH - minH) * this.rng.random());
  }
}