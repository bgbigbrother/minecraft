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
      // Store previous water state to detect transitions
      const wasInWater = this.inWater;
      
      // Check water status before physics update
      this.inWater = this.#physics.isPlayerInWater(this, world);
      
      // Handle swimming animation transitions
      if (this.inWater && !wasInWater) {
        // Just entered water - play swimming animation
        this.playArmsAnimation('HANDS_BELOW', true);
      } else if (!this.inWater && wasInWater) {
        // Just exited water - return to idle animation
        this.playArmsAnimation('IDLE', true);
      }
      
      this.#physics.update(dt, this, world);
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