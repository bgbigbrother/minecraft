import { useEffect, useCallback, useRef } from 'react';
import eventBus from '../utils/eventBus.js';

/**
 * React hook for interacting with the EventBus
 * Provides memoized functions and automatic cleanup on unmount
 * 
 * @returns {Object} Object with emit, on, and off functions
 * 
 * @example
 * function MyComponent() {
 *   const { emit, on, off } = useEventBus();
 *   
 *   useEffect(() => {
 *     const handleGameStart = (data) => {
 *       console.log('Game started:', data);
 *     };
 *     
 *     on('menu:game:start:newGame', handleGameStart);
 *     
 *     return () => off('menu:game:start:newGame', handleGameStart);
 *   }, [on, off]);
 *   
 *   const startGame = () => {
 *     emit('menu:game:start:newGame', { worldName: 'My World' });
 *   };
 *   
 *   return <button onClick={startGame}>Start Game</button>;
 * }
 */
function useEventBus() {
  // Track all subscriptions made by this component for automatic cleanup
  const subscriptionsRef = useRef([]);

  /**
   * Memoized emit function
   * Emits an event with optional payload
   */
  const emit = useCallback((eventName, payload) => {
    eventBus.emit(eventName, payload);
  }, []);

  /**
   * Memoized on function
   * Subscribes to an event and tracks the subscription for cleanup
   */
  const on = useCallback((eventName, callback) => {
    // Subscribe to the event
    const unsubscribe = eventBus.on(eventName, callback);
    
    // Track this subscription for automatic cleanup
    subscriptionsRef.current.push({ eventName, callback, unsubscribe });
    
    // Return the unsubscribe function
    return unsubscribe;
  }, []);

  /**
   * Memoized off function
   * Unsubscribes from an event and removes it from tracking
   */
  const off = useCallback((eventName, callback) => {
    eventBus.off(eventName, callback);
    
    // Remove from tracked subscriptions
    subscriptionsRef.current = subscriptionsRef.current.filter(
      (sub) => !(sub.eventName === eventName && sub.callback === callback)
    );
  }, []);

  /**
   * Cleanup effect - automatically unsubscribe from all events on unmount
   */
  useEffect(() => {
    return () => {
      // Unsubscribe from all tracked subscriptions
      subscriptionsRef.current.forEach(({ unsubscribe }) => {
        unsubscribe();
      });
      
      // Clear the subscriptions array
      subscriptionsRef.current = [];
    };
  }, []);

  return {
    emit,
    on,
    off
  };
}

export default useEventBus;
