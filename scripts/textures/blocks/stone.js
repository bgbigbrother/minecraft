import { MeshLambertMaterial } from 'three';
import { textures } from '../textures';

export const stone = {
  id: 3,
  name: 'stone',
  material: new MeshLambertMaterial({ map: textures.stone }),
  scale: { x: 30, y: 30, z: 30 },
  scarcity: 0.8,
  spawnable: false
}