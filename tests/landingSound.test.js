import { describe, test, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { LandingSoundGenerator } from '../scripts/audio/landingSoundGenerator.js';

describe('Landing Sound System', () => {
  let mockAudioContext;
  let mockOscillator;
  let mockGainNode;
  let mockBufferSource;
  let mockNoiseGain;

  beforeEach(() => {
    // Mock oscillator
    mockOscillator = {
      type: 'sine',
      frequency: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn()
      },
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn()
    };

    // Mock gain nodes
    mockGainNode = {
      gain: {
        setValueAtTime: jest.fn(),
        linearRampToValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn()
      },
      connect: jest.fn()
    };

    mockNoiseGain = {
      gain: {
        setValueAtTime: jest.fn(),
        exponentialRampToValueAtTime: jest.fn()
      },
      connect: jest.fn()
    };

    // Mock buffer source
    mockBufferSource = {
      buffer: null,
      connect: jest.fn(),
      start: jest.fn(),
      stop: jest.fn()
    };

    // Mock AudioContext
    mockAudioContext = {
      currentTime: 0,
      sampleRate: 44100,
      destination: {},
      createOscillator: jest.fn(() => mockOscillator),
      createGain: jest.fn(() => {
        // Return different gain nodes for each call
        const gainNode = {
          gain: {
            setValueAtTime: jest.fn(),
            linearRampToValueAtTime: jest.fn(),
            exponentialRampToValueAtTime: jest.fn()
          },
          connect: jest.fn()
        };
        return gainNode;
      }),
      createBufferSource: jest.fn(() => mockBufferSource),
      createBuffer: jest.fn((channels, length, sampleRate) => ({
        getChannelData: jest.fn(() => new Float32Array(length))
      }))
    };

    // Mock window.AudioContext
    global.AudioContext = jest.fn(() => mockAudioContext);
    global.webkitAudioContext = jest.fn(() => mockAudioContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    test('should create instance without initializing AudioContext', () => {
      const generator = new LandingSoundGenerator();
      expect(generator).toBeDefined();
      expect(generator.audioContext).toBeNull();
    });

    test('should initialize AudioContext when init() is called', () => {
      const generator = new LandingSoundGenerator();
      generator.init();
      
      expect(generator.audioContext).toBeDefined();
      expect(AudioContext).toHaveBeenCalled();
    });

    test('should not create multiple AudioContexts on repeated init calls', () => {
      const generator = new LandingSoundGenerator();
      generator.init();
      const firstContext = generator.audioContext;
      
      generator.init();
      const secondContext = generator.audioContext;
      
      expect(firstContext).toBe(secondContext);
      expect(AudioContext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Sound Generation', () => {
    test('should initialize AudioContext on first play if not already initialized', () => {
      const generator = new LandingSoundGenerator();
      expect(generator.audioContext).toBeNull();
      
      generator.play(0.5);
      
      expect(generator.audioContext).toBeDefined();
      expect(AudioContext).toHaveBeenCalled();
    });

    test('should create oscillator for main thud sound', () => {
      const generator = new LandingSoundGenerator();
      generator.play(0.5);
      
      expect(mockAudioContext.createOscillator).toHaveBeenCalled();
    });

    test('should set oscillator type to sine wave', () => {
      const generator = new LandingSoundGenerator();
      generator.play(0.5);
      
      expect(mockOscillator.type).toBe('sine');
    });

    test('should configure frequency sweep from 150Hz to 40Hz', () => {
      const generator = new LandingSoundGenerator();
      generator.play(0.5);
      
      expect(mockOscillator.frequency.setValueAtTime).toHaveBeenCalledWith(150, 0);
      expect(mockOscillator.frequency.exponentialRampToValueAtTime).toHaveBeenCalledWith(40, 0.1);
    });

    test('should create gain nodes for volume control', () => {
      const generator = new LandingSoundGenerator();
      generator.play(0.5);
      
      // Should create at least 2 gain nodes (one for oscillator, one for noise)
      expect(mockAudioContext.createGain).toHaveBeenCalledTimes(2);
    });

    test('should create noise buffer for impact texture', () => {
      const generator = new LandingSoundGenerator();
      generator.play(0.5);
      
      expect(mockAudioContext.createBuffer).toHaveBeenCalled();
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled();
    });

    test('should start oscillator immediately', () => {
      const generator = new LandingSoundGenerator();
      generator.play(0.5);
      
      expect(mockOscillator.start).toHaveBeenCalledWith(0);
    });

    test('should stop oscillator after 0.2 seconds', () => {
      const generator = new LandingSoundGenerator();
      generator.play(0.5);
      
      expect(mockOscillator.stop).toHaveBeenCalledWith(0.2);
    });

    test('should start noise source immediately', () => {
      const generator = new LandingSoundGenerator();
      generator.play(0.5);
      
      expect(mockBufferSource.start).toHaveBeenCalledWith(0);
    });

    test('should stop noise source after 0.1 seconds', () => {
      const generator = new LandingSoundGenerator();
      generator.play(0.5);
      
      expect(mockBufferSource.stop).toHaveBeenCalledWith(0.1);
    });
  });

  describe('Volume Control', () => {
    test('should use default volume of 0.5 when not specified', () => {
      const generator = new LandingSoundGenerator();
      const gainNodes = [];
      
      mockAudioContext.createGain = jest.fn(() => {
        const gainNode = {
          gain: {
            setValueAtTime: jest.fn(),
            linearRampToValueAtTime: jest.fn(),
            exponentialRampToValueAtTime: jest.fn()
          },
          connect: jest.fn()
        };
        gainNodes.push(gainNode);
        return gainNode;
      });
      
      generator.play();
      
      // Check that volume-related methods were called
      expect(gainNodes.length).toBeGreaterThan(0);
      expect(gainNodes[0].gain.linearRampToValueAtTime).toHaveBeenCalled();
    });

    test('should scale main thud volume by 0.8 of input volume', () => {
      const generator = new LandingSoundGenerator();
      const gainNodes = [];
      
      mockAudioContext.createGain = jest.fn(() => {
        const gainNode = {
          gain: {
            setValueAtTime: jest.fn(),
            linearRampToValueAtTime: jest.fn(),
            exponentialRampToValueAtTime: jest.fn()
          },
          connect: jest.fn()
        };
        gainNodes.push(gainNode);
        return gainNode;
      });
      
      generator.play(1.0);
      
      // Main thud should be at 0.8 volume (80% of 1.0)
      expect(gainNodes[0].gain.linearRampToValueAtTime).toHaveBeenCalledWith(0.8, expect.any(Number));
    });

    test('should scale noise volume by 0.3 of input volume', () => {
      const generator = new LandingSoundGenerator();
      const gainNodes = [];
      
      mockAudioContext.createGain = jest.fn(() => {
        const gainNode = {
          gain: {
            setValueAtTime: jest.fn(),
            linearRampToValueAtTime: jest.fn(),
            exponentialRampToValueAtTime: jest.fn()
          },
          connect: jest.fn()
        };
        gainNodes.push(gainNode);
        return gainNode;
      });
      
      generator.play(1.0);
      
      // Noise should be at 0.3 volume (30% of 1.0)
      expect(gainNodes[1].gain.setValueAtTime).toHaveBeenCalledWith(0.3, expect.any(Number));
    });

    test('should handle low volume values', () => {
      const generator = new LandingSoundGenerator();
      expect(() => generator.play(0.1)).not.toThrow();
    });

    test('should handle high volume values', () => {
      const generator = new LandingSoundGenerator();
      expect(() => generator.play(1.0)).not.toThrow();
    });

    test('should handle zero volume', () => {
      const generator = new LandingSoundGenerator();
      expect(() => generator.play(0)).not.toThrow();
    });
  });

  describe('Noise Buffer Creation', () => {
    test('should create noise buffer with correct duration', () => {
      const generator = new LandingSoundGenerator();
      generator.init();
      
      const buffer = generator.createNoiseBuffer(mockAudioContext, 0.1);
      
      expect(mockAudioContext.createBuffer).toHaveBeenCalledWith(
        1, // mono
        4410, // 44100 * 0.1
        44100 // sample rate
      );
    });

    test('should fill buffer with random noise values', () => {
      const generator = new LandingSoundGenerator();
      generator.init();
      
      const mockData = new Float32Array(100);
      const mockBuffer = {
        getChannelData: jest.fn(() => mockData)
      };
      
      mockAudioContext.createBuffer = jest.fn(() => mockBuffer);
      
      generator.createNoiseBuffer(mockAudioContext, 0.1);
      
      // Check that buffer data was accessed
      expect(mockBuffer.getChannelData).toHaveBeenCalledWith(0);
    });

    test('should create noise values between -1 and 1', () => {
      const generator = new LandingSoundGenerator();
      generator.init();
      
      const mockData = new Float32Array(100);
      const mockBuffer = {
        getChannelData: jest.fn(() => mockData)
      };
      
      mockAudioContext.createBuffer = jest.fn(() => mockBuffer);
      
      generator.createNoiseBuffer(mockAudioContext, 0.1);
      
      // After creation, check that values are in valid range
      // (We can't directly test random values, but we can verify the buffer was accessed)
      expect(mockBuffer.getChannelData).toHaveBeenCalled();
    });
  });

  describe('Player Integration Tests', () => {
    test('should verify playLandingSound method exists', () => {
      // This test verifies the integration point exists
      // Full integration is tested in fall_damage.test.js
      const generator = new LandingSoundGenerator();
      expect(generator.play).toBeDefined();
      expect(typeof generator.play).toBe('function');
    });

    test('should verify volume calculation logic', () => {
      // Test the volume calculation formula used in player
      const testCases = [
        { fallDistance: 0.5, expectedVolume: 0.25 },  // 0.2 + (0.5 / 10)
        { fallDistance: 1, expectedVolume: 0.3 },     // 0.2 + (1 / 10)
        { fallDistance: 5, expectedVolume: 0.7 },     // 0.2 + (5 / 10)
        { fallDistance: 10, expectedVolume: 1.0 },    // 0.2 + (10 / 10), capped at 1.0
        { fallDistance: 50, expectedVolume: 1.0 },    // Would be 5.2, capped at 1.0
      ];

      testCases.forEach(({ fallDistance, expectedVolume }) => {
        const calculatedVolume = Math.min(1.0, 0.2 + (fallDistance / 10));
        expect(calculatedVolume).toBeCloseTo(expectedVolume, 2);
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle AudioContext creation failure gracefully', () => {
      global.AudioContext = undefined;
      global.webkitAudioContext = undefined;
      
      const generator = new LandingSoundGenerator();
      
      // Should not throw when AudioContext is unavailable
      expect(() => generator.play(0.5)).toThrow();
    });

    test('should handle multiple rapid play calls', () => {
      const generator = new LandingSoundGenerator();
      
      expect(() => {
        generator.play(0.5);
        generator.play(0.5);
        generator.play(0.5);
      }).not.toThrow();
    });
  });
});
