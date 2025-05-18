// src/store/core.ts
import {
  GlobalListener,
  Listener,
  PartialState,
  State,
  StoreCore,
} from "../types/store.types";
import { isEqual } from "../utils/comparison";
import { Notifier, createNotifier } from "./notifier";
import {
  StoreLogger,
  StateUpdateError,
  SubscriptionError,
  getErrorMessage,
} from "../utils/logger";

/**
 * Creates the core store functionality
 *
 * @param {object|function} initialState - Initial state or function returning initial state
 * @returns {object} Core store methods (getState, setState, subscribe, destroy)
 */
export const createStoreCore = <T extends State>(
  initialState: T | (() => T)
): [T, StoreCore<T>, Notifier<T>] => {
  // Initialize state
  let state: T =
    typeof initialState === "function"
      ? (initialState as () => T)()
      : initialState;

  // Create notification system
  const notifier: Notifier<T> = createNotifier<T>(state);

  // Core store implementation
  const storeCore: StoreCore<T> = {
    /**
     * Gets current state or value of a specific key
     *
     * @param {string} [key] - Optional key to get specific state value
     * @returns {*} Current state or value of the specified key
     */
    getState: (key?: string): any => {
      try {
        if (key) {
          const value = state[key];
          StoreLogger.log("getState", { key, value });
          return value;
        }
        StoreLogger.log("getState", state);
        return state;
      } catch (error) {
        StoreLogger.error("Failed to get state", { key, error });
        throw error;
      }
    },

    /**
     * Updates state with partial state object or update function
     *
     * @param {object|function} partial - Partial state or function returning partial state
     */
    setState: (partial: PartialState<T>): void => {
      try {
        if (partial === null || partial === undefined) {
          StoreLogger.warn("setState called with null/undefined value");
          return;
        }

        const nextPartialState: Partial<T> =
          typeof partial === "function"
            ? (partial as Function)(state)
            : partial;

        if (!nextPartialState || typeof nextPartialState !== "object") {
          throw new StateUpdateError(
            "setState must receive an object or function returning an object"
          );
        }

        // Track which keys changed
        const changedKeys: string[] = [];
        const oldState = { ...state };

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
          StoreLogger.log("setState", {
            changedKeys,
            oldValues: changedKeys.reduce(
              (acc, key) => ({ ...acc, [key]: oldState[key] }),
              {}
            ),
            newValues: changedKeys.reduce(
              (acc, key) => ({ ...acc, [key]: state[key] }),
              {}
            ),
          });
          notifier.notify(changedKeys, state);
        } else {
          StoreLogger.log("setState (no changes)", {
            attempted: nextPartialState,
          });
        }
      } catch (error) {
        StoreLogger.error("Failed to set state", { partial, error });
        if (error instanceof StateUpdateError) {
          throw error;
        }
        throw new StateUpdateError(
          `setState failed: ${getErrorMessage(error)}`,
          partial
        );
      }
    },

    /**
     * Subscribes to state changes
     * Two overloads:
     * 1. subscribe(listener) - for global state changes
     * 2. subscribe(key, listener) - for specific key changes
     */
    subscribe: function (
      keyOrListener: string | GlobalListener<T>,
      listener?: Listener
    ): () => void {
      try {
        // Overload 1: subscribe(listener) - Global listener
        if (typeof keyOrListener === "function" && arguments.length === 1) {
          StoreLogger.log("subscribe (global)");
          return notifier.addGlobalListener(keyOrListener as GlobalListener<T>);
        }

        // Overload 2: subscribe(key, listener) - Key-specific listener
        if (typeof keyOrListener === "string" && listener) {
          StoreLogger.log("subscribe (key)", { key: keyOrListener });
          return notifier.addKeyListener(keyOrListener, listener);
        }

        throw new SubscriptionError(
          "Invalid subscribe call. Use either subscribe(listener) or subscribe(key, listener)"
        );
      } catch (error) {
        StoreLogger.error("Failed to subscribe", {
          keyOrListener,
          listener,
          error,
        });
        if (error instanceof SubscriptionError) {
          throw error;
        }
        throw new SubscriptionError(
          `Subscription failed: ${getErrorMessage(error)}`
        );
      }
    } as StoreCore<T>["subscribe"],

    /**
     * Destroys the store and cleans up all subscriptions
     */
    destroy: (): void => {
      try {
        StoreLogger.log("destroy");
        notifier.clearAllListeners();
      } catch (error) {
        StoreLogger.error("Failed to destroy store", error);
        throw error;
      }
    },

    /**
     * Get debugging information about listeners (development only)
     */
    getListenersInfo: (): {
      keyListeners: Record<string, number>;
      globalListeners: number;
    } => {
      return notifier.getListenersInfo();
    },
  };

  return [state, storeCore, notifier];
};
