import { MeshLambertMaterial } from 'three';
import { textures } from '../textures';

export const dirt = {
  id: 2,
  name: 'dirt',
  material: new MeshLambertMaterial({ map: textures.dirt }),
  spawnable: true
}