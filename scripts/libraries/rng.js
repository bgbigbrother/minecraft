/**
 * Seeded Random Number Generator
 * Uses Multiply-with-carry algorithm for deterministic random numbers
 * Essential for procedural generation - same seed always produces same results
 */
export class RNG {
  // Internal state variables for the algorithm
  m_w = 123456789;
  m_z = 987654321;
  mask = 0xffffffff; // 32-bit mask

  /**
   * Creates a new RNG with the specified seed
   * @param {number} seed - Seed value for deterministic generation
   */
  constructor(seed) {
    // Initialize state based on seed
    this.m_w = (123456789 + seed) & this.mask;
    this.m_z = (987654321 - seed) & this.mask;
  }

  /**
   * Generates a pseudo-random number between 0 (inclusive) and 1.0 (exclusive)
   * Behaves like Math.random() but with deterministic output based on seed
   * @returns {number} Random number in range [0, 1)
   */
  random() {
      // Multiply-with-carry algorithm
      this.m_z = (36969 * (this.m_z & 65535) + (this.m_z >> 16)) & this.mask;
      this.m_w = (18000 * (this.m_w & 65535) + (this.m_w >> 16)) & this.mask;
      
      // Combine the two 16-bit values into a 32-bit result
      let result = ((this.m_z << 16) + (this.m_w & 65535)) >>> 0;
      
      // Normalize to [0, 1) range
      result /= 4294967296;
      return result;
  }
}