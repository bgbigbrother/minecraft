import { describe, test, expect, jest, beforeEach } from '@jest/globals';
import { DayNightCycle } from '../scripts/core/day_night_cycle.js';

// Mock the moon module
jest.mock('../scripts/core/moon', () => ({
  updateMoonPosition: jest.fn()
}));

describe('DayNightCycle', () => {
  let mockScene;
  let mockSun;
  let mockSunMesh;
  let mockMoonMesh;
  let mockAmbientLight;
  let mockWorld;
  let dayNightCycle;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Create mock Three.js objects
    mockScene = {
      background: {
        setHex: jest.fn()
      },
      fog: {
        color: {
          setHex: jest.fn()
        }
      }
    };

    mockSun = {
      position: {
        set: jest.fn(),
        x: 0,
        y: 0,
        z: 0
      },
      intensity: 1.0,
      color: {
        setHex: jest.fn()
      }
    };

    mockSunMesh = {
      position: {
        set: jest.fn(),
        x: 0,
        y: 0,
        z: 0
      },
      visible: true
    };

    mockMoonMesh = {
      position: {
        set: jest.fn(),
        x: 0,
        y: 0,
        z: 0
      },
      visible: false
    };

    mockAmbientLight = {
      intensity: 0.5,
      color: {
        setHex: jest.fn()
      }
    };

    // Create mock world with chunks containing clouds
    mockWorld = {
      children: [
        {
          children: [
            {
              type: 'Group',
              children: [
                {
                  material: {
                    color: {
                      setHex: jest.fn()
                    }
                  }
                }
              ]
            }
          ]
        }
      ]
    };
  });

  describe('Constructor', () => {
    test('should create instance with required parameters', () => {
      dayNightCycle = new DayNightCycle(
        mockScene,
        mockSun,
        mockSunMesh,
        mockMoonMesh,
        mockAmbientLight,
        mockWorld
      );

      expect(dayNightCycle).toBeDefined();
      expect(dayNightCycle.scene).toBe(mockScene);
      expect(dayNightCycle.sun).toBe(mockSun);
      expect(dayNightCycle.sunMesh).toBe(mockSunMesh);
      expect(dayNightCycle.moonMesh).toBe(mockMoonMesh);
      expect(dayNightCycle.ambientLight).toBe(mockAmbientLight);
      expect(dayNightCycle.world).toBe(mockWorld);
    });

    test('should initialize with default options', () => {
      dayNightCycle = new DayNightCycle(
        mockScene,
        mockSun,
        mockSunMesh,
        mockMoonMesh,
        mockAmbientLight,
        mockWorld
      );

      expect(dayNightCycle.currentTime).toBe(0);
      expect(dayNightCycle.speed).toBe(1.0);
      expect(dayNightCycle.isDay).toBe(true);
      expect(dayNightCycle.phase).toBe('sunrise');
    });

    test('should initialize with custom startTime', () => {
      dayNightCycle = new DayNightCycle(
        mockScene,
        mockSun,
        mockSunMesh,
        mockMoonMesh,
        mockAmbientLight,
        mockWorld,
        { startTime: 6000 }
      );

      expect(dayNightCycle.currentTime).toBe(6000);
      expect(dayNightCycle.isDay).toBe(true);
      expect(dayNightCycle.phase).toBe('day');
    });

    test('should initialize with custom speed', () => {
      dayNightCycle = new DayNightCycle(
        mockScene,
        mockSun,
        mockSunMesh,
        mockMoonMesh,
        mockAmbientLight,
        mockWorld,
        { speed: 50.0 }
      );

      expect(dayNightCycle.speed).toBe(50.0);
    });

    test('should throw error if scene is missing', () => {
      expect(() => {
        new DayNightCycle(null, mockSun, mockSunMesh, mockMoonMesh, mockAmbientLight, mockWorld);
      }).toThrow('DayNightCycle: scene is required');
    });

    test('should throw error if sun is missing', () => {
      expect(() => {
        new DayNightCycle(mockScene, null, mockSunMesh, mockMoonMesh, mockAmbientLight, mockWorld);
      }).toThrow('DayNightCycle: sun (directional light) is required');
    });

    test('should throw error if sunMesh is missing', () => {
      expect(() => {
        new DayNightCycle(mockScene, mockSun, null, mockMoonMesh, mockAmbientLight, mockWorld);
      }).toThrow('DayNightCycle: sunMesh is required');
    });

    test('should throw error if moonMesh is missing', () => {
      expect(() => {
        new DayNightCycle(mockScene, mockSun, mockSunMesh, null, mockAmbientLight, mockWorld);
      }).toThrow('DayNightCycle: moonMesh is required');
    });

    test('should throw error if ambientLight is missing', () => {
      expect(() => {
        new DayNightCycle(mockScene, mockSun, mockSunMesh, mockMoonMesh, null, mockWorld);
      }).toThrow('DayNightCycle: ambientLight is required');
    });

    test('should throw error if world is missing', () => {
      expect(() => {
        new DayNightCycle(mockScene, mockSun, mockSunMesh, mockMoonMesh, mockAmbientLight, null);
      }).toThrow('DayNightCycle: world is required');
    });
  });

  describe('_calculatePhase', () => {
    beforeEach(() => {
      dayNightCycle = new DayNightCycle(
        mockScene,
        mockSun,
        mockSunMesh,
        mockMoonMesh,
        mockAmbientLight,
        mockWorld
      );
    });

    test('should return "sunrise" for time 0-4999', () => {
      expect(dayNightCycle._calculatePhase(0)).toBe('sunrise');
      expect(dayNightCycle._calculatePhase(2500)).toBe('sunrise');
      expect(dayNightCycle._calculatePhase(4999)).toBe('sunrise');
    });

    test('should return "day" for time 5000-10999', () => {
      expect(dayNightCycle._calculatePhase(5000)).toBe('day');
      expect(dayNightCycle._calculatePhase(8000)).toBe('day');
      expect(dayNightCycle._calculatePhase(10999)).toBe('day');
    });

    test('should return "sunset" for time 11000-12999', () => {
      expect(dayNightCycle._calculatePhase(11000)).toBe('sunset');
      expect(dayNightCycle._calculatePhase(12000)).toBe('sunset');
      expect(dayNightCycle._calculatePhase(12999)).toBe('sunset');
    });

    test('should return "night" for time 13000-22999', () => {
      expect(dayNightCycle._calculatePhase(13000)).toBe('night');
      expect(dayNightCycle._calculatePhase(18000)).toBe('night');
      expect(dayNightCycle._calculatePhase(22999)).toBe('night');
    });

    test('should return "sunrise" for time 23000-24000', () => {
      expect(dayNightCycle._calculatePhase(23000)).toBe('sunrise');
      expect(dayNightCycle._calculatePhase(23999)).toBe('sunrise');
    });
  });

  describe('getTime', () => {
    test('should return current time', () => {
      dayNightCycle = new DayNightCycle(
        mockScene,
        mockSun,
        mockSunMesh,
        mockMoonMesh,
        mockAmbientLight,
        mockWorld,
        { startTime: 12000 }
      );

      expect(dayNightCycle.getTime()).toBe(12000);
    });
  });

  describe('setTime', () => {
    beforeEach(() => {
      dayNightCycle = new DayNightCycle(
        mockScene,
        mockSun,
        mockSunMesh,
        mockMoonMesh,
        mockAmbientLight,
        mockWorld
      );
      jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    test('should set time to valid value', () => {
      dayNightCycle.setTime(6000);
      expect(dayNightCycle.currentTime).toBe(6000);
      expect(dayNightCycle.isDay).toBe(true);
      expect(dayNightCycle.phase).toBe('day');
    });

    test('should clamp negative time to 0 and warn', () => {
      dayNightCycle.setTime(-100);
      expect(dayNightCycle.currentTime).toBe(0);
      expect(console.warn).toHaveBeenCalledWith(
        'DayNightCycle: setTime() received negative value, clamping to 0'
      );
    });

    test('should clamp time > 24000 and warn', () => {
      dayNightCycle.setTime(30000);
      expect(dayNightCycle.currentTime).toBe(24000);
      expect(console.warn).toHaveBeenCalledWith(
        'DayNightCycle: setTime() received value > 24000, clamping to 24000'
      );
    });

    test('should update isDay flag when setting time to day', () => {
      dayNightCycle.setTime(18000); // Night
      expect(dayNightCycle.isDay).toBe(false);
      
      dayNightCycle.setTime(6000); // Day
      expect(dayNightCycle.isDay).toBe(true);
    });

    test('should update isDay flag when setting time to night', () => {
      dayNightCycle.setTime(6000); // Day
      expect(dayNightCycle.isDay).toBe(true);
      
      dayNightCycle.setTime(18000); // Night
      expect(dayNightCycle.isDay).toBe(false);
    });

    test('should update phase when setting time', () => {
      dayNightCycle.setTime(11500);
      expect(dayNightCycle.phase).toBe('sunset');
    });
  });

  describe('setSpeed', () => {
    test('should update speed', () => {
      dayNightCycle = new DayNightCycle(
        mockScene,
        mockSun,
        mockSunMesh,
        mockMoonMesh,
        mockAmbientLight,
        mockWorld
      );

      dayNightCycle.setSpeed(100.0);
      expect(dayNightCycle.speed).toBe(100.0);
    });
  });

  describe('_calculateCelestialPosition', () => {
    beforeEach(() => {
      dayNightCycle = new DayNightCycle(
        mockScene,
        mockSun,
        mockSunMesh,
        mockMoonMesh,
        mockAmbientLight,
        mockWorld
      );
    });

    test('should calculate position at time 0 (east horizon)', () => {
      const pos = dayNightCycle._calculateCelestialPosition(0, 100);
      expect(pos.x).toBeCloseTo(100, 1);
      expect(pos.y).toBeCloseTo(0, 1);
      expect(pos.z).toBe(0);
    });

    test('should calculate position at time 6000 (noon, highest point)', () => {
      const pos = dayNightCycle._calculateCelestialPosition(6000, 100);
      expect(pos.x).toBeCloseTo(0, 1);
      expect(pos.y).toBeCloseTo(100, 1);
      expect(pos.z).toBe(0);
    });

    test('should calculate position at time 12000 (west horizon)', () => {
      const pos = dayNightCycle._calculateCelestialPosition(12000, 100);
      expect(pos.x).toBeCloseTo(-100, 1);
      expect(pos.y).toBeCloseTo(0, 1);
      expect(pos.z).toBe(0);
    });

    test('should calculate position at time 18000 (midnight, lowest point)', () => {
      const pos = dayNightCycle._calculateCelestialPosition(18000, 100);
      expect(pos.x).toBeCloseTo(0, 1);
      expect(pos.y).toBeCloseTo(-100, 1);
      expect(pos.z).toBe(0);
    });

    test('should use specified radius', () => {
      const pos = dayNightCycle._calculateCelestialPosition(6000, 50);
      expect(pos.y).toBeCloseTo(50, 1);
    });
  });

  describe('_interpolateColor', () => {
    beforeEach(() => {
      dayNightCycle = new DayNightCycle(
        mockScene,
        mockSun,
        mockSunMesh,
        mockMoonMesh,
        mockAmbientLight,
        mockWorld
      );
    });

    test('should return first color when factor is 0', () => {
      const result = dayNightCycle._interpolateColor(0xff0000, 0x0000ff, 0);
      expect(result).toBe(0xff0000);
    });

    test('should return second color when factor is 1', () => {
      const result = dayNightCycle._interpolateColor(0xff0000, 0x0000ff, 1);
      expect(result).toBe(0x0000ff);
    });

    test('should interpolate between colors at factor 0.5', () => {
      const result = dayNightCycle._interpolateColor(0xff0000, 0x0000ff, 0.5);
      // Red (255,0,0) to Blue (0,0,255) at 0.5 should be (128,0,128)
      expect(result).toBe(0x800080);
    });

    test('should handle white to black interpolation', () => {
      const result = dayNightCycle._interpolateColor(0xffffff, 0x000000, 0.5);
      expect(result).toBe(0x808080);
    });
  });

  describe('update', () => {
    beforeEach(() => {
      dayNightCycle = new DayNightCycle(
        mockScene,
        mockSun,
        mockSunMesh,
        mockMoonMesh,
        mockAmbientLight,
        mockWorld,
        { startTime: 0, speed: 20.0 }
      );
    });

    test('should increment time based on deltaTime and speed', () => {
      const initialTime = dayNightCycle.currentTime;
      dayNightCycle.update(0.016); // ~60fps frame
      
      expect(dayNightCycle.currentTime).toBeGreaterThan(initialTime);
    });

    test('should wrap time when exceeding 24000', () => {
      dayNightCycle.setTime(23900);
      dayNightCycle.update(1.0); // Large delta to push over 24000
      
      expect(dayNightCycle.currentTime).toBeLessThan(24000);
      expect(dayNightCycle.currentTime).toBeGreaterThanOrEqual(0);
    });

    test('should update isDay flag during update', () => {
      dayNightCycle.setTime(11900);
      expect(dayNightCycle.isDay).toBe(true);
      
      dayNightCycle.update(0.1); // Push into night
      expect(dayNightCycle.isDay).toBe(false);
    });

    test('should update phase during update', () => {
      dayNightCycle.setTime(4900);
      expect(dayNightCycle.phase).toBe('sunrise');
      
      dayNightCycle.update(0.1); // Push into day
      expect(dayNightCycle.phase).toBe('day');
    });

    test('should call celestial body update methods', () => {
      dayNightCycle.update(0.016);
      
      expect(mockSunMesh.position.set).toHaveBeenCalled();
      expect(mockSun.position.set).toHaveBeenCalled();
    });

    test('should update sky colors', () => {
      dayNightCycle.update(0.016);
      
      expect(mockScene.background.setHex).toHaveBeenCalled();
      expect(mockScene.fog.color.setHex).toHaveBeenCalled();
    });

    test('should update lighting', () => {
      const initialIntensity = mockSun.intensity;
      dayNightCycle.update(0.016);
      
      // Intensity should be updated (may or may not change depending on time)
      expect(typeof mockSun.intensity).toBe('number');
      expect(typeof mockAmbientLight.intensity).toBe('number');
    });
  });

  describe('_updateCelestialBodies', () => {
    beforeEach(() => {
      dayNightCycle = new DayNightCycle(
        mockScene,
        mockSun,
        mockSunMesh,
        mockMoonMesh,
        mockAmbientLight,
        mockWorld
      );
    });

    test('should show sun and hide moon during day', () => {
      dayNightCycle.setTime(6000); // Noon
      dayNightCycle._updateCelestialBodies();
      
      expect(mockSunMesh.visible).toBe(true);
      expect(mockMoonMesh.visible).toBe(false);
    });

    test('should hide sun and show moon during night', () => {
      dayNightCycle.setTime(18000); // Midnight
      dayNightCycle._updateCelestialBodies();
      
      expect(mockSunMesh.visible).toBe(false);
      expect(mockMoonMesh.visible).toBe(true);
    });

    test('should update sun position', () => {
      dayNightCycle.setTime(6000);
      dayNightCycle._updateCelestialBodies();
      
      expect(mockSunMesh.position.set).toHaveBeenCalled();
      expect(mockSun.position.set).toHaveBeenCalled();
    });

    test('should call updateMoonPosition from moon module', async () => {
      const { updateMoonPosition } = await import('../scripts/core/moon');
      
      dayNightCycle._updateCelestialBodies();
      
      expect(updateMoonPosition).toHaveBeenCalledWith(mockSunMesh.position);
    });
  });

  describe('_updateLighting', () => {
    beforeEach(() => {
      dayNightCycle = new DayNightCycle(
        mockScene,
        mockSun,
        mockSunMesh,
        mockMoonMesh,
        mockAmbientLight,
        mockWorld
      );
    });

    test('should set higher intensity at noon', () => {
      dayNightCycle.setTime(6000); // Noon
      dayNightCycle._updateLighting();
      
      const noonIntensity = mockSun.intensity;
      
      dayNightCycle.setTime(18000); // Midnight
      dayNightCycle._updateLighting();
      
      const midnightIntensity = mockSun.intensity;
      
      expect(noonIntensity).toBeGreaterThan(midnightIntensity);
    });

    test('should set day color during daytime', () => {
      dayNightCycle.setTime(6000); // Noon
      dayNightCycle._updateLighting();
      
      expect(mockSun.color.setHex).toHaveBeenCalledWith(0xffffff);
    });

    test('should set night color during nighttime', () => {
      dayNightCycle.setTime(18000); // Midnight
      dayNightCycle._updateLighting();
      
      expect(mockSun.color.setHex).toHaveBeenCalledWith(0xaaaaff);
    });

    test('should update ambient light intensity', () => {
      dayNightCycle.setTime(6000);
      dayNightCycle._updateLighting();
      
      expect(mockAmbientLight.intensity).toBeGreaterThan(0);
      expect(mockAmbientLight.intensity).toBeLessThanOrEqual(0.5);
    });
  });

  describe('_updateSkyColors', () => {
    beforeEach(() => {
      dayNightCycle = new DayNightCycle(
        mockScene,
        mockSun,
        mockSunMesh,
        mockMoonMesh,
        mockAmbientLight,
        mockWorld
      );
    });

    test('should update scene background color', () => {
      dayNightCycle.setTime(6000);
      dayNightCycle._updateSkyColors();
      
      expect(mockScene.background.setHex).toHaveBeenCalledWith(expect.any(Number));
    });

    test('should update fog color', () => {
      dayNightCycle.setTime(6000);
      dayNightCycle._updateSkyColors();
      
      expect(mockScene.fog.color.setHex).toHaveBeenCalledWith(expect.any(Number));
    });

    test('should handle scene without background', () => {
      mockScene.background = null;
      
      expect(() => {
        dayNightCycle._updateSkyColors();
      }).not.toThrow();
    });

    test('should handle scene without fog', () => {
      mockScene.fog = null;
      
      expect(() => {
        dayNightCycle._updateSkyColors();
      }).not.toThrow();
    });

    test('should interpolate colors between keyframes', () => {
      // Set time between two keyframes
      dayNightCycle.setTime(5500); // Between 5000 and 6000
      dayNightCycle._updateSkyColors();
      
      const call = mockScene.background.setHex.mock.calls[0][0];
      
      // Color should be different from both keyframe colors
      expect(call).not.toBe(0xff6b35); // 5000 keyframe
      expect(call).not.toBe(0x80a0e0); // 6000 keyframe
    });
  });

  describe('Integration', () => {
    test('should complete full day/night cycle', () => {
      dayNightCycle = new DayNightCycle(
        mockScene,
        mockSun,
        mockSunMesh,
        mockMoonMesh,
        mockAmbientLight,
        mockWorld,
        { startTime: 0, speed: 100.0 }
      );

      // Simulate multiple frames to complete a cycle
      for (let i = 0; i < 100; i++) {
        dayNightCycle.update(0.1);
      }

      // Time should have wrapped around
      expect(dayNightCycle.currentTime).toBeLessThan(24000);
      expect(dayNightCycle.currentTime).toBeGreaterThanOrEqual(0);
    });

    test('should transition through all phases', () => {
      dayNightCycle = new DayNightCycle(
        mockScene,
        mockSun,
        mockSunMesh,
        mockMoonMesh,
        mockAmbientLight,
        mockWorld
      );

      const phases = new Set();
      
      // Sample phases at different times
      for (let time = 0; time < 24000; time += 1000) {
        dayNightCycle.setTime(time);
        phases.add(dayNightCycle.phase);
      }

      expect(phases.has('sunrise')).toBe(true);
      expect(phases.has('day')).toBe(true);
      expect(phases.has('sunset')).toBe(true);
      expect(phases.has('night')).toBe(true);
    });
  });
});
