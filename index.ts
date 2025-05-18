// src/store/index.ts
import { createUseStore } from './hooks/useStore';
import { createUseStoreKey } from './hooks/useStoreKey';
import { createUseStoreKeys } from './hooks/useStoreKeys';
import { createStoreCore } from './store/core';
import { State, StoreAPI } from './types/store.types';

/**
 * Creates a store with the given initial state
 *
 * @param {object|function} initialState - The initial state object or function that returns the initial state
 * @returns {object} Store object with methods and hooks to access and update state
 */
const createStore = <T extends State>(
  initialState: T | (() => T),
): StoreAPI<T> => {
  // Create core store functionality
  const [state, storeCore] = createStoreCore<T>(initialState);

  // Create hooks
  const useStore = createUseStore<T>(state, storeCore);
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
