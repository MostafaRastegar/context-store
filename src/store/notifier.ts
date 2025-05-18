// src/store/notifier.ts
import {
  GlobalListener,
  Listener,
  ListenersMap,
  State,
} from "../types/store.types";

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

  // Global listeners that respond to any state change (typed for specific state T)
  const globalListeners: Set<GlobalListener<T>> = new Set();

  /**
   * Notifies relevant listeners about changed keys
   *
   * @param {Array} changedKeys - Array of keys that changed
   * @param {T} currentState - Current state to pass to listeners
   */
  const notify = (changedKeys: string[], currentState: T): void => {
    // Notify key-specific listeners
    changedKeys.forEach((key) => {
      // Ensure listener set exists for this key (handles dynamically added keys)
      if (!listenersMap[key]) {
        listenersMap[key] = new Set<Listener>();
      }

      listenersMap[key].forEach((listener) =>
        listener(currentState[key], currentState)
      );
    });

    // Notify global listeners only if there were actual changes
    if (changedKeys.length > 0) {
      globalListeners.forEach((listener) => listener(currentState));
    }
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
    return () => {
      listenersMap[key]?.delete(listener);
      // Clean up empty listener sets to prevent memory leaks
      if (listenersMap[key]?.size === 0) {
        delete listenersMap[key];
      }
    };
  };

  /**
   * Adds a global listener for any state change
   *
   * @param {Function} listener - Callback function
   * @returns {Function} Unsubscribe function
   */
  const addGlobalListener = (listener: GlobalListener<T>): (() => void) => {
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
    // Clear the entire listeners map
    Object.keys(listenersMap).forEach((key) => delete listenersMap[key]);
  };

  /**
   * Get debugging information about current listeners
   */
  const getListenersInfo = () => ({
    keyListeners: Object.keys(listenersMap).reduce((acc, key) => {
      acc[key] = listenersMap[key].size;
      return acc;
    }, {} as Record<string, number>),
    globalListeners: globalListeners.size,
  });

  return {
    notify,
    addKeyListener,
    addGlobalListener,
    clearAllListeners,
    getListenersInfo, // For debugging
  };
};

export type Notifier<T extends State> = ReturnType<typeof createNotifier<T>>;
