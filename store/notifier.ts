// src/store/notifier.ts
import {
  GlobalListener,
  Listener,
  ListenersMap,
  State,
} from '../types/store.types';

/**
 * Creates a notification system for the store
 */
export const createNotifier = <T extends State>(state: T) => {
  // Create a map of listeners for each state key
  const listenersMap: ListenersMap = {};

  // Initialize listener maps for all keys in initial state
  Object.keys(state).forEach((key) => {
    listenersMap[key] = new Set<Listener>();
  });

  // Global listeners that respond to any state change
  const globalListeners: Set<GlobalListener> = new Set();

  /**
   * Notifies relevant listeners about changed keys
   *
   * @param {Array} changedKeys - Array of keys that changed
   * @param {T} currentState - Current state to pass to listeners
   */
  const notify = (changedKeys: string[], currentState: T): void => {
    // Notify key-specific listeners
    changedKeys.forEach((key) => {
      if (listenersMap[key]) {
        listenersMap[key].forEach((listener) =>
          listener(currentState[key], currentState),
        );
      }
    });

    // Notify global listeners
    globalListeners.forEach((listener) => listener(currentState));
  };

  /**
   * Adds a listener for a specific key
   *
   * @param {string} key - State key to listen to
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  const addKeyListener = (key: string, listener: Listener): (() => void) => {
    // Create listeners set for this key if it doesn't exist
    if (!listenersMap[key]) {
      listenersMap[key] = new Set();
    }

    listenersMap[key].add(listener);
    return () => listenersMap[key].delete(listener);
  };

  /**
   * Adds a global listener for any state change
   *
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  const addGlobalListener = (listener: GlobalListener): (() => void) => {
    globalListeners.add(listener);
    return () => globalListeners.delete(listener);
  };

  /**
   * Removes all listeners
   */
  const clearAllListeners = (): void => {
    Object.keys(listenersMap).forEach((key) => {
      listenersMap[key].clear();
    });
    globalListeners.clear();
  };

  return {
    notify,
    addKeyListener,
    addGlobalListener,
    clearAllListeners,
  };
};

export type Notifier = ReturnType<typeof createNotifier>;
