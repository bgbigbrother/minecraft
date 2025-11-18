# Player Controls System

This directory contains the refactored player controls system, organized into specialized input handlers for better maintainability and extensibility.

## Architecture

The controls system is organized into the following components:

- **index.js** - Main `ControllsPlayerBase` class that coordinates all input handlers
- **KeyboardHandler.js** - Handles all keyboard input (WASD, number keys, special actions)
- **MouseHandler.js** - Handles mouse clicks and wheel scrolling
- **PointerLockHandler.js** - Manages pointer lock state and UI transitions
- **BlockInteractionHandler.js** - Handles block placement and interaction logic

## Debug Mode

The controls system includes a debug flag that logs detailed information about all input events to the console. This is useful for troubleshooting input handling issues and understanding control system behavior.

### Enabling Debug Mode

**Option 1: Constructor Parameter** (recommended for development)
```javascript
const player = new Player(scene, world, { debugControls: true });
```

**Option 2: Runtime Toggle**
```javascript
player.setDebugMode(true);  // Enable debug logging
player.setDebugMode(false); // Disable debug logging
```

**Option 3: Browser Console**
```javascript
// Access global player instance and enable debug mode
window.player.setDebugMode(true);
```

### Debug Log Format

All debug logs follow a consistent format:
```
[HandlerName] Action: Details at Timestamp
  → Key: Value
  → Key: Value
```

### What Gets Logged

When debug mode is enabled, the following information is logged:

**KeyboardHandler:**
- Key pressed/released with key code and key name
- Movement state changes (input.x, input.z, input.y)
- Sprint mode activation/deactivation
- Toolbar slot selection changes
- Special action triggers (jump, throw, respawn, debug camera toggle)

**MouseHandler:**
- Mouse button clicks with button number and pointer lock state
- Selected coordinates and active block ID
- Action taken (break block, place block, interact with chest)
- Mouse wheel scroll direction and slot changes
- Tool animation triggers

**PointerLockHandler:**
- Pointer lock state changes
- Overlay visibility changes
- Debug camera mode state

### Example Debug Output

```
[KeyboardHandler] KeyDown: w (KeyW) at 1234567890
  → Key code: KeyW
  → Key name: w
  → Repeat: false
[KeyboardHandler] Movement state change at 1234567891
  → input.x: 0
  → input.z: 5
  → input.y: 0
[KeyboardHandler] Sprint mode at 1234567892
  → Status: ACTIVATED
  → Time since last press: 250ms
  → Double-tap window: 300ms

[MouseHandler] LeftClick (button 0) at 1234567900
  → Button number: 0
  → Pointer locked: true
[MouseHandler] Click details at 1234567901
  → Selected coords: {x: 10, y: 5, z: -3}
  → Active block ID: 0
[MouseHandler] Action taken at 1234567902
  → Action: BREAK BLOCK
  → Block type: Pickaxe (empty)
  → Coordinates: {x: 10, y: 5, z: -3}
[MouseHandler] Tool animation at 1234567903
  → Status: TRIGGERED
  → Animation start: 1234567903

[PointerLockHandler] Lock at 1234567910
  → Pointer locked: true
  → Overlay hidden: true
```

## Performance Considerations

Debug logging is designed to have minimal performance impact:
- Logs are only generated when `debugControls` flag is `true`
- Early return in `logDebug()` methods when flag is `false`
- No string concatenation or object creation when disabled
- Console.log calls are only made when necessary

## Usage in Development

To use debug mode during development:

1. Enable debug mode when creating the player or at runtime
2. Open the browser console (F12)
3. Interact with the game (move, click, scroll, etc.)
4. Review the detailed logs to understand what's happening
5. Disable debug mode when done to reduce console noise

Debug mode is particularly useful for:
- Troubleshooting input handling issues
- Verifying control system behavior
- Understanding event flow and timing
- Debugging integration issues with other systems
