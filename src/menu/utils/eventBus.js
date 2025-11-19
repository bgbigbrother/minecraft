/**
 * EventBus - A publish-subscribe messaging system for decoupled communication
 * between the game engine and UI components.
 * 
 * Event naming convention: namespace:system:action:detail
 * Examples:
 *   - menu:game:start:newGame
 *   - menu:pointerlock:change:state
 *   - game:world:save:complete
 */
class EventBus {
  constructor() {
    // Use Map for efficient listener storage and retrieval
    this.listeners = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} eventName - The event to listen for
   * @param {Function} callback - Function to call when event is emitted
   * @returns {Function} Unsubscribe function for convenience
   */
  on(eventName, callback) {
    if (typeof eventName !== 'string') {
      throw new TypeError('Event name must be a string');
    }
    if (typeof callback !== 'function') {
      throw new TypeError('Callback must be a function');
    }

    // Get or create listener array for this event
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, []);
    }

    const callbacks = this.listeners.get(eventName);
    callbacks.push(callback);

    // Return unsubscribe function for convenience
    return () => this.off(eventName, callback);
  }

  /**
   * Unsubscribe from an event
   * @param {string} eventName - The event to stop listening to
   * @param {Function} callback - The callback to remove
   */
  off(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      return;
    }

    const callbacks = this.listeners.get(eventName);
    const index = callbacks.indexOf(callback);
    
    if (index !== -1) {
      callbacks.splice(index, 1);
    }

    // Clean up empty listener arrays
    if (callbacks.length === 0) {
      this.listeners.delete(eventName);
    }
  }

  /**
   * Emit an event with optional payload
   * @param {string} eventName - The event to emit
   * @param {*} payload - Optional data to pass to listeners
   */
  emit(eventName, payload) {
    if (!this.listeners.has(eventName)) {
      return;
    }

    const callbacks = this.listeners.get(eventName);
    
    // Create a copy of callbacks array to avoid issues if listeners modify the array
    const callbacksCopy = [...callbacks];

    // Execute each listener with error handling
    callbacksCopy.forEach((callback) => {
      try {
        callback(payload);
      } catch (error) {
        // Log error but continue executing other listeners
        console.error(
          `Error in event listener for "${eventName}":`,
          error,
          '\nPayload:',
          payload
        );
        
        // Emit error event for monitoring (avoid infinite loop by checking event name)
        if (eventName !== 'error:eventbus:listener:failed') {
          this.emit('error:eventbus:listener:failed', {
            eventName,
            error,
            payload
          });
        }
      }
    });
  }

  /**
   * Clear all listeners (useful for cleanup/testing)
   * @param {string} [eventName] - Optional: clear only listeners for specific event
   */
  clear(eventName) {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get the number of listeners for an event (useful for debugging)
   * @param {string} eventName - The event to check
   * @returns {number} Number of listeners
   */
  listenerCount(eventName) {
    return this.listeners.has(eventName) ? this.listeners.get(eventName).length : 0;
  }

  /**
   * Get all registered event names (useful for debugging)
   * @returns {string[]} Array of event names
   */
  eventNames() {
    return Array.from(this.listeners.keys());
  }
}

// Export singleton instance for use across application
const eventBus = new EventBus();

export default eventBus;
export { EventBus };
