import * as THREE from 'three';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';

export class Clouds extends THREE.Group {
  params = {
    scale: 30,
    density: 0.5
  };

  constructor(size, params) {
    super();
    this.size = size;
    this.params = params;
  }

  generate(rng) {
    const simplex = new SimplexNoise(rng);

    // Create a geometry and material for the cloud plane
    const cloudGeometry = new THREE.PlaneGeometry(
      this.size.width,
      this.size.width,
      this.size.width / 2,
      this.size.width / 2
    );

    const cloudMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff, // Cloud color
      transparent: true,
      opacity: 0.8, // Slight transparency for a cloud effect
      side: THREE.DoubleSide // Render both sides of the plane
    });

    // Modify the vertices of the plane based on the noise function
    const vertices = cloudGeometry.attributes.position.array;
    for (let i = 0; i < vertices.length; i += 3) {
        const x = vertices[i];
        const z = vertices[i + 2];

        const value = (simplex.noise(
            (this.position.x + x) / this.params.scale,
            (this.position.z + z) / this.params.scale
        ) + 1) * 0.5;

        if (value < this.params.density) {
            vertices[i + 1] = 0; // Keep cloud flat at height 0
        }
    }

    cloudGeometry.attributes.position.needsUpdate = true;
    cloudGeometry.computeVertexNormals();

    // Create the cloud mesh and add it to the scene
    const cloudPlane = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloudPlane.rotation.x = -Math.PI / 2; // Rotate to lay flat
    cloudPlane.position.set(
      this.size.width / 2,
      this.size.height,
      this.size.width / 2
    );
    cloudPlane.layers.set(1);
    this.add(cloudPlane);
  }
}