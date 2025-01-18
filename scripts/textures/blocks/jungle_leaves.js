import { MeshLambertMaterial } from 'three';
import { textures } from '../textures';

export const jungleLeaves = {
  id: 12,
  name: 'jungleLeaves',
  material: new MeshLambertMaterial({ map: textures.jungleLeaves })
}