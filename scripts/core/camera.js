import { PerspectiveCamera } from 'three';

// Camera setup
export const orbitCamera = new PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
orbitCamera.position.set(24, 24, 24);
orbitCamera.layers.enable(1);