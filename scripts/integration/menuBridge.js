/**
 * Menu Bridge - Provides interface between React UI and game systems
 * Exposes game functions to React components via window.gameBridge
 */
import { World } from '../world/world.js';
import { Player } from '../player/player.js';
import { Physics } from '../physics/physics.js';
import { scene } from '../core/scene.js';
import { onResize } from '../core/resize.js';
import { setupLights, ambientLight } from '../core/lights.js';
import { animate } from '../core/animation.js';
import { ModelLoader } from '../mobs/model_loader.js';
import { DayNightCycle } from '../core/day_night_cycle.js';
import { sun, sunMesh } from '../core/sun.js';
import { moonMesh } from '../core/moon.js';
import { ToolbarUI } from '../inventory/ToolbarUI.js';
import { GameOverSystem } from '../player/gameOver.js';
import { setupUI } from '../ui.js';
import { setStatsEnabled } from '../core/stats.js';

// Store references to game systems for event handlers
let gameState = {
  world: null,
  player: null,
  physics: null,
  dayNightCycle: null,
  toolbarUI: null,
  gameOverSystem: null,
  models: null,
  isInitialized: false
};

/**
 * Initialize the menu bridge and expose game functions
 * This should be called once at application startup
 */
export function initializeMenuBridge() {
  console.log('Initializing menu bridge...');
  
  // Preload 3D models for use in game initialization
  new ModelLoader((models) => {
    gameState.models = models;
    console.log('3D models loaded and ready');
  });
  
  // Expose game functions to React components via window.gameBridge
  window.gameBridge = {
    startNewGame: (worldName) => handleNewGame({ worldName }),
    loadGame: (worldData) => handleLoadGame({ worldData }),
    updateSetting: (key, value) => handleOptionsUpdate({ key, value }),
    isPointerLocked: () => document.pointerLockElement !== null,
    requestPointerLock: () => {
      const canvas = document.querySelector('#app canvas');
      if (canvas) {
        canvas.requestPointerLock();
      }
    }
  };
  
  console.log('Menu bridge initialized');
}

/**
 * Handle new game start from menu
 * Initializes a fresh world with the provided world name
 * @param {Object} payload - Payload containing worldName
 */
function handleNewGame(payload) {
  const { worldName } = payload;
  console.log(`Starting new game: ${worldName}`);
  
  // Wait for models to be loaded
  if (!gameState.models) {
    console.warn('Models not loaded yet, waiting...');
    setTimeout(() => handleNewGame(payload), 100);
    return;
  }
  
  try {
    // Create and generate the voxel world
    const world = new World(gameState.models);
    world.name = worldName; // Set the world name
    world.generate(); // Generate initial chunks around spawn point
    scene.add(world); // Add world to the Three.js scene
    
    // Initialize player with physics
    const player = new Player(scene, world);
    const physics = new Physics(scene);
    player.addPhysics(physics); // Attach physics system to player
    
    // Connect player to world for save/load operations
    world.player = player;
    
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
    
    // Store references for future use
    gameState.world = world;
    gameState.player = player;
    gameState.physics = physics;
    gameState.dayNightCycle = dayNightCycle;
    gameState.toolbarUI = toolbarUI;
    gameState.gameOverSystem = gameOverSystem;
    gameState.isInitialized = true;
    
    // Start the animation loop
    animate.call(this, player, world, dayNightCycle, toolbarUI, gameOverSystem);
    
    console.log(`New game "${worldName}" started successfully`);
  } catch (error) {
    console.error('Failed to start new game:', error);
    alert(`Failed to start new game: ${error.message}`);
  }
}

/**
 * Handle load game from menu
 * Loads a saved world and restores player state
 * @param {Object} payload - Payload containing world data
 */
function handleLoadGame(payload) {
  const { worldData } = payload;
  console.log(`Loading game: ${worldData.name}`);
  
  // Wait for models to be loaded
  if (!gameState.models) {
    console.warn('Models not loaded yet, waiting...');
    setTimeout(() => handleLoadGame(payload), 100);
    return;
  }
  
  try {
    // Create the world
    const world = new World(gameState.models);
    world.name = worldData.name; // Set the world name
    
    // Initialize player with physics
    const player = new Player(scene, world);
    const physics = new Physics(scene);
    player.addPhysics(physics);
    
    // Connect player to world for save/load operations
    world.player = player;
    
    // Load world data using the new loadFromData method
    // This handles params, chunk data, and player state restoration
    world.loadFromData(worldData);
    
    // Add world to scene
    scene.add(world);
    
    // Initialize game over system
    const gameOverSystem = new GameOverSystem(player, world);
    
    // Initialize toolbar UI
    const toolbarUI = new ToolbarUI(player.inventory);
    toolbarUI.player = player;
    toolbarUI.render();
    
    // Connect inventory system to world
    world.inventoryManager = player.inventory;
    world.toolbarUI = toolbarUI;
    
    // Handle window resize events
    window.addEventListener('resize', onResize.bind(this, player));
    
    // Initialize UI controls and lighting
    setupUI(world, player, physics, scene);
    setupLights();
    
    // Create DayNightCycle instance
    const dayNightCycle = new DayNightCycle(scene, sun, sunMesh, moonMesh, ambientLight, world);
    
    // Store references
    gameState.world = world;
    gameState.player = player;
    gameState.physics = physics;
    gameState.dayNightCycle = dayNightCycle;
    gameState.toolbarUI = toolbarUI;
    gameState.gameOverSystem = gameOverSystem;
    gameState.isInitialized = true;
    
    // Start the animation loop
    animate.call(this, player, world, dayNightCycle, toolbarUI, gameOverSystem);
    
    console.log(`Game "${worldData.name}" loaded successfully`);
  } catch (error) {
    console.error('Failed to load game:', error);
    alert(`Failed to load game: ${error.message}`);
  }
}

/**
 * Handle options update from menu
 * Applies settings to game systems
 * @param {Object} payload - Payload containing key and value
 */
function handleOptionsUpdate(payload) {
  const { key, value } = payload;
  console.log(`Updating option: ${key} = ${value}`);
  
  try {
    switch (key) {
      case 'musicVolume':
        // Update music volume (0-100)
        const musicElement = document.getElementById('theme-music');
        if (musicElement) {
          musicElement.volume = value / 100; // Convert to 0-1 range
          console.log(`Music volume set to ${value}%`);
        }
        break;
        
      case 'showFPS':
        // Toggle FPS display
        setStatsEnabled(value);
        console.log(`FPS display ${value ? 'enabled' : 'disabled'}`);
        break;
        
      default:
        console.warn(`Unknown setting: ${key}`);
    }
  } catch (error) {
    console.error(`Failed to apply setting ${key}:`, error);
    alert(`Failed to apply setting ${key}: ${error.message}`);
  }
}
