import { Vector3, PCFSoftShadowMap } from 'three';
import { sun, sunMesh } from './sun';
import { orbitCamera } from './camera';
import { controls } from './controls';
import { renderer } from './renderer';
import { stats } from './stats';
import { scene } from './scene';

/**
 * Main animation/render loop
 * Called every frame to update game state and render the scene
 */
let previousTime = performance.now();
export function animate(player, world) {
  // Schedule next frame
  requestAnimationFrame(animate.bind(this, player, world));

  // Calculate delta time (time since last frame) in seconds
  const currentTime = performance.now();
  const dt = (currentTime - previousTime) / 1000;

  // Only update physics and game logic when player controls are locked (in first-person mode)
  if (player.controls.isLocked) {
    // Start background music
    document.querySelector("audio").play();
    
    // Update player physics and world chunks
    player.update(dt, world);
    world.update(dt, player);

    // Position the sun relative to the player to maintain consistent lighting
    // Need to adjust both the position and target of the sun to keep the same sun angle
    sun.position.copy(player.camera.position);
    sun.position.sub(new Vector3(-world.chunkSize.height, -world.chunkSize.height, -world.chunkSize.height));
    sun.target.position.copy(player.camera.position);
    
    // Update visual sun mesh position
    sunMesh.position.copy(player.camera.position);
    sunMesh.position.sub(new Vector3(-world.chunkSize.height, -world.chunkSize.height, -world.chunkSize.height));

    // Update orbit camera position to track player (for debug camera mode)
    orbitCamera.position.copy(player.position).add(new Vector3(16, 16, 16));
    controls.target.copy(player.position);
  } else {
    // When controls are unlocked (menu/pause), pause music and show player character
    document.querySelector("audio").pause();
    player.character.visible = true; // Show player model in third-person view
    player.tool.container.visible = false; // Hide first-person tool
  }

  // Render the scene using either first-person or orbit camera
  renderer.render(scene, player.controls.isLocked ? player.camera : orbitCamera);
  
  // Update performance stats display
  stats.update();

  // Store current time for next frame's delta calculation
  previousTime = currentTime;
}