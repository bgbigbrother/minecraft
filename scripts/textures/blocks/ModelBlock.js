import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as BufferGeometryUtils from 'three/examples/jsm/utils/BufferGeometryUtils.js';

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
    
    // Find ALL meshes in the scene and merge them
    const meshes = [];
    gltf.scene.traverse((child) => {
      if (child.isMesh || child.isSkinnedMesh) {
        meshes.push(child);
      }
    });
    
    if (meshes.length === 0) {
      console.error(`[ModelBlock] No mesh found in model: ${this.name}`);
      return;
    }
    
    if (this.debug || ModelBlock.debug) {
      console.log(`[ModelBlock] Found ${meshes.length} meshes in model`);
    }
    
    // Merge all geometries into one
    const geometries = [];
    const materials = [];
    
    for (const mesh of meshes) {
      let geometryToUse = mesh.geometry.clone();
      
      // For SkinnedMesh, bake the geometry in its bind pose
      if (mesh.isSkinnedMesh) {
        // Apply the bind matrix to get vertices in their rest position
        if (mesh.bindMatrix) {
          geometryToUse.applyMatrix4(mesh.bindMatrix);
        }
        
        // Also apply the mesh's local transform
        if (mesh.matrix) {
          geometryToUse.applyMatrix4(mesh.matrix);
        }
        
        if (this.debug || ModelBlock.debug) {
          console.log('[ModelBlock] Baked SkinnedMesh geometry to static geometry for instancing');
        }
      }
      
      // Apply the mesh's world transform to position it correctly
      mesh.updateWorldMatrix(true, false);
      geometryToUse.applyMatrix4(mesh.matrixWorld);
      
      geometries.push(geometryToUse);
      
      // Clone and configure the material for better visibility
      const material = mesh.material.clone ? mesh.material.clone() : mesh.material;
      
      // Ensure the material receives lighting properly
      if (material.isMeshStandardMaterial || material.isMeshPhongMaterial) {
        // Increase emissive to make it brighter in dark areas
        if (!material.emissive) {
          material.emissive = new THREE.Color(0x222222);
        }
        material.emissiveIntensity = 0.2;
      }
      
      // Ensure double-sided rendering
      material.side = THREE.DoubleSide;
      material.needsUpdate = true;
      
      materials.push(material);
    }
    
    // Merge all geometries into one
    if (geometries.length === 1) {
      this._geometry = geometries[0];
      this._material = materials[0];
    } else {
      // Merge geometries with material groups to preserve different materials
      const mergedGeometry = BufferGeometryUtils.mergeGeometries(geometries, true);
      this._geometry = mergedGeometry;
      
      // InstancedMesh requires a single material, so we use the first material
      // The geometry groups will handle different material indices
      // Clone the first material and ensure it's properly configured
      this._material = materials[0].clone ? materials[0].clone() : materials[0];
      this._material.side = THREE.DoubleSide;
      this._material.needsUpdate = true;
      
      if (this.debug || ModelBlock.debug) {
        console.log(`[ModelBlock] Merged ${geometries.length} geometries with ${materials.length} materials (using first material for InstancedMesh)`);
      }
    }
    
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
    
    // Center the geometry at origin (X and Z only, keep Y at bottom)
    this._geometry.computeBoundingBox();
    const center = this._geometry.boundingBox.getCenter(new THREE.Vector3());
    this._geometry.translate(-center.x, 0, -center.z);
    
    // Move geometry so bottom is at y=0 (sits on top of block)
    const minY = this._geometry.boundingBox.min.y;
    this._geometry.translate(0, -minY, 0);
    
    // Rotate 90 degrees on Y axis (Math.PI / 2 radians)
    this._geometry.rotateY(Math.PI / 2);
    
    // Recenter X and Z after rotation, keep Y at bottom
    this._geometry.computeBoundingBox();
    const centerAfterRotation = this._geometry.boundingBox.getCenter(new THREE.Vector3());
    this._geometry.translate(-centerAfterRotation.x, 0, -centerAfterRotation.z);
    
    // Ensure bottom is still at y=0 after rotation
    const minYAfterRotation = this._geometry.boundingBox.min.y;
    this._geometry.translate(0, -minYAfterRotation, 0);
    
    // Material is already set above during merge, don't overwrite it
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
      const finalBBox = this._geometry.boundingBox;
      const finalSize = {
        x: finalBBox.max.x - finalBBox.min.x,
        y: finalBBox.max.y - finalBBox.min.y,
        z: finalBBox.max.z - finalBBox.min.z
      };
      
      console.log('[ModelBlock] Geometry details:', {
        vertices: this._geometry.attributes.position.count,
        boundingBox: this._geometry.boundingBox,
        finalSize: finalSize,
        scaled: true,
        centered: true,
        rotated: true,
        hasNormals: !!this._geometry.attributes.normal,
        hasUVs: !!this._geometry.attributes.uv
      });
      
      const materialInfo = Array.isArray(this._material) 
        ? `Array of ${this._material.length} materials`
        : this._material.type;
      
      console.log('[ModelBlock] Material details:', {
        type: materialInfo,
        isArray: Array.isArray(this._material)
      });
    }
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
