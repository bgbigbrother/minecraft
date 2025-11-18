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
    
    // Add chest block to starting inventory for new games
    // Only add if inventory is empty (new game)
    if (this.inventory.items.size === 0) {
      this.inventory.addItem(16, 1); // Add one chest block (ID 16)
      this.inventory.save(); // Persist the initial inventory
    }
    
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