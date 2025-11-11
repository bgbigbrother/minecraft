import { describe, test, expect, jest, beforeEach } from '@jest/globals';

// Mock ToolLoader
jest.mock('../scripts/player/tool_loader.js', () => ({
  ToolLoader: jest.fn().mockImplementation((callback) => {
    callback({ pickaxe: { name: 'MockPickaxe' } });
  })
}));

describe('ToolControllsPlayerBase', () => {
  beforeEach(() => {
    // Reset modules to ensure clean state
    jest.resetModules();
  });

  test('should create tool player instance', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    expect(player).toBeDefined();
    expect(player.tool).toBeDefined();
  });

  test('should have tool container', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    expect(player.tool.container).toBeDefined();
  });

  test('should set tool correctly', async () => {
    const { ToolControllsPlayerBase } = await import('../scripts/player/tool.js');
    const player = new ToolControllsPlayerBase();
    
    const mockTool = {
      position: { set: jest.fn() },
      scale: { set: jest.fn() },
      rotation: { z: 0, y: 0 }
    };
    
    player.setTool(mockTool);
    
    expect(player.tool.container.children.length).toBeGreaterThan(0);
  });
});
