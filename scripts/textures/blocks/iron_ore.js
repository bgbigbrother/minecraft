import { MeshLambertMaterial } from 'three';
import { textures } from '../textures';

export const ironOre = {
  id: 5,
  name: 'iron_ore',
  material: new MeshLambertMaterial({ map: textures.ironOre }),
  scale: { x: 40, y: 40, z: 40 },
  scarcity: 0.9,
  spawnable: false
}