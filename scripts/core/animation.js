import { Vector3, PCFSoftShadowMap } from 'three';
import { sun, sunMesh } from './sun';
import { orbitCamera } from './camera';
import { controls } from './controls';
import { renderer } from './renderer';
import { stats } from './stats';
import { scene } from './scene';

// Render loop
let previousTime = performance.now();
export function animate(player, world) {
  requestAnimationFrame(animate.bind(this, player, world));

  const currentTime = performance.now();
  const dt = (currentTime - previousTime) / 1000;

  // Only update physics when player controls are locked
  if (player.controls.isLocked) {
    document.querySelector("audio").play();
    player.update(dt, world);
    world.update(player);

    // Position the sun relative to the player. Need to adjust both the
    // position and target of the sun to keep the same sun angle
    sun.position.copy(player.camera.position);
    sun.position.sub(new Vector3(-world.chunkSize.height, -world.chunkSize.height, -world.chunkSize.height));
    sun.target.position.copy(player.camera.position);
    sunMesh.position.copy(player.camera.position);
    sunMesh.position.sub(new Vector3(-world.chunkSize.height, -world.chunkSize.height, -world.chunkSize.height));

    // Update positon of the orbit camera to track player 
    orbitCamera.position.copy(player.position).add(new Vector3(16, 16, 16));
    controls.target.copy(player.position);
  } else {
    document.querySelector("audio").pause();
    player.character.visible = true;
    player.tool.container.visible = false;
  }

  renderer.render(scene, player.controls.isLocked ? player.camera : orbitCamera);
  stats.update();

  previousTime = currentTime;
}