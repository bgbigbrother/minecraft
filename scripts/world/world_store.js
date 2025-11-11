/**
 * Data store for persisting block modifications
 * Stores player-made changes to blocks (placed/destroyed blocks)
 * Used for save/load functionality
 */
export class DataStore {
  /**
   * Creates a new empty data store
   */
  constructor() {
    this.data = {}; // Key-value store: "chunkX,chunkZ,blockX,blockY,blockZ" -> blockId
  }

  /**
   * Clears all stored block data
   */
  clear() {
    this.data = {};
  }

  /**
   * Checks if a block modification exists at the specified coordinates
   * @param {number} chunkX - Chunk X coordinate
   * @param {number} chunkZ - Chunk Z coordinate
   * @param {number} blockX - Block X coordinate within chunk
   * @param {number} blockY - Block Y coordinate
   * @param {number} blockZ - Block Z coordinate within chunk
   * @returns {boolean} True if block data exists
   */
  contains(chunkX, chunkZ, blockX, blockY, blockZ) {
    const key = this.#getKey(chunkX, chunkZ, blockX, blockY, blockZ);
    return this.data[key] !== undefined;
  }

  /**
   * Retrieves the block ID at the specified coordinates
   * @param {number} chunkX - Chunk X coordinate
   * @param {number} chunkZ - Chunk Z coordinate
   * @param {number} blockX - Block X coordinate within chunk
   * @param {number} blockY - Block Y coordinate
   * @param {number} blockZ - Block Z coordinate within chunk
   * @returns {number | undefined} Block ID or undefined if not found
   */
  get(chunkX, chunkZ, blockX, blockY, blockZ) {
    const key = this.#getKey(chunkX, chunkZ, blockX, blockY, blockZ);
    const blockId = this.data[key];
    return blockId;
  }

  /**
   * Stores a block modification at the specified coordinates
   * @param {number} chunkX - Chunk X coordinate
   * @param {number} chunkZ - Chunk Z coordinate
   * @param {number} blockX - Block X coordinate within chunk
   * @param {number} blockY - Block Y coordinate
   * @param {number} blockZ - Block Z coordinate within chunk
   * @param {number} blockId - Block type ID to store
   */
  set(chunkX, chunkZ, blockX, blockY, blockZ, blockId) {
    const key = this.#getKey(chunkX, chunkZ, blockX, blockY, blockZ);
    this.data[key] = blockId;
  }

  /**
   * Generates a unique string key from block coordinates
   * @private
   * @param {number} chunkX - Chunk X coordinate
   * @param {number} chunkZ - Chunk Z coordinate
   * @param {number} blockX - Block X coordinate within chunk
   * @param {number} blockY - Block Y coordinate
   * @param {number} blockZ - Block Z coordinate within chunk
   * @returns {string} Unique key string
   */
  #getKey(chunkX, chunkZ, blockX, blockY, blockZ) {
    return `${chunkX},${chunkZ},${blockX},${blockY},${blockZ}`;
  }
}