// src/store/index.ts
import { createUseStore } from "./src/hooks/useStore";
import { createUseStoreKey } from "./src/hooks/useStoreKey";
import { createUseStoreKeys } from "./src/hooks/useStoreKeys";
import { createStoreCore } from "./src/store/core";
import { State, StoreAPI } from "./src/types/store.types";

/**
 * Creates a store with the given initial state
 *
 * @param {object|function} initialState - The initial state object or function that returns the initial state
 * @returns {object} Store object with methods and hooks to access and update state
 */
const createStore = <T extends State>(
  initialState: T | (() => T)
): StoreAPI<T> => {
  // Create core store functionality
  // We only need state and storeCore, notifier is handled internally
  const [state, storeCore] = createStoreCore<T>(initialState);

  // Create hooks
  const useStore = createUseStore<T>(storeCore);
  const useStoreKey = createUseStoreKey<T>(storeCore);
  const useStoreKeys = createUseStoreKeys<T>(storeCore);

  // Return complete API
  return {
    ...storeCore,
    useStore,
    useStoreKey,
    useStoreKeys,
  };
};

export default createStore;
