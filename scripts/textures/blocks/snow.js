import { MeshLambertMaterial } from 'three';
import { textures } from '../textures';

export const snow = {
  id: 10,
  name: 'snow',
  material: [
    new MeshLambertMaterial({ map: textures.snowSide }), // right
    new MeshLambertMaterial({ map: textures.snowSide }), // left
    new MeshLambertMaterial({ map: textures.snow }), // top
    new MeshLambertMaterial({ map: textures.dirt }), // bottom
    new MeshLambertMaterial({ map: textures.snowSide }), // front
    new MeshLambertMaterial({ map: textures.snowSide })  // back
  ]
}