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
  multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }
  normalize() {
    const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    if (length > 0) {
      this.x /= length;
      this.y /= length;
      this.z /= length;
    }
    return this;
  }
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }
  negate() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    return this;
  }
  equals(v) {
    return this.x === v.x && this.y === v.y && this.z === v.z;
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
    this.rotation = { x: 0, y: 0, z: 0 };
    this.receiveShadow = false;
    this.castShadow = false;
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
}

export class Mesh {
  constructor(geometry, material) {
    this.geometry = geometry;
    this.material = material;
    this.position = new Vector3();
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = new Vector3(1, 1, 1);
    this.visible = true;
    this.layers = { set: () => {} };
  }
  rotateX(angle) {
    this.rotation.x += angle;
  }
  rotateY(angle) {
    this.rotation.y += angle;
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

export class DirectionalLight {
  constructor() {
    this.intensity = 1;
    this.position = new Vector3();
    this.castShadow = false;
    this.shadow = {
      camera: { left: 0, right: 0, top: 0, bottom: 0, near: 0, far: 0 },
      bias: 0,
      mapSize: new Vector2()
    };
    this.target = { position: new Vector3() };
  }
}

export class AmbientLight {
  constructor() {
    this.intensity = 1;
  }
}

export class PlaneGeometry {
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
}

export class InstancedMesh extends Mesh {
  constructor(geometry, material, count) {
    super(geometry, material);
    this.count = 0;
    this.castShadow = false;
    this.receiveShadow = false;
    this.name = '';
  }
  setMatrixAt() {}
}

export class AnimationMixer {
  constructor(model) {
    this.model = model;
  }
  update() {}
  clipAction() {
    return {
      play: () => {},
      stop: () => {}
    };
  }
}

export class AnimationClip {
  static findByName(animations, name) {
    return animations.find(anim => anim.name === name);
  }
}

export const DoubleSide = 2;
