// Mock GLTFLoader for testing
export class GLTFLoader {
  constructor() {}
  
  load(url, onLoad) {
    // Simulate successful load with a mock GLTF structure
    setTimeout(() => {
      if (onLoad) {
        const mockGeometry = {
          type: 'BufferGeometry',
          attributes: {
            position: {
              count: 24,
              array: new Float32Array(72)
            }
          },
          boundingBox: {
            min: { x: -0.5, y: -0.5, z: -0.5 },
            max: { x: 0.5, y: 0.5, z: 0.5 },
            getCenter: function(target) {
              target.x = 0;
              target.y = 0;
              target.z = 0;
              return target;
            }
          },
          clone: function() { 
            return {
              ...this,
              computeBoundingBox: this.computeBoundingBox,
              scale: this.scale,
              translate: this.translate
            };
          },
          computeBoundingBox: function() {
            // Already has boundingBox
          },
          scale: function() {
            // Mock scale operation
          },
          translate: function() {
            // Mock translate operation
          }
        };
        
        const mockMesh = {
          isMesh: true,
          geometry: mockGeometry,
          material: { 
            type: 'MeshStandardMaterial',
            color: 0x8B4513
          }
        };
        
        const mockScene = {
          children: [mockMesh],
          traverse: function(callback) {
            callback(this);
            callback(mockMesh);
          },
          clone: function() {
            return {
              ...this,
              position: { x: 0, y: 0, z: 0, copy: function(v) { this.x = v.x; this.y = v.y; this.z = v.z; } },
              scale: { set: function() {} },
              visible: true,
              traverse: this.traverse
            };
          }
        };
        
        // Add animations for animated models
        const animations = [];
        
        onLoad({
          scene: mockScene,
          animations: animations
        });
      }
    }, 0);
  }
}
