import Stats from 'three/examples/jsm/libs/stats.module.js';

/**
 * Performance monitoring widget
 * Displays FPS, frame time, and memory usage in top-left corner
 */
export const stats = new Stats();

// Stats are disabled by default
let statsEnabled = false;

/**
 * Toggle stats display on/off
 * @param {boolean} enabled - Whether to show stats
 */
export function setStatsEnabled(enabled) {
  statsEnabled = enabled;
  if (enabled) {
    document.body.appendChild(stats.dom);
  } else {
    if (stats.dom.parentElement) {
      document.body.removeChild(stats.dom);
    }
  }
}

/**
 * Check if stats are currently enabled
 * @returns {boolean}
 */
export function isStatsEnabled() {
  return statsEnabled;
}