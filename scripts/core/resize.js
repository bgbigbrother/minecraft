import { orbitCamera } from './camera';
import { renderer } from './renderer';

/**
 * Handles window resize events
 * Updates camera aspect ratios and renderer size to match new window dimensions
 * @param {Player} player - The player object containing the first-person camera
 */
export function onResize (player) {
    // Update orbit camera (debug camera) aspect ratio
    orbitCamera.aspect = window.innerWidth / window.innerHeight;
    orbitCamera.updateProjectionMatrix(); // Recalculate projection matrix
    
    // Update player camera (first-person camera) aspect ratio
    player.camera.aspect = window.innerWidth / window.innerHeight;
    player.camera.updateProjectionMatrix(); // Recalculate projection matrix

    // Resize renderer canvas to match new window size
    renderer.setSize(window.innerWidth, window.innerHeight);
}