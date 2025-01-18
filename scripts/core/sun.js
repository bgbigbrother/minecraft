import { DirectionalLight, Vector2, SphereGeometry, MeshBasicMaterial, Mesh } from 'three';

export const sun = new DirectionalLight();
sun.intensity = 1.5;
sun.position.set(50, 50, 50);
sun.castShadow = true;

// Set the size of the sun's shadow box
sun.shadow.camera.left = -40;
sun.shadow.camera.right = 40;
sun.shadow.camera.top = 40;
sun.shadow.camera.bottom = -40;
sun.shadow.camera.near = 0.1;
sun.shadow.camera.far = 200;
sun.shadow.bias = -0.0001;
sun.shadow.mapSize = new Vector2(512, 512);

// Create a visual representation of the sun
const sunGeometry = new SphereGeometry(2, 32, 32); // A sphere geometry for the sun
const sunMaterial = new MeshBasicMaterial({ color: 0xffdd00 }); // Bright yellow color for the sun
export const sunMesh = new Mesh(sunGeometry, sunMaterial);
sunMesh.position.copy(sun.position); // Position the sun mesh at the light's position