import { AmbientLight } from 'three';
import { scene } from './scene';
import { sun, sunMesh } from './sun';

/**
 * Sets up scene lighting
 * Adds directional sun light and ambient light for proper illumination
 */
export function setupLights() {
    // Add visual sun mesh to scene
    scene.add(sunMesh);
    
    // Add directional light (sun) and its target for shadows
    scene.add(sun);
    scene.add(sun.target);
  
    // Add ambient light for base illumination (prevents completely black shadows)
    const ambient = new AmbientLight();
    ambient.intensity = 0.5; // Moderate ambient lighting
    scene.add(ambient);
}