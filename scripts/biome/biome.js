import * as THREE from 'three';
import { Terrain } from './terrain';
import { SimplexNoise } from 'three/examples/jsm/math/SimplexNoise.js';
import { RNG } from '../libraries/rng';
import { blocks } from '../textures/blocks.js';
import { Tree } from './tree';
import { Clouds } from './clouds';

const geometry = new THREE.BoxGeometry();

export class Biome extends Terrain {
    params = {};

     biome = null;

    constructor(params, dataStore, size) {
        super(dataStore, size);
        this.params = params;
        this.rng = new RNG(this.params.seed);
    }

    /**
     * Generates the terrain data for the world
     */
    generateTerrain() {
        const simplex = new SimplexNoise(this.rng);
        for (let x = 0; x < this.size.width; x++) {
            for (let z = 0; z < this.size.width; z++) {
                this.biome = this.getBiome(simplex, x, z);

                // Compute the noise value at this x-z location
                const value = simplex.noise(
                    (this.position.x + x) / this.params.terrain.scale,
                    (this.position.z + z) / this.params.terrain.scale
                );

                // Scale the noise based on the magnitude/offset
                const scaledNoise = this.params.terrain.offset +
                    this.params.terrain.magnitude * value;

                // Computing the height of the terrain at this x-z location
                let height = Math.floor(scaledNoise);

                // Clamping height between 0 and max height
                height = Math.max(0, Math.min(height, this.size.height - 1));

                // Fill in all blocks at or below the terrain height
                for (let y = this.size.height; y >= 0; y--) {
                    if (y <= this.params.terrain.waterOffset && y === height) {
                    this.setBlockId(x, y, z, blocks.sand.id);
                    } else if (y === height) {
                    let groundBlockType;
                    if (this.biome === 'Desert') {
                        groundBlockType = blocks.sand.id;
                    } else if (this.biome === 'Temperate' || this.biome === 'Jungle') {
                        groundBlockType = blocks.grass.id;
                    } else if (this.biome === 'Tundra') {
                        groundBlockType = blocks.snow.id;
                    } else if (this.biome === 'Jungle') {
                        groundBlockType = blocks.jungleGrass.id;
                    }

                    this.setBlockId(x, y, z, groundBlockType);

                    // Randomly generate a tree
                    if (this.rng.random() < this.params.trees.frequency) {
                        const tree = new Tree(this.biome, this.rng, x, height + 1, z, this.params.trees);
                        const treeBlocks = tree.generate();
                        
                        // Apply the tree blocks to the world
                        treeBlocks.forEach(block => {
                        if (this.inBounds(block.x, block.y, block.z)) {
                            this.setBlockId(block.x, block.y, block.z, block.id);
                        }
                        });
                    }
                    } else if (y < height && this.getBlock(x, y, z).id === blocks.empty.id) {
                    this.generateBlockIfNeeded(simplex, x, y, z);
                    }
                }
            }
        }

        // Fill empty blocks below water level with water blocks
        const waterLevel = this.params.terrain.waterLevel;
        for (let x = 0; x < this.size.width; x++) {
            for (let z = 0; z < this.size.width; z++) {
                for (let y = 0; y <= waterLevel; y++) {
                    const block = this.getBlock(x, y, z);
                    // Only place water in empty spaces (don't replace solid blocks)
                    if (block && block.id === blocks.empty.id) {
                        this.setBlockId(x, y, z, blocks.water.id);
                    }
                }
            }
        }
    }

    /**
     * Get the biome at the local chunk coordinates (x,z)
     * @param {SimplexNoise} simplex 
     * @param {number} x 
     * @param {number} z 
     */
    getBiome(simplex, x, z) {
        let noise = 0.5 * simplex.noise(
            (this.position.x + x) / this.params.biomes.scale,
            (this.position.z + z) / this.params.biomes.scale
        ) + 0.5;

        noise += this.params.biomes.variation.amplitude * (simplex.noise(
            (this.position.x + x) / this.params.biomes.variation.scale,
            (this.position.z + z) / this.params.biomes.variation.scale
        ));

        if (noise < this.params.biomes.tundraToTemperate) {
            return 'Tundra';
        } else if (noise < this.params.biomes.temperateToJungle) {
            return 'Temperate';
        } else if (noise < this.params.biomes.jungleToDesert) {
            return 'Jungle';
        } else {
            return 'Desert';
        }
    }

    /**
    * Generates the 3D representation of the world from the world data
    */
    generateMeshes() {
        this.clear();

        const clouds = new Clouds(this.size, this.params.clouds);
        clouds.generate(this.rng);
        this.add(clouds);

        const maxCount = this.size.width * this.size.width * this.size.height;

        // Creating a lookup table where the key is the block id
        const meshes = {};
        Object.values(blocks)
        .filter(blockType => blockType.id !== blocks.empty.id)
        .forEach(blockType => {
            const mesh = new THREE.InstancedMesh(geometry, blockType.material, maxCount);
            mesh.name = blockType.id;
            mesh.count = 0;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            meshes[blockType.id] = mesh;
        });

        const matrix = new THREE.Matrix4();
        for (let x = 0; x < this.size.width; x++) {
            for (let y = 0; y < this.size.height; y++) {
                for (let z = 0; z < this.size.width; z++) {
                    const blockId = this.getBlock(x, y, z).id;

                    if (blockId === blocks.empty.id) continue;

                    const mesh = meshes[blockId];
                    const instanceId = mesh.count;

                    if (!this.isBlockObscured(x, y, z)) {
                        matrix.setPosition(x, y, z);
                        mesh.setMatrixAt(instanceId, matrix);
                        this.setBlockInstanceId(x, y, z, instanceId);
                        mesh.count++;
                    }
                }
            }
        }

        this.add(...Object.values(meshes));
    }
}