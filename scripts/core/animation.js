import { Vector3, PCFSoftShadowMap } from 'three';
import { sun, sunMesh } from './sun';
import { moonMesh } from './moon';
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
export function animate(player, world, dayNightCycle) {
  // Schedule next frame
  requestAnimationFrame(animate.bind(this, player, world, dayNightCycle));

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

    // Update day/night cycle (time progression, lighting, sky colors, celestial bodies)
    dayNightCycle.update(dt);

    // Adjust celestial body positions relative to player camera (preserve existing offset behavior)
    const offset = new Vector3(-world.chunkSize.height, -world.chunkSize.height, -world.chunkSize.height);
    
    // Position the sun relative to the player to maintain consistent lighting
    sun.position.add(player.camera.position);
    sun.target.position.copy(player.camera.position);
    
    // Update visual sun mesh position relative to player
    sunMesh.position.add(player.camera.position);
    
    // Update visual moon mesh position relative to player
    moonMesh.position.add(player.camera.position);

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