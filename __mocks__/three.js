// Mock Three.js exports
export class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }
  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }
  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }
  applyEuler() { return this; }
  applyMatrix4() { return this; }
  clone() { return new Vector3(this.x, this.y, this.z); }
}

export class Vector2 {
  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }
}

export class PerspectiveCamera {
  constructor(fov, aspect, near, far) {
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
    this.position = new Vector3();
    this.rotation = { x: 0, y: 0, z: 0 };
    this.layers = { enable: () => {}, set: () => {} };
  }
  add() {}
  lookAt() {}
}

export class CameraHelper {
  constructor() {
    this.visible = false;
  }
}

export class Raycaster {
  constructor() {
    this.layers = { set: () => {} };
  }
  setFromCamera() {}
  intersectObject() { return []; }
}

export class Group {
  constructor() {
    this.children = [];
    this.position = new Vector3();
    this.userData = {};
    this.scale = new Vector3(1, 1, 1);
  }
  add(obj) {
    this.children.push(obj);
  }
  remove(obj) {
    const index = this.children.indexOf(obj);
    if (index > -1) this.children.splice(index, 1);
  }
}

export class Mesh {
  constructor(geometry, material) {
    this.geometry = geometry;
    this.material = material;
    this.position = new Vector3();
    this.visible = true;
  }
}

export class CylinderGeometry {}
export class BoxGeometry {}
export class SphereGeometry {}
export class MeshBasicMaterial {}
export class MeshStandardMaterial {}
export class MeshLambertMaterial {}
export class Euler {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
}

export class Matrix4 {
  setPosition() { return this; }
}

export class Scene extends Group {
  constructor() {
    super();
    this.fog = null;
  }
}

export class Fog {
  constructor(color, near, far) {
    this.color = color;
    this.near = near;
    this.far = far;
  }
}

export class WebGLRenderer {
  constructor(options = {}) {
    this.domElement = document.createElement('canvas');
    this.shadowMap = { enabled: false, type: null };
  }
  setSize() {}
  setPixelRatio() {}
  setClearColor() {}
  render() {}
}

export const PCFSoftShadowMap = 'PCFSoftShadowMap';
export const SRGBColorSpace = 'srgb';
export const NearestFilter = 'nearest';

export class TextureLoader {
  load() {
    return {
      colorSpace: null,
      magFilter: null,
      minFilter: null
    };
  }
}
