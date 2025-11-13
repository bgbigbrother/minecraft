import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ModelLoader {
  loader = new GLTFLoader();

  models = {
    cow: {
      file: './models/cow.glb'
    }
  };

  constructor(onLoad) {
    const modelKeys = Object.keys(this.models);
    let loadedCount = 0;

    modelKeys.forEach((key) => {
      this.loader.load(this.models[key].file, (model) => {
        this.models[key].model = model.scene;
        this.models[key].animations = model.animations;
        loadedCount++;

        // Invoke callback only when all models are loaded
        if (loadedCount === modelKeys.length) {
          onLoad(this.models);
        }
      });
    });
  }
}