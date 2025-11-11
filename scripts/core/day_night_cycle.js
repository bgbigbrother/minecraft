import { updateMoonPosition } from './moon';

/**
 * Color keyframes for sky and fog transitions throughout the day/night cycle
 * Maps time values (0-24000) to hex color values
 */
const SKY_COLORS = {
  0: 0x000510,      // Pre-dawn (very dark blue)
  5000: 0xff6b35,   // Sunrise (orange)
  6000: 0x80a0e0,   // Day (bright blue)
  11000: 0x80a0e0,  // Late day (bright blue)
  12000: 0xff6b35,  // Sunset (orange)
  13000: 0x1a0a2e,  // Dusk (dark purple)
  14000: 0x0a0520,  // Early night (very dark blue)
  18000: 0x000208,  // Midnight (almost black with slight blue tint)
  22000: 0x0a0520,  // Late night (very dark blue)
  23000: 0x000510   // Pre-dawn (very dark blue)
};

/**
 * DayNightCycle class manages the day/night cycle system
 * Handles time progression, celestial body positioning, lighting, and sky color transitions
 */
export class DayNightCycle {
  /**
   * Creates a new DayNightCycle instance
   * @param {THREE.Scene} scene - The Three.js scene object
   * @param {THREE.DirectionalLight} sun - The directional light representing sun/moon
   * @param {THREE.Mesh} sunMesh - Visual mesh for the sun
   * @param {THREE.Mesh} moonMesh - Visual mesh for the moon
   * @param {THREE.AmbientLight} ambientLight - The ambient light object
   * @param {Object} options - Configuration options
   * @param {number} options.speed - Time progression multiplier (default: 1.0)
   * @param {number} options.startTime - Initial time value (default: 0)
   */
  constructor(scene, sun, sunMesh, moonMesh, ambientLight, options = {}) {
    // Validate required dependencies
    if (!scene) throw new Error('DayNightCycle: scene is required');
    if (!sun) throw new Error('DayNightCycle: sun (directional light) is required');
    if (!sunMesh) throw new Error('DayNightCycle: sunMesh is required');
    if (!moonMesh) throw new Error('DayNightCycle: moonMesh is required');
    if (!ambientLight) throw new Error('DayNightCycle: ambientLight is required');

    // Store references to scene and lighting objects
    this.scene = scene;
    this.sun = sun;
    this.sunMesh = sunMesh;
    this.moonMesh = moonMesh;
    this.ambientLight = ambientLight;

    // Initialize time state properties
    this.currentTime = options.startTime || 0;
    this.speed = options.speed || 1.0;
    this.isDay = this.currentTime < 12000;
    this.phase = this._calculatePhase(this.currentTime);
  }

  /**
   * Calculates the current phase based on time
   * @param {number} time - Current time value
   * @returns {string} Phase name ('day', 'sunset', 'night', 'sunrise')
   * @private
   */
  _calculatePhase(time) {
    if (time >= 0 && time < 5000) return 'sunrise';
    if (time >= 5000 && time < 11000) return 'day';
    if (time >= 11000 && time < 13000) return 'sunset';
    if (time >= 13000 && time < 23000) return 'night';
    return 'sunrise'; // 23000-24000
  }

  /**
   * Updates the day/night cycle - called once per frame
   * @param {number} deltaTime - Time elapsed since last frame in seconds
   */
  update(deltaTime) {
    // Increment time based on deltaTime and speed
    this.currentTime += deltaTime * this.speed * 100; // Scale factor for reasonable cycle duration

    // Wrap time when it exceeds 24000
    if (this.currentTime >= 24000) {
      this.currentTime = this.currentTime % 24000;
    }

    // Update cached state
    this.isDay = this.currentTime < 12000;
    this.phase = this._calculatePhase(this.currentTime);

    // Update all visual elements
    this._updateCelestialBodies();
    this._updateLighting();
    this._updateSkyColors();
  }

  /**
   * Gets the current time value
   * @returns {number} Current time between 0-24000
   */
  getTime() {
    return this.currentTime;
  }

  /**
   * Manually sets the current time
   * @param {number} time - Time value to set (will be clamped to 0-24000)
   */
  setTime(time) {
    // Clamp time to valid range
    if (time < 0) {
      console.warn('DayNightCycle: setTime() received negative value, clamping to 0');
      this.currentTime = 0;
    } else if (time > 24000) {
      console.warn('DayNightCycle: setTime() received value > 24000, clamping to 24000');
      this.currentTime = 24000;
    } else {
      this.currentTime = time;
    }

    // Update cached state
    this.isDay = this.currentTime < 12000;
    this.phase = this._calculatePhase(this.currentTime);
  }

  /**
   * Changes the time progression speed
   * @param {number} speed - Speed multiplier (1.0 = normal)
   */
  setSpeed(speed) {
    this.speed = speed;
  }

  /**
   * Calculates 3D position for celestial body (sun/moon) on an arc
   * @param {number} time - Current time value (0-24000)
   * @param {number} radius - Distance from center point
   * @returns {THREE.Vector3} Position on the arc
   * @private
   */
  _calculateCelestialPosition(time, radius) {
    // Map time (0-24000) to angle in radians (0 to 2π)
    const angle = (time / 24000) * Math.PI * 2;
    
    // Calculate position using trigonometry
    // X-axis: East (-) to West (+)
    // Y-axis: Vertical height (0 at horizon, max at noon/midnight)
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const z = 0; // Keep constant on North/South axis
    
    return { x, y, z };
  }

  /**
   * Updates celestial body positions and visibility based on current time
   * @private
   */
  _updateCelestialBodies() {
    const radius = 100; // Distance for celestial bodies from center
    
    // Calculate sun position (always calculate, even at night)
    const sunPosition = this._calculateCelestialPosition(this.currentTime, radius);
    this.sunMesh.position.set(sunPosition.x, sunPosition.y, sunPosition.z);
    
    // Update moon position to be 180 degrees opposite of the sun
    updateMoonPosition(this.sunMesh.position);
    
    // Directional light always follows the sun position
    this.sun.position.set(sunPosition.x, sunPosition.y, sunPosition.z);
    
    // Toggle visibility based on time
    // Sun visible during day (0-12000), moon visible during night (12000-24000)
    if (this.currentTime >= 0 && this.currentTime < 12000) {
      // Daytime - show sun, hide moon
      this.sunMesh.visible = true;
      this.moonMesh.visible = false;
    } else {
      // Nighttime - show moon, hide sun
      this.sunMesh.visible = false;
      this.moonMesh.visible = true;
    }
  }

  /**
   * Smoothly interpolates between two hex colors
   * @param {number} color1 - First color as hex value
   * @param {number} color2 - Second color as hex value
   * @param {number} factor - Interpolation factor (0-1)
   * @returns {number} Interpolated color as hex value
   * @private
   */
  _interpolateColor(color1, color2, factor) {
    // Extract RGB components from hex colors
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;

    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;

    // Interpolate each component
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);

    // Combine back into hex color
    return (r << 16) | (g << 8) | b;
  }

  /**
   * Updates lighting intensity and color based on current time
   * Interpolates between day and night lighting values
   * @private
   */
  _updateLighting() {
    // Define intensity curves
    const DIRECTIONAL_MAX = 1.5;  // Noon intensity
    const DIRECTIONAL_MIN = 0.3;  // Midnight intensity
    const AMBIENT_MAX = 0.5;      // Noon intensity
    const AMBIENT_MIN = 0.2;      // Midnight intensity

    // Define light colors
    const DAY_COLOR = 0xffffff;   // Warm white for day
    const NIGHT_COLOR = 0xaaaaff; // Cool blue-white for night

    // Calculate interpolation factor based on time
    // Use cosine wave for smooth transition: 1 at noon (6000), -1 at midnight (18000)
    const timeAngle = (this.currentTime / 24000) * Math.PI * 2;
    const cosValue = Math.cos(timeAngle);
    
    // Map cosine value (-1 to 1) to interpolation factor (0 to 1)
    // cosValue = 1 at time 0, -1 at time 12000, 1 at time 24000
    // We want: max intensity at 6000 (noon), min at 18000 (midnight)
    // Shift by 90 degrees (π/2) to align with our time system
    const shiftedAngle = timeAngle - Math.PI / 2;
    const shiftedCos = Math.cos(shiftedAngle);
    
    // Convert to 0-1 range (0 = midnight, 1 = noon)
    const intensityFactor = (shiftedCos + 1) / 2;

    // Interpolate directional light intensity
    this.sun.intensity = DIRECTIONAL_MIN + (DIRECTIONAL_MAX - DIRECTIONAL_MIN) * intensityFactor;

    // Interpolate ambient light intensity
    this.ambientLight.intensity = AMBIENT_MIN + (AMBIENT_MAX - AMBIENT_MIN) * intensityFactor;

    // Update directional light color based on day/night
    // Transition happens around sunrise/sunset
    if (this.currentTime >= 0 && this.currentTime < 12000) {
      // Daytime - warm white
      this.sun.color.setHex(DAY_COLOR);
    } else {
      // Nighttime - cool blue-white
      this.sun.color.setHex(NIGHT_COLOR);
    }
  }

  /**
   * Updates sky and fog colors based on current time
   * Smoothly transitions between color keyframes
   * @private
   */
  _updateSkyColors() {
    // Get sorted array of keyframe times
    const keyframeTimes = Object.keys(SKY_COLORS).map(Number).sort((a, b) => a - b);
    
    // Find the two nearest keyframes for current time
    let lowerKeyframe = keyframeTimes[0];
    let upperKeyframe = keyframeTimes[keyframeTimes.length - 1];
    
    for (let i = 0; i < keyframeTimes.length - 1; i++) {
      if (this.currentTime >= keyframeTimes[i] && this.currentTime <= keyframeTimes[i + 1]) {
        lowerKeyframe = keyframeTimes[i];
        upperKeyframe = keyframeTimes[i + 1];
        break;
      }
    }
    
    // Handle wrap-around case (time between last keyframe and first keyframe)
    if (this.currentTime > keyframeTimes[keyframeTimes.length - 1]) {
      lowerKeyframe = keyframeTimes[keyframeTimes.length - 1];
      upperKeyframe = keyframeTimes[0] + 24000; // Wrap to next cycle
    }
    
    // Calculate interpolation factor (0-1) between the two keyframes
    const timeRange = upperKeyframe - lowerKeyframe;
    const timeDelta = this.currentTime - lowerKeyframe;
    const factor = timeRange > 0 ? timeDelta / timeRange : 0;
    
    // Get colors for the keyframes
    const lowerColor = SKY_COLORS[lowerKeyframe % 24000];
    const upperColor = SKY_COLORS[upperKeyframe % 24000];
    
    // Interpolate between the two colors
    const interpolatedColor = this._interpolateColor(lowerColor, upperColor, factor);
    
    // Update scene background
    if (this.scene.background) {
      this.scene.background.setHex(interpolatedColor);
    }
    
    // Update fog color if fog exists
    if (this.scene.fog && this.scene.fog.color) {
      this.scene.fog.color.setHex(interpolatedColor);
    }
  }
}
