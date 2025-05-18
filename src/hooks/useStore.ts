// src/store/hooks/useStore.ts
import { useCallback, useEffect, useRef, useState } from "react";
import { PartialState, State, StoreCore } from "../types/store.types";

/**
 * Hook to use the entire store
 * Component will re-render on any state change
 *
 * @param {StoreCore<T>} storeCore - Core store methods
 * @returns {Array} [state, setState] tuple
 */
export const createUseStore = <T extends State>(storeCore: StoreCore<T>) => {
  return (): [T, (partial: PartialState<T>) => void] => {
    // Fix: Get initial state from storeCore instead of parameter
    const [storeState, setStoreState] = useState<T>(() => storeCore.getState());
    const mounted = useRef<boolean>(false);

    // Initialize mounted ref
    useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
      };
    }, []);

    useEffect(() => {
      const updateState = (newState: T) => {
        if (mounted.current) {
          setStoreState(newState);
        }
      };

      // Set initial state (redundant now since we use lazy initial state)
      setStoreState(storeCore.getState() as T);

      // Subscribe to all changes (global listener)
      const unsubscribe = storeCore.subscribe(updateState);
      return unsubscribe;
    }, []);

    const setState = useCallback(storeCore.setState, []);

    return [storeState, setState];
  };
};
