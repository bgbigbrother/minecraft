import { WebGLRenderer, PCFSoftShadowMap } from 'three';

/**
 * WebGL renderer configuration
 * Handles rendering the 3D scene to the canvas
 */
export const renderer = new WebGLRenderer();
renderer.setPixelRatio(window.devicePixelRatio); // Match device pixel ratio for sharp rendering
renderer.setSize(window.innerWidth, window.innerHeight); // Set canvas size to window size
renderer.setClearColor(0x80a0e0); // Sky blue background color
renderer.shadowMap.enabled = true; // Enable shadow rendering
renderer.shadowMap.type = PCFSoftShadowMap; // Use soft shadows for better quality
document.body.appendChild(renderer.domElement); // Add canvas to DOM