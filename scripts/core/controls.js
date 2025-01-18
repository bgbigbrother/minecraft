import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { renderer } from './renderer';
import { orbitCamera } from './camera';


export const controls = new OrbitControls(orbitCamera, renderer.domElement);
controls.update();