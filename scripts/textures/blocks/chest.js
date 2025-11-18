import { ModelBlock } from './ModelBlock.js';

export const chest = new ModelBlock({
  id: 16,
  name: 'chest',
  modelPath: './models/chest.glb',
  spawnable: false,
  debug: false,
  animationDuration: 2500 // Animation duration in milliseconds (2.5 seconds)
});