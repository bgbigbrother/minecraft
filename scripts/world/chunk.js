import { Chunk } from '../biome/chunk';
import { StoreWorldBaseClass } from './store_world';

/**
 * Extends world with chunk generation and coordinate conversion
 */
export class ChunkStoreWorldBaseClass extends StoreWorldBaseClass {
    constructor(models) {
        super();
        this.models = models; // 3D models for mobs/entities
    }

    /**
     * Generates a chunk at the specified chunk coordinates
     * @param {number} x - Chunk X coordinate (not world coordinate)
     * @param {number} z - Chunk Z coordinate (not world coordinate)
     */
    generateChunk(x, z) {
        // Create new chunk with world parameters
        const chunk = new Chunk(this.chunkSize, this.params, this.dataStore);
        
        // Position chunk in world space (multiply by chunk width)
        chunk.position.set(x * this.chunkSize.width, 0, z * this.chunkSize.width);
        
        // Store chunk coordinates in userData for later lookup
        chunk.userData = { x, z };

        // Generate chunk terrain either asynchronously or immediately
        if (this.asyncLoading) {
            // Use requestIdleCallback to generate during browser idle time
            // This prevents frame drops during chunk generation
            requestIdleCallback(chunk.generate.bind(chunk, this.models), { timeout: 1000 });
        } else {
            // Generate immediately (may cause frame drops)
            chunk.generate(this.models);
            
            // If progress tracking is enabled, dispatch progress events
            if (this.progressTrackingEnabled) {
                this.initialChunksLoaded++;
                
                // Calculate progress percentage
                const progress = Math.round((this.initialChunksLoaded / this.initialChunksTotal) * 100);
                
                // Dispatch progress event
                document.dispatchEvent(new CustomEvent('game:loading:progress', {
                    detail: {
                        current: this.initialChunksLoaded,
                        total: this.initialChunksTotal,
                        progress: progress
                    },
                    bubbles: true,
                    cancelable: true
                }));
                
                // If all chunks are loaded, re-enable async loading and dispatch completion event
                if (this.initialChunksLoaded >= this.initialChunksTotal) {
                    this.asyncLoading = true;
                    this.progressTrackingEnabled = false;
                    this.isInitialLoad = false;
                    
                    // Dispatch world loaded event
                    document.dispatchEvent(new CustomEvent('game:engine:world:loaded', {
                        bubbles: true,
                        cancelable: true
                    }));
                }
            }
        }

        // Add chunk to world
        this.add(chunk);
        // console.log(`Adding chunk at X: ${x} Z: ${z}`);
    }

    /**
     * Converts world coordinates to chunk and block coordinates
     * Example: world position (35, 10, 50) with chunk width 32
     *   -> chunk (1, 1), block (3, 10, 18)
     * 
     * @param {number} x - World X coordinate
     * @param {number} y - World Y coordinate
     * @param {number} z - World Z coordinate
     * @returns {{
     *   chunk: { x: number, z: number },
     *   block: { x: number, y: number, z: number }
     * }}
     */
    worldToChunkCoords(x, y, z) {
        // Calculate which chunk contains this world position
        const chunkCoords = {
            x: Math.floor(x / this.chunkSize.width),
            z: Math.floor(z / this.chunkSize.width)
        };
    
        // Calculate position within the chunk (0 to chunkSize.width-1)
        const blockCoords = {
            x: x - this.chunkSize.width * chunkCoords.x,
            y,
            z: z - this.chunkSize.width * chunkCoords.z
        };
    
        return {
            chunk: chunkCoords,
            block: blockCoords
        }
    }

    /**
     * Converts chunk coordinates to world coordinates
     * @param {number} x - Chunk X coordinate
     * @param {number} y - Block Y coordinate
     * @param {number} z - Chunk Z coordinate
     * @returns {{
     *   chunk: { x: number, z: number },
     *   block: { x: number, y: number, z: number }
     * }}
     */
    chunkToWorldCoords(x, y, z) {
        // Calculate world position from chunk coordinates
        const chunkCoords = {
            x: Math.floor(x * this.chunkSize.width),
            z: Math.floor(z * this.chunkSize.width)
        };
    
        // Calculate block position within chunk
        const blockCoords = {
            x: x - this.chunkSize.width * chunkCoords.x,
            y,
            z: z - this.chunkSize.width * chunkCoords.z
        };
    
        return {
            chunk: chunkCoords,
            block: blockCoords
        }
    }

    /**
     * Retrieves a chunk object by its chunk coordinates
     * @param {number} chunkX - Chunk X coordinate
     * @param {number} chunkZ - Chunk Z coordinate
     * @returns {Chunk | undefined} The chunk object or undefined if not found
     */
    getChunk(chunkX, chunkZ) {
        return this.children.find((chunk) => (
            chunk.userData.x === chunkX &&
            chunk.userData.z === chunkZ
        ));
    }
}