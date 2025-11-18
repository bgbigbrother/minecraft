// Mock GLTFLoader for testing
export class GLTFLoader {
  constructor() {}
  
  load(url, onLoad, onProgress, onError) {
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
          scale: function(x, y, z) {
            // Mock scale operation
          },
          translate: function(x, y, z) {
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
        
        onLoad({
          scene: {
            children: [mockMesh],
            traverse: function(callback) {
              callback(this);
              callback(mockMesh);
            }
          }
        });
      }
    }, 0);
  }
}
