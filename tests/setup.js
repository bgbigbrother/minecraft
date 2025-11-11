// Mock Three.js objects
global.THREE = {
  Scene: class Scene {
    constructor() {
      this.children = [];
      this.fog = null;
    }
    add(obj) {
      this.children.push(obj);
    }
    remove(obj) {
      const index = this.children.indexOf(obj);
      if (index > -1) this.children.splice(index, 1);
    }
  },
  Fog: class Fog {
    constructor(color, near, far) {
      this.color = color;
      this.near = near;
      this.far = far;
    }
  },
  WebGLRenderer: class WebGLRenderer {
    constructor() {
      this.domElement = document.createElement('canvas');
      this.shadowMap = { enabled: false, type: null };
    }
    setSize() {}
    setPixelRatio() {}
    setClearColor() {}
    render() {}
  },
  PerspectiveCamera: class PerspectiveCamera {
    constructor(fov, aspect, near, far) {
      this.fov = fov;
      this.aspect = aspect;
      this.near = near;
      this.far = far;
      this.position = { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
    }
    lookAt() {}
    updateProjectionMatrix() {}
  },
  Group: class Group {
    constructor() {
      this.children = [];
      this.position = { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.userData = {};
    }
    add(obj) {
      this.children.push(obj);
    }
    remove(obj) {
      const index = this.children.indexOf(obj);
      if (index > -1) this.children.splice(index, 1);
    }
    clear() {
      this.children = [];
    }
    traverse(callback) {
      callback(this);
      this.children.forEach(child => {
        if (child.traverse) {
          child.traverse(callback);
        } else {
          callback(child);
        }
      });
    }
  },
  DirectionalLight: class DirectionalLight {
    constructor() {
      this.intensity = 1;
      this.position = { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; }, copy: function() {}, sub: function() {} };
      this.castShadow = false;
      this.shadow = {
        camera: { left: 0, right: 0, top: 0, bottom: 0, near: 0, far: 0 },
        bias: 0,
        mapSize: { x: 0, y: 0 }
      };
      this.target = { position: { copy: function() {} } };
    }
  },
  AmbientLight: class AmbientLight {
    constructor() {
      this.intensity = 1;
    }
  },
  Vector2: class Vector2 {
    constructor(x, y) {
      this.x = x || 0;
      this.y = y || 0;
    }
  },
  Vector3: class Vector3 {
    constructor(x, y, z) {
      this.x = x || 0;
      this.y = y || 0;
      this.z = z || 0;
    }
  },
  SphereGeometry: class SphereGeometry {
    constructor(radius, widthSegments, heightSegments) {
      this.radius = radius;
      this.widthSegments = widthSegments;
      this.heightSegments = heightSegments;
    }
  },
  PlaneGeometry: class PlaneGeometry {
    constructor(width, height, widthSegments, heightSegments) {
      this.width = width;
      this.height = height;
      this.attributes = {
        position: {
          array: new Float32Array(100),
          needsUpdate: false
        }
      };
    }
    computeVertexNormals() {}
  },
  MeshBasicMaterial: class MeshBasicMaterial {
    constructor(params) {
      this.color = params?.color || 0xffffff;
    }
  },
  MeshStandardMaterial: class MeshStandardMaterial {
    constructor(params) {
      this.color = params?.color || 0xffffff;
      this.transparent = params?.transparent || false;
      this.opacity = params?.opacity || 1;
    }
  },
  Mesh: class Mesh {
    constructor(geometry, material) {
      this.geometry = geometry;
      this.material = material;
      this.position = { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; }, copy: function() {} };
      this.rotation = { x: 0, y: 0, z: 0 };
      this.scale = { x: 1, y: 1, z: 1, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
      this.layers = { set: function() {} };
    }
    rotateX(angle) {
      this.rotation.x += angle;
    }
  },
  DoubleSide: 2,
  PCFSoftShadowMap: 2
};

// Mock requestIdleCallback
global.requestIdleCallback = (callback) => setTimeout(callback, 0);
