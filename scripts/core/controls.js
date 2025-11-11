import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { renderer } from './renderer';
import { orbitCamera } from './camera';

/**
 * Orbit controls for debug camera
 * Allows mouse-based camera rotation and zoom when in third-person view
 */
export const controls = new OrbitControls(orbitCamera, renderer.domElement);
controls.update(); // Initialize controls