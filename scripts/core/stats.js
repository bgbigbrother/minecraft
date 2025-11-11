import Stats from 'three/examples/jsm/libs/stats.module.js';

/**
 * Performance monitoring widget
 * Displays FPS, frame time, and memory usage in top-left corner
 */
export const stats = new Stats();
document.body.appendChild(stats.dom); // Add stats panel to DOM