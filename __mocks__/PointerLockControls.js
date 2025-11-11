export class PointerLockControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.isLocked = false;
    this.listeners = {};
  }
  
  addEventListener(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }
  
  removeEventListener(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  }
  
  moveRight() {}
  moveForward() {}
  lock() { this.isLocked = true; }
  unlock() { this.isLocked = false; }
}
