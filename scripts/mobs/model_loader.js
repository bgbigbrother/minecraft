import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ModelLoader {
  loader = new GLTFLoader();

  models = {
    cow: {
      file: './models/cow.glb'
    }
  };

  constructor(onLoad) {
    for(let i in this.models) {
      this.loader.load(this.models[i].file, (model) => {
        this.models[i].model = model.scene;
        this.models[i].animations = model.animations;
        onLoad(this.models);
      });
    }
  }
}