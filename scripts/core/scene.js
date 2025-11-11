import { Scene, Fog } from 'three';

/**
 * Main Three.js scene
 * Contains all 3D objects (world, player, lights, etc.)
 */
export const scene = new Scene();
scene.fog = new Fog(
  0x80a0e0, // Sky blue fog color (matches background)
  50, // Fog starts at 50 units from camera
  75  // Fog fully obscures at 75 units (helps hide chunk loading)
);