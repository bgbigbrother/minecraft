import { Scene, Fog } from 'three';

// Scene setup
export const scene = new Scene();
scene.fog = new Fog(0x80a0e0, 50, 75);