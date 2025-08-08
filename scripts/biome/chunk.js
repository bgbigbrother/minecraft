import { Cow } from '../mobs/cow';
import { Biome } from './biome';

export class Chunk extends Biome {
  
  animals = [];

  constructor(size, params, dataStore) {
    super(params, dataStore, size);
    this.loaded = false;
    this.name = "Chunk"
  }

  /**
    * Generates the world data and meshes
    */
  generate(models) {
    const start = performance.now();

    this.generateTerrain();
    this.loadPlayerChanges();
    this.generateMeshes();

    if (this.biome === 'Temperate' || this.biome === 'Jungle') {
      const cow = new Cow(models.cow);
      cow.generate(this);
      this.animals.push(cow);
      this.add(cow.model);
    }

    this.loaded = true;

    //console.log(`Loaded chunk in ${performance.now() - start}ms`);
  }

  update(deltaTime) {
    this.animals.forEach((animal) => animal.update(deltaTime));
  }

  /**
   * Pulls any changes from the data store and applies them to the data model
   */
  loadPlayerChanges() {
    for (let x = 0; x < this.size.width; x++) {
      for (let y = 0; y < this.size.height; y++) {
        for (let z = 0; z < this.size.width; z++) {
          if (this.dataStore.contains(this.position.x, this.position.z, x, y, z)) {
            const blockId = this.dataStore.get(this.position.x, this.position.z, x, y, z);
            this.setBlockId(x, y, z, blockId);
          }
        }
      }
    }
  }

  disposeInstances() {
    this.traverse((obj) => {
      if (obj.dispose) obj.dispose();
    });
    this.clear();
  }
}