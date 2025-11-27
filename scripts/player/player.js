import { World } from '../world/world';
import { ToolControllsPlayerBase } from './tool';
import { InventoryManager } from '../inventory/InventoryManager';

export class Player extends  ToolControllsPlayerBase {
  #physics = null;
  constructor(scene, world) {
    super();
    this.world = world;
    this.scene = scene;
    this.position.set(32, 32, 32);
    
    // Initialize inventory and load saved data
    this.inventory = new InventoryManager();
    this.inventory.load();
    
    scene.add(this.camera);
    scene.add(this.cameraHelper);
    scene.add(this.character);
    scene.add(this.boundsHelper);
    scene.add(this.selectionHelper);
  }

  /**
   * Updates the state of the player
   * @param {World} world 
   */
  update(dt, world) {
    this.updateBoundsHelper();
    this.updateRaycaster(world);

    if(this.#physics) {
      // Check water status before physics update
      this.inWater = this.#physics.isPlayerInWater(this, world);
      
      this.#physics.update(dt, this, world);
    }

    if (this.tool.animate) {
      this.updateToolAnimation();
    }
    
    // Update fall damage tracking after physics update
    this.updateFallDamage(dt);
    
    // Update fog based on water immersion
    this.updateSceneFog();
  }

  addPhysics(physics) {
    this.#physics = physics;
  }
}