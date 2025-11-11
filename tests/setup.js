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
    constructor(options) {
      this.domElement = document.createElement('canvas');
    }
    setSize() {}
    setPixelRatio() {}
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
  },
};

// Mock requestIdleCallback
global.requestIdleCallback = (callback) => setTimeout(callback, 0);
