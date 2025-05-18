// src/store/core.ts
import {
  GlobalListener,
  Listener,
  PartialState,
  State,
  StoreCore,
} from '../types/store.types';
import { isEqual } from '../utils/comparison';
import { Notifier, createNotifier } from './notifier';

/**
 * Creates the core store functionality
 *
 * @param {object|function} initialState - Initial state or function returning initial state
 * @returns {object} Core store methods (getState, setState, subscribe, destroy)
 */
export const createStoreCore = <T extends State>(
  initialState: T | (() => T),
): [T, StoreCore<T>, Notifier] => {
  // Initialize state
  let state: T =
    typeof initialState === 'function'
      ? (initialState as () => T)()
      : initialState;

  // Create notification system
  const notifier = createNotifier<T>(state);

  // Core store implementation
  const storeCore: StoreCore<T> = {
    /**
     * Gets current state or value of a specific key
     *
     * @param {string} [key] - Optional key to get specific state value
     * @returns {*} Current state or value of the specified key
     */
    getState: (key?: string): any => {
      if (key) return state[key];
      return state;
    },

    /**
     * Updates state with partial state object or update function
     *
     * @param {object|function} partial - Partial state or function returning partial state
     */
    setState: (partial: PartialState<T>): void => {
      const nextPartialState: Partial<T> =
        typeof partial === 'function' ? (partial as Function)(state) : partial;

      // Track which keys changed
      const changedKeys: string[] = [];

      // Update state and track changes
      Object.keys(nextPartialState).forEach((key) => {
        // Only update if value actually changed
        if (!isEqual(state[key], nextPartialState[key])) {
          state = {
            ...state,
            [key]: nextPartialState[key],
          } as T;
          changedKeys.push(key);
        }
      });

      // Only notify if something changed
      if (changedKeys.length > 0) {
        notifier.notify(changedKeys, state);
      }
    },

    /**
     * Subscribes to state changes
     *
     * @param {string|function} key - State key to subscribe to, or listener function for global changes
     * @param {function} [listener] - Callback function for key-specific subscription
     * @returns {function} Unsubscribe function
     */
    subscribe: ((
      key: string | GlobalListener,
      listener?: Listener,
    ): (() => void) => {
      // If key is a function and no listener provided, it's a global listener
      if (typeof key === 'function' && !listener) {
        return notifier.addGlobalListener(key as GlobalListener);
      }

      // Key-specific listener
      return notifier.addKeyListener(key as string, listener as Listener);
    }) as StoreCore<T>['subscribe'],

    /**
     * Destroys the store and cleans up all subscriptions
     */
    destroy: (): void => {
      notifier.clearAllListeners();
    },
  };

  return [state, storeCore, notifier];
};
