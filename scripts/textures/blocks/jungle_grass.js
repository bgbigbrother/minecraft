import { MeshLambertMaterial } from 'three';
import { textures } from '../textures';

export const jungleGrass = {
  id: 14,
  name: 'jungleGrass',
  material: [
    new MeshLambertMaterial({ color: 0x80c080, map: textures.grassSide }), // right
    new MeshLambertMaterial({ color: 0x80c080, map: textures.grassSide }), // left
    new MeshLambertMaterial({ color: 0x80c080, map: textures.grass }), // top
    new MeshLambertMaterial({ color: 0x80c080, map: textures.dirt }), // bottom
    new MeshLambertMaterial({ color: 0x80c080, map: textures.grassSide }), // front
    new MeshLambertMaterial({ color: 0x80c080, map: textures.grassSide })  // back
  ]
}