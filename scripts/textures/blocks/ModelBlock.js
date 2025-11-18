import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class ModelBlock {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.modelPath = config.modelPath;
    this.spawnable = config.spawnable ?? false;
    this.debug = config.debug ?? false;
    this.isModel = true;
    
    this._geometry = null;
    this._material = null;
    this._loaded = false;
    
    this._loadModel();
  }
  
  _loadModel() {
    const loader = new GLTFLoader();
    
    if (this.debug) {
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
    if (this.debug) {
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
    this._loaded = true;
    
    if (this.debug) {
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
}
