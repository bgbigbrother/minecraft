import { MeshLambertMaterial } from 'three';
import { textures } from '../textures';

export const coalOre = {
  id: 4,
  name: 'coal_ore',
  material: new MeshLambertMaterial({ map: textures.coalOre }),
  scale: { x: 20, y: 20, z: 20 },
  scarcity: 0.8,
  spawnable: false
}