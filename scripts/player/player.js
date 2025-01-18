import * as THREE from 'three';
import { World } from '../world/world';
import { blocks } from '../textures/blocks';
import { ToolControllsPlayerBase } from './tool';

export class Player extends  ToolControllsPlayerBase {
  constructor(scene, world) {
    super();
    this.world = world;
    this.scene = scene;
    this.position.set(32, 32, 32);
    scene.add(this.camera);
    scene.add(this.cameraHelper);
    scene.add(this.boundsHelper);
    scene.add(this.selectionHelper);
  }

  /**
   * Updates the state of the player
   * @param {World} world 
   */
  update(world) {
    this.updateSceneFog();
    this.updateBoundsHelper();
    this.updateRaycaster(world);

    if (this.tool.animate) {
      this.updateToolAnimation();
    }
  }
}