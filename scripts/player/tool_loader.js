import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Loads 3D tool models (pickaxe, etc.) from GLB files
 * Uses Three.js GLTFLoader for loading 3D models
 */
export class ToolLoader {
  /**
   * GLTF loader instance for loading .glb model files
   */
  loader = new GLTFLoader();

  /**
   * Storage for loaded tool models
   */
  models = {
    pickaxe: undefined
  };

  /**
   * Loads tool models and calls callback when complete
   * @param {Function} onLoad - Callback function called with loaded models
   */
  constructor(onLoad) {
    // Load pickaxe model from public/models directory
    this.loader.load('./models/pickaxe.glb', (model) => {
      const mesh = model.scene; // Extract the scene from GLTF model
      this.models.pickaxe = mesh;
      onLoad(this.models); // Call callback with loaded models
    });
  }
}