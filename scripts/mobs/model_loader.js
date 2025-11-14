import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createSimpleTestModel } from './test_model.js';

export class ModelLoader {
  loader = new GLTFLoader();

  models = {
    cow: {
      file: './models/cow.glb'
    },
    testMob: {
      tall: 2,
      wide: 1,
      deep: 1,
      procedural: true // Flag to indicate this is a procedural model
    }
  };

  constructor(onLoad) {
    const modelKeys = Object.keys(this.models);
    let loadedCount = 0;

    modelKeys.forEach((key) => {
      const mob = this.models[key];
      // Handle procedural models
      if (mob.procedural) {
        mob.model = createSimpleTestModel(mob.wide, mob.tall, mob.deep);
        mob.animations = []; // No animations for simple model
      } else {
        // Handle GLTF models
        this.loader.load(mob.file, (model) => {
          mob.model = model.scene;
          mob.animations = model.animations;
        });
      }
      loadedCount++;
      // Invoke callback only when all models are loaded
        if (loadedCount === modelKeys.length) {
          onLoad(this.models);
        }
    });
  }
}