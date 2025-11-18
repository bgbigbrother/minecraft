import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { resources } from './textures/resources';
import { setStatsEnabled } from './core/stats';
import { ModelBlock } from './textures/blocks/ModelBlock';

/**
 * Sets up the UI controls
 * @param {World} world 
 * @param {Player} player
 * @param {Physics} physics
 */
export function setupUI(world, player, physics, scene) {
  // Create the debug GUI panel
  const gui = new GUI();

  // Performance stats toggle
  const statsConfig = { showStats: false };
  gui.add(statsConfig, 'showStats').name('Show FPS Stats').onChange((value) => {
    setStatsEnabled(value);
  });

  // Debug menu folder
  const debugFolder = gui.addFolder('Debug').close();
  const debugConfig = {
    modelBlockDebug: false,
    playerControlsDebug: player.debugControls || false
  };
  debugFolder.add(debugConfig, 'modelBlockDebug').name('Model Block').onChange((value) => {
    ModelBlock.debug = value;
  });
  debugFolder.add(debugConfig, 'playerControlsDebug').name('Player Controls').onChange((value) => {
    player.setDebugMode(value);
  });

  // Player controls folder - adjust movement and debug visualization
  const playerFolder = gui.addFolder('Player').close();
  playerFolder.add(player, 'maxSpeed', 1, 500, 0.1).name('Max Speed'); // Walking/sprinting speed
  playerFolder.add(player, 'jumpSpeed', 1, 250, 0.1).name('Jump Speed'); // Jump velocity
  playerFolder.add(player.boundsHelper, 'visible').name('Show Player Bounds'); // Show collision box
  playerFolder.add(player.cameraHelper, 'visible').name('Show Camera Helper'); // Show camera frustum
  
  // Health system controls
  const healthFolder = playerFolder.addFolder('Health').close();
  healthFolder.add(player, 'maxHealth', 1, 1000, 1).name('Max Health').onChange(() => {
    player.health = Math.min(player.health, player.maxHealth);
    player.updateHealthBar();
  });
  healthFolder.add(player, 'health', 0, player.maxHealth, 1).name('Current Health').listen().onChange(() => {
    player.updateHealthBar();
  });
  
  // Fall damage control - convert to percentage for display (0-100%)
  const fallDamageConfig = {
    damagePercent: player.damagePerBlock * 100
  };
  healthFolder.add(fallDamageConfig, 'damagePercent', 0, 100, 0.1).name('Fall Damage %').onChange((value) => {
    player.damagePerBlock = value / 100;
  });
  
  healthFolder.add({ damage: () => player.takeDamage(10) }, 'damage').name('Take 10 Damage');
  healthFolder.add({ heal: () => player.heal(10) }, 'heal').name('Heal 10 HP');
  healthFolder.add({ fullHeal: () => player.setHealth(player.maxHealth) }, 'fullHeal').name('Full Heal');

  // Physics controls folder - adjust simulation parameters
  const physicsFolder = gui.addFolder('Physics').close();
  physicsFolder.add(physics.helpers, 'visible').name('Visualize Collisions'); // Show collision helpers
  physicsFolder.add(physics, 'simulationRate', 10, 1000).name('Sim Rate'); // Physics updates per second

  // World controls folder - adjust rendering and generation parameters
  const worldFolder = gui.addFolder('World').close();
  worldFolder.add(world, 'drawDistance', 0, 5, 1).name('Draw Distance'); // Chunks to render around player
  worldFolder.add(world, 'asyncLoading').name('Async Loading'); // Load chunks asynchronously
  worldFolder.add(scene.fog, 'near', 1, 200, 1).name('Fog Near'); // Fog start distance
  worldFolder.add(scene.fog, 'far', 1, 200, 1).name('Fog Far'); // Fog end distance

  // Terrain generation parameters
  const terrainFolder = worldFolder.addFolder('Terrain').close();
  terrainFolder.add(world.params, 'seed', 0, 10000, 1).name('Seed'); // Random seed for generation
  terrainFolder.add(world.params.terrain, 'scale', 10, 100).name('Scale'); // Noise scale (larger = smoother)
  terrainFolder.add(world.params.terrain, 'magnitude', 0, 1).name('Magnitude'); // Height variation intensity
  terrainFolder.add(world.params.terrain, 'offset', 0, 32, 1).name('Offset'); // Base terrain height
  terrainFolder.add(world.params.terrain, 'waterOffset', 0, 32, 1).name('Water Offset'); // Water level height

  // Biome distribution parameters
  const biomesFolder = gui.addFolder('Biomes').close();
  biomesFolder.add(world.params.biomes, 'scale', 100, 10000).name('Biome Scale'); // Size of biome regions
  biomesFolder.add(world.params.biomes.variation, 'amplitude', 0, 1).name('Variation Amplitude'); // Biome blend intensity
  biomesFolder.add(world.params.biomes.variation, 'scale', 10, 500).name('Variation Scale'); // Biome transition smoothness
  biomesFolder.add(world.params.biomes, 'tundraToTemperate', 0, 1).name('Tundra -> Temperate'); // Threshold for tundra biome
  biomesFolder.add(world.params.biomes, 'temperateToJungle', 0, 1).name('Temperate -> Jungle'); // Threshold for temperate biome
  biomesFolder.add(world.params.biomes, 'jungleToDesert', 0, 1).name('Jungle -> Desert'); // Threshold for jungle biome

  // Resource generation parameters (coal, iron, etc.)
  const resourcesFolder = worldFolder.addFolder('Resources').close();
  for (const resource of resources) {
    const resourceFolder = resourcesFolder.addFolder(resource.name);
    resourceFolder.add(resource, 'scarcity', 0, 1).name('Scarcity'); // How rare the resource is (0 = common, 1 = rare)
    resourceFolder.add(resource.scale, 'x', 10, 100).name('Scale X'); // Noise scale on X axis
    resourceFolder.add(resource.scale, 'y', 10, 100).name('Scale Y'); // Noise scale on Y axis
    resourceFolder.add(resource.scale, 'z', 10, 100).name('Scale Z'); // Noise scale on Z axis
  }

  // Tree generation parameters
  const treesFolder = terrainFolder.addFolder('Trees').close();
  treesFolder.add(world.params.trees, 'frequency', 0, 0.1).name('Frequency'); // Probability of tree spawning
  treesFolder.add(world.params.trees.trunk, 'minHeight', 0, 10, 1).name('Min Trunk Height'); // Minimum tree trunk height
  treesFolder.add(world.params.trees.trunk, 'maxHeight', 0, 10, 1).name('Max Trunk Height'); // Maximum tree trunk height
  treesFolder.add(world.params.trees.canopy, 'minRadius', 0, 10, 1).name('Min Canopy Size'); // Minimum leaf radius
  treesFolder.add(world.params.trees.canopy, 'maxRadius', 0, 10, 1).name('Max Canopy Size'); // Maximum leaf radius
  treesFolder.add(world.params.trees.canopy, 'density', 0, 1).name('Canopy Density'); // How full the canopy is

  // Cloud generation parameters
  const cloudsFolder = worldFolder.addFolder('Clouds').close();
  cloudsFolder.add(world.params.clouds, 'density', 0, 1).name('Density'); // How many clouds to generate
  cloudsFolder.add(world.params.clouds, 'scale', 1, 100, 1).name('Scale'); // Size of cloud formations

  // Regenerate world when any world parameter changes
  worldFolder.onFinishChange((event) => {
    world.generate(true); // true = clear cache and regenerate from scratch
  });

  // Toggle GUI visibility with 'U' key
  document.addEventListener('keydown', (event) => {
    if (event.code === 'KeyU') {
      if (gui._hidden) {
        gui.show();
      } else {
        gui.hide();
      }
    }
  })
}