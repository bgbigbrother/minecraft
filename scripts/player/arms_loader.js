import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Loads the first-person arms 3D model from GLB file
 * Uses Three.js GLTFLoader for loading the animated arms model
 */
export class ArmsLoader {
  /**
   * GLTF loader instance for loading .glb model files
   */
  loader = new GLTFLoader();

  /**
   * The loaded arms model (Three.js Group)
   */
  model = undefined;

  /**
   * Array of animation clips extracted from the GLB file
   */
  animations = [];

  /**
   * Loads the first-person arms model and calls callback when complete
   * @param {Function} onLoad - Callback function called with (model, animations)
   */
  constructor(onLoad) {
    // Load first-person arms model from public/models directory
    this.loader.load(
      './models/first_person_arms.glb',
      (gltf) => {
        // Extract the scene (3D model) from GLTF
        this.model = gltf.scene;
        
        // Extract all animation clips from GLTF
        this.animations = gltf.animations;
        
        // Call callback with loaded model and animations
        onLoad(this.model, this.animations);
      },
      undefined, // Progress callback (optional)
      (error) => {
        // Error callback
        console.error('Failed to load first-person arms model:', error);
      }
    );
  }
}
