import { MeshLambertMaterial } from 'three';
import { textures } from '../textures';

export const leaves = {
  id: 7,
  name: 'leaves',
  visible: true,
  material: new MeshLambertMaterial({ map: textures.leaves })
}