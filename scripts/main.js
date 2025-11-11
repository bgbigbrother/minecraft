// Import core game systems
import { World } from './world/world';
import { Player } from './player/player';
import { Physics } from './physics/physics';
import { setupUI } from './ui';
import { scene } from './core/scene';
import { onResize } from './core/resize';
import { setupLights } from './core/lights';
import { animate } from './core/animation';
import { ModelLoader } from './mobs/model_loader';

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

    // Handle window resize events to maintain proper aspect ratio
    window.addEventListener('resize', onResize.bind(this, player));

    // Initialize UI controls, lighting, and start the render loop
    setupUI(world, player, physics, scene);
    setupLights();
    animate.call(this, player, world);
});