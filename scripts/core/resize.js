import { orbitCamera } from './camera';
import { renderer } from './renderer';

export function onResize (player) {
    // Resize camera aspect ratio and renderer size to the new window size
    orbitCamera.aspect = window.innerWidth / window.innerHeight;
    orbitCamera.updateProjectionMatrix();
    player.camera.aspect = window.innerWidth / window.innerHeight;
    player.camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}