export class PointerLockControls {
  constructor(camera, domElement) {
    this.camera = camera;
    this.domElement = domElement;
    this.isLocked = false;
  }
  
  moveRight() {}
  moveForward() {}
  lock() { this.isLocked = true; }
  unlock() { this.isLocked = false; }
}
