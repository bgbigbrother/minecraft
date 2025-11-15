// Import core game systems
import { World } from './world/world';
import { Player } from './player/player';
import { Physics } from './physics/physics';
import { setupUI } from './ui';
import { scene } from './core/scene';
import { onResize } from './core/resize';
import { setupLights, ambientLight } from './core/lights';
import { animate } from './core/animation';
import { ModelLoader } from './mobs/model_loader';
import { DayNightCycle } from './core/day_night_cycle';
import { sun, sunMesh } from './core/sun';
import { moonMesh } from './core/moon';
import { ToolbarUI } from './inventory/ToolbarUI';
import { GameOverSystem } from './player/gameOver';

/**
 * Main application entry point
 * Initializes all game systems after 3D models are loaded
 */
new ModelLoader((models) => {
    // Create and generate the voxel world
    const world = new World(models);
    world.generate(); // Generate initial chunks around spawn point
    scene.add(world); // Add world to the Three.js scene

    // Initialize player with physics
    const player = new Player(scene, world);
    const physics = new Physics(scene);
    player.addPhysics(physics); // Attach physics system to player

    // Initialize game over system to handle death and respawn
    const gameOverSystem = new GameOverSystem(player, world);

    // Initialize toolbar UI with player's inventory
    const toolbarUI = new ToolbarUI(player.inventory);
    toolbarUI.player = player; // Connect player reference for activeBlockId updates
    toolbarUI.render(); // Initial render to show any persisted inventory

    // Connect inventory system to world for block placement checks
    world.inventoryManager = player.inventory;
    world.toolbarUI = toolbarUI;

    // Handle window resize events to maintain proper aspect ratio
    window.addEventListener('resize', onResize.bind(this, player));

    // Initialize UI controls, lighting, and start the render loop
    setupUI(world, player, physics, scene);
    setupLights();
    
    // Create DayNightCycle instance with all required parameters
    const dayNightCycle = new DayNightCycle(scene, sun, sunMesh, moonMesh, ambientLight, world);
    
    animate.call(this, player, world, dayNightCycle, toolbarUI, gameOverSystem);
});