import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ModelBlock {
  static debug = false; // Global debug flag that can be toggled from UI
  
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.modelPath = config.modelPath;
    this.spawnable = config.spawnable ?? false;
    this.debug = config.debug ?? false;
    this.isModel = true;
    this.animationDuration = config.animationDuration ?? 3000; // Default 3 seconds in milliseconds
    
    this._geometry = null;
    this._material = null;
    this._loaded = false;
    this._animations = [];
    this._mixer = null;
    this._scene = null;
    
    this._loadModel();
  }
  
  _loadModel() {
    const loader = new GLTFLoader();
    
    if (this.debug || ModelBlock.debug) {
      console.log(`[ModelBlock] Loading model: ${this.modelPath}`);
    }
    
    loader.load(
      this.modelPath,
      (gltf) => this._onLoadSuccess(gltf),
      undefined,
      (error) => this._onLoadError(error)
    );
  }
  
  _onLoadSuccess(gltf) {
    if (this.debug || ModelBlock.debug) {
      console.log(`[ModelBlock] Model loaded successfully: ${this.name}`);
      console.log('[ModelBlock] Scene structure:', gltf.scene);
    }
    
    // Find the mesh in the scene (might be nested or a SkinnedMesh)
    let mesh = null;
    gltf.scene.traverse((child) => {
      if ((child.isMesh || child.isSkinnedMesh) && !mesh) {
        mesh = child;
      }
    });
    
    if (!mesh) {
      console.error(`[ModelBlock] No mesh found in model: ${this.name}`);
      return;
    }
    
    // Clone the geometry and scale it to fit 1 block (1x1x1 unit)
    this._geometry = mesh.geometry.clone();
    
    // Calculate bounding box to determine current size
    this._geometry.computeBoundingBox();
    const bbox = this._geometry.boundingBox;
    const size = {
      x: bbox.max.x - bbox.min.x,
      y: bbox.max.y - bbox.min.y,
      z: bbox.max.z - bbox.min.z
    };
    
    // Scale to fit within 1 unit (use the largest dimension)
    const maxDimension = Math.max(size.x, size.y, size.z);
    const scale = 1.0 / maxDimension;
    this._geometry.scale(scale, scale, scale);
    
    // Center the geometry at origin
    this._geometry.computeBoundingBox();
    const center = this._geometry.boundingBox.getCenter(new THREE.Vector3());
    this._geometry.translate(-center.x, -center.y, -center.z);
    
    this._material = mesh.material;
    this._scene = gltf.scene;
    this._loaded = true;
    
    // Extract animations if present
    if (gltf.animations && gltf.animations.length > 0) {
      this._animations = gltf.animations;
      this._mixer = new THREE.AnimationMixer(gltf.scene);
      
      if (this.debug || ModelBlock.debug) {
        console.log(`[ModelBlock] Found ${gltf.animations.length} animations:`, 
          gltf.animations.map(a => a.name));
      }
    }
    
    if (this.debug || ModelBlock.debug) {
      console.log('[ModelBlock] Geometry details:', {
        vertices: this._geometry.attributes.position.count,
        boundingBox: this._geometry.boundingBox,
        scaled: true,
        centered: true
      });
      console.log('[ModelBlock] Material details:', {
        type: this._material.type,
        properties: Object.keys(this._material)
      });
    }
    
    console.log(`${this.name} model loaded successfully`);
  }
  
  _onLoadError(error) {
    console.error(`[ModelBlock] Failed to load model ${this.modelPath}:`, error);
  }
  
  get geometry() {
    return this._geometry;
  }
  
  get material() {
    return this._material;
  }
  
  get loaded() {
    return this._loaded;
  }
  
  get animations() {
    return this._animations;
  }
  
  get mixer() {
    return this._mixer;
  }
  
  get scene() {
    return this._scene;
  }
  
  playAnimation(index = 0) {
    if (!this._mixer || !this._animations[index]) {
      if (this.debug || ModelBlock.debug) {
        console.warn(`[ModelBlock] Cannot play animation ${index} for ${this.name}`);
      }
      return null;
    }
    
    const clip = this._animations[index];
    const action = this._mixer.clipAction(clip);
    action.reset();
    action.play();
    
    if (this.debug || ModelBlock.debug) {
      console.log(`[ModelBlock] Playing animation: ${clip.name}`);
    }
    
    return action;
  }
  
  /**
   * Creates an animated instance of this model for placement in the world
   * This clones the scene with proper skeleton bindings for SkinnedMesh
   * @param {THREE.Vector3} position - World position for the instance
   * @param {number} animationIndex - Which animation to play (default 0)
   * @returns {Object} Object with scene, mixer, and action properties
   */
  createAnimatedInstance(position, animationIndex = 0) {
    if (!this._scene) {
      console.error(`[ModelBlock] Cannot create animated instance: scene not loaded for ${this.name}`);
      return null;
    }
    
    // Import SkeletonUtils dynamically for proper SkinnedMesh cloning
    return import('three/addons/utils/SkeletonUtils.js').then(SkeletonUtils => {
      // Clone the scene with proper skeleton bindings
      const sceneClone = SkeletonUtils.clone(this._scene);
      
      // Configure materials and meshes
      sceneClone.traverse((child) => {
        if (child.isMesh || child.isSkinnedMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          child.visible = true;
          child.frustumCulled = false;
          
          if (child.material) {
            child.material = child.material.clone();
            child.material.side = THREE.DoubleSide;
            child.material.needsUpdate = true;
          }
        }
      });
      
      // Apply scaling to match block size (1 unit)
      // This scale was determined through testing
      const targetScale = 0.005;
      sceneClone.scale.set(targetScale, targetScale, targetScale);
      
      // Set position
      sceneClone.position.copy(position);
      sceneClone.visible = true;
      
      // Create mixer for this instance
      const mixer = new THREE.AnimationMixer(sceneClone);
      
      // Play animation if available
      let action = null;
      if (this._animations && this._animations[animationIndex]) {
        const clip = this._animations[animationIndex];
        action = mixer.clipAction(clip);
        action.reset();
        action.setLoop(THREE.LoopOnce);
        action.clampWhenFinished = true;
        action.play();
        
        if (this.debug || ModelBlock.debug) {
          console.log(`[ModelBlock] Created animated instance with animation: ${clip.name}`);
        }
      }
      
      return {
        scene: sceneClone,
        mixer: mixer,
        action: action
      };
    });
  }
}
