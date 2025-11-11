import { MeshStandardMaterial, DoubleSide } from 'three';

export const water = {
  id: 15,
  name: 'water',
  material: new MeshStandardMaterial({
    color: 0x3030f2,
    transparent: true,
    opacity: 0.6,
    metalness: 0.8,
    roughness: 0.2,
    side: DoubleSide
  })
};
