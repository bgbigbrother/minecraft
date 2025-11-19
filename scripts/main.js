// Import menu bridge for game-UI integration
import { initializeMenuBridge } from './integration/menuBridge.js';

/**
 * Main application entry point
 * Initializes the menu bridge which handles game initialization
 * through menu events (new game, load game)
 */
initializeMenuBridge();