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
  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }
  clone() {
    return new Vector2(this.x, this.y);
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
    this.children = [];
  }
  add(obj) {
    this.children.push(obj);
  }
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
    this.rotation = {
      x: 0,
      y: 0,
      z: 0,
      set: function(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
      }
    };
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
export class MeshBasicMaterial {
  constructor(params = {}) {
    this.color = params.color || 0xffffff;
    this.map = params.map || null;
  }
}
export class MeshStandardMaterial {
  constructor(params = {}) {
    this.color = params.color || 0xffffff;
    this.map = params.map || null;
  }
}
export class MeshLambertMaterial {
  constructor(params = {}) {
    this.color = params.color || 0xffffff;
    this.map = params.map || null;
  }
}
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

export class Texture {
  constructor() {
    this.colorSpace = null;
    this.magFilter = null;
    this.minFilter = null;
    this.repeat = new Vector2(1, 1);
    this.offset = new Vector2(0, 0);
    this.needsUpdate = false;
  }
  clone() {
    const cloned = new Texture();
    cloned.colorSpace = this.colorSpace;
    cloned.magFilter = this.magFilter;
    cloned.minFilter = this.minFilter;
    cloned.repeat = new Vector2(this.repeat.x, this.repeat.y);
    cloned.offset = new Vector2(this.offset.x, this.offset.y);
    cloned.needsUpdate = this.needsUpdate;
    return cloned;
  }
}

export class TextureLoader {
  load() {
    return new Texture();
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
    this._listeners = {};
  }
  update() {}
  clipAction(clip) {
    return {
      reset: () => {},
      play: () => {},
      stop: () => {},
      setLoop: () => {},
      crossFadeTo: () => {},
      loop: 2201,
      clampWhenFinished: false
    };
  }
  addEventListener(type, listener) {
    if (!this._listeners[type]) {
      this._listeners[type] = [];
    }
    this._listeners[type].push(listener);
  }
  removeEventListener(type, listener) {
    if (!this._listeners[type]) return;
    const index = this._listeners[type].indexOf(listener);
    if (index > -1) {
      this._listeners[type].splice(index, 1);
    }
  }
  dispatchEvent(event) {
    if (!this._listeners[event.type]) return;
    this._listeners[event.type].forEach(listener => listener(event));
  }
}

export const LoopOnce = 2200;

export class AnimationClip {
  constructor(name, duration, tracks) {
    this.name = name;
    this.duration = duration;
    this.tracks = tracks || [];
  }
  static findByName(animations, name) {
    return animations.find(anim => anim.name === name);
  }
}

export class EdgesGeometry {
  constructor(geometry) {
    this.geometry = geometry;
  }
}

export class LineBasicMaterial {
  constructor(params = {}) {
    this.color = params.color || 0xffffff;
    this.linewidth = params.linewidth || 1;
  }
}

export class LineSegments extends Mesh {
  constructor(geometry, material) {
    super(geometry, material);
  }
}

export const DoubleSide = 2;
