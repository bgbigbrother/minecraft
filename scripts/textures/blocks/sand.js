import { MeshLambertMaterial } from 'three';
import { textures } from '../textures';

export const sand = {
  id: 8,
  name: 'sand',
  visible: true,
  material: new MeshLambertMaterial({ map: textures.sand })
}