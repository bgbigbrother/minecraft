import { useState, useEffect, useCallback } from 'react';

/**
 * React hook for managing pointer lock state
 * Tracks pointer lock status and provides control functions
 * 
 * @returns {Object} Object with isLocked state and control functions
 * 
 * @example
 * function MenuOverlay() {
 *   const { isLocked, requestLock, exitLock } = usePointerLock();
 *   
 *   return (
 *     <div style={{ display: isLocked ? 'none' : 'block' }}>
 *       <button onClick={requestLock}>Start Game</button>
 *     </div>
 *   );
 * }
 */
function usePointerLock() {
  // Track pointer lock state
  const [isLocked, setIsLocked] = useState(false);

  /**
   * Check if pointer is currently locked
   */
  const checkLockState = useCallback(() => {
    const locked = document.pointerLockElement !== null;
    setIsLocked(locked);
    return locked;
  }, []);

  /**
   * Request pointer lock on the document body
   */
  const requestLock = useCallback(() => {
    const element = document.body;
    
    if (element.requestPointerLock) {
      element.requestPointerLock()
        .then(() => {
          // State will be updated by the pointerlockchange event
        })
        .catch((error) => {
          console.error('Failed to request pointer lock:', error);
        });
    } else {
      console.warn('Pointer Lock API is not supported in this browser');
    }
  }, []);

  /**
   * Exit pointer lock
   */
  const exitLock = useCallback(() => {
    if (document.exitPointerLock) {
      document.exitPointerLock();
      // State will be updated by the pointerlockchange event
    }
  }, []);

  /**
   * Handle pointer lock change events
   */
  useEffect(() => {
    const handlePointerLockChange = () => {
      checkLockState();
    };

    const handlePointerLockError = (error) => {
      console.error('Pointer lock error:', error);
      setIsLocked(false);
    };

    // Listen to pointer lock change events
    document.addEventListener('pointerlockchange', handlePointerLockChange);
    document.addEventListener('pointerlockerror', handlePointerLockError);

    // Check initial state
    checkLockState();

    // Cleanup listeners on unmount
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange);
      document.removeEventListener('pointerlockerror', handlePointerLockError);
    };
  }, [checkLockState]);

  return {
    isLocked,
    requestLock,
    exitLock
  };
}

export default usePointerLock;
