import { PerspectiveCamera } from 'three';

/**
 * Orbit camera for debug/third-person view
 * Used when pointer lock is released (F10 debug mode)
 */
export const orbitCamera = new PerspectiveCamera(
  75, // Field of view in degrees
  window.innerWidth / window.innerHeight, // Aspect ratio
  0.1, // Near clipping plane
  1000 // Far clipping plane
);
orbitCamera.position.set(24, 24, 24); // Initial position
orbitCamera.layers.enable(1); // Enable layer 1 for rendering player character