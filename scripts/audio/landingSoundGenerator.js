/**
 * Generates a landing/thud sound effect using Web Audio API
 * Creates a procedural sound without needing external audio files
 */
export class LandingSoundGenerator {
  constructor() {
    this.audioContext = null;
  }

  /**
   * Initializes the audio context (must be called after user interaction)
   */
  init() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  /**
   * Plays a landing sound with specified volume
   * @param {number} volume - Volume level (0.0 to 1.0)
   */
  play(volume = 0.5) {
    if (!this.audioContext) {
      this.init();
    }

    const ctx = this.audioContext;
    const now = ctx.currentTime;

    // Create oscillator for the main thud sound (low frequency)
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Create noise for impact texture
    const noiseBuffer = this.createNoiseBuffer(ctx, 0.1);
    const noiseSource = ctx.createBufferSource();
    const noiseGain = ctx.createGain();
    
    // Main thud: starts at 150Hz and drops to 40Hz quickly
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    
    // Envelope for main thud: quick attack, medium decay
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume * 0.8, now + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
    
    // Noise for impact texture
    noiseSource.buffer = noiseBuffer;
    noiseGain.gain.setValueAtTime(volume * 0.3, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
    
    // Connect nodes
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseSource.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    
    // Play sounds
    osc.start(now);
    osc.stop(now + 0.2);
    
    noiseSource.start(now);
    noiseSource.stop(now + 0.1);
  }

  /**
   * Creates a buffer of white noise
   * @param {AudioContext} ctx - Audio context
   * @param {number} duration - Duration in seconds
   * @returns {AudioBuffer} Buffer containing noise
   */
  createNoiseBuffer(ctx, duration) {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    return buffer;
  }
}
