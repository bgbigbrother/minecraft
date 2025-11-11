import { AmbientLight } from 'three';
import { scene } from './scene';
import { sun, sunMesh } from './sun';
import { moonMesh } from './moon'

/**
 * Ambient light for base illumination
 * Exported so it can be accessed by DayNightCycle for intensity adjustments
 */
export const ambientLight = new AmbientLight();
ambientLight.intensity = 0.1; // Moderate ambient lighting

/**
 * Sets up scene lighting
 * Adds directional sun light and ambient light for proper illumination
 */
export function setupLights() {
    // Add visual sun mesh to scene
    scene.add(sunMesh);
    
    // Add visual moon mesh to scene (initially hidden)
    scene.add(moonMesh);
    
    // Add directional light (sun) and its target for shadows
    scene.add(sun);
    scene.add(sun.target);
  
    // Add ambient light for base illumination (prevents completely black shadows)
    scene.add(ambientLight);
}