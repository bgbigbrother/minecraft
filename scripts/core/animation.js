import { Vector3, PCFSoftShadowMap } from 'three';
import { sun, sunMesh } from './sun';
import { moonMesh } from './moon';
import { orbitCamera } from './camera';
import { controls } from './controls';
import { renderer } from './renderer';
import { stats, isStatsEnabled } from './stats';
import { scene } from './scene';
import { ItemCollector } from '../inventory/ItemCollector.js';

/**
 * Main animation/render loop
 * Called every frame to update game state and render the scene
 */
let previousTime = performance.now();
export function animate(player, world, dayNightCycle, toolbarUI, gameOverSystem) {
  // Schedule next frame
  requestAnimationFrame(animate.bind(this, player, world, dayNightCycle, toolbarUI, gameOverSystem));

  // Calculate delta time (time since last frame) in seconds
  const currentTime = performance.now();
  const dt = (currentTime - previousTime) / 1000;

  // Only update physics and game logic when player controls are locked (in first-person mode)
  if (player.controls.isLocked) {
    // Start background music
    document.getElementById("theme-music").play();
    
    // Update player physics and world chunks
    player.update(dt, world);
    world.update(dt, player);

    // Update game over system to check for death condition
    if (gameOverSystem) {
      gameOverSystem.update(dt);
    }

    // Update all dropped items (physics and rotation)
    if (world.droppedItems && world.droppedItems.length > 0) {
      for (let i = 0; i < world.droppedItems.length; i++) {
        const item = world.droppedItems[i];
        if (item && item.update) {
          item.update(dt);
        }
      }
    }

    // Check for and remove expired dropped items (despawn after 10 minutes)
    ItemCollector.checkDespawns(world.droppedItems, world);

    // Check for and collect nearby dropped items
    ItemCollector.checkCollections(player, world.droppedItems, world);
    
    // Update toolbar display after collection check
    if (toolbarUI) {
      toolbarUI.render();
    }

    // Update block interaction animations (chest animations, etc.)
    if (player.interactionHandler) {
      player.interactionHandler.update(dt);
    }
    
    // Update animation mixers for animated blocks (like chests)
    if (world.activeAnimationMixers && world.activeAnimationMixers.size > 0) {
      for (const [key, mixer] of world.activeAnimationMixers) {
        mixer.update(dt);
      }
    }

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
    document.getElementById("theme-music").pause();
    player.character.visible = true; // Show player model in third-person view
    player.tool.container.visible = false; // Hide first-person tool
  }

  // Render the scene using either first-person or orbit camera
  renderer.render(scene, player.controls.isLocked ? player.camera : orbitCamera);
  
  // Update performance stats display (only if enabled)
  if (isStatsEnabled()) {
    stats.update();
  }

  // Store current time for next frame's delta calculation
  previousTime = currentTime;
}