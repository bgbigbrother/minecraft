import { AmbientLight } from 'three';
import { scene } from './scene';
import { sun, sunMesh } from './sun';

export function setupLights() {
    scene.add(sunMesh);
    scene.add(sun);
    scene.add(sun.target);
  
    const ambient = new AmbientLight();
    ambient.intensity = 0.5;
    scene.add(ambient);
}