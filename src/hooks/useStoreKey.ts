// src/store/hooks/useStoreKey.ts
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Listener,
  SetStateAction,
  State,
  StoreCore,
} from "../types/store.types";

/**
 * Creates a hook to use a specific key from the store
 * Component will only re-render when this key changes
 *
 * @param {StoreCore<T>} storeCore - Core store methods
 * @returns {Function} useStoreKey hook
 */
export const createUseStoreKey = <T extends State>(storeCore: StoreCore<T>) => {
  return <K extends keyof T>(
    key: K
  ): [T[K], (newValue: SetStateAction<T[K]>) => void] => {
    // For accessing a specific key
    const [value, setValue] = useState<T[K]>(storeCore.getState(key as string));
    const mounted = useRef<boolean>(false);

    // Initialize mounted ref
    useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
      };
    }, []);

    useEffect(() => {
      // Subscribe to changes for this specific key
      const updateState = (newValue: T[K]) => {
        if (mounted.current) {
          setValue(newValue);
        }
      };

      // Initial value
      setValue(storeCore.getState(key as string));

      // Subscribe to this key's changes only
      const unsubscribe = storeCore.subscribe(
        key as string,
        updateState as Listener
      );
      return unsubscribe;
    }, [key]);

    // Provide a convenient setter for just this key
    const setKeyValue = useCallback(
      (newValue: SetStateAction<T[K]>) => {
        storeCore.setState({
          [key]:
            typeof newValue === "function"
              ? (newValue as Function)(storeCore.getState(key as string))
              : newValue,
        } as Partial<T>);
      },
      [key]
    );

    return [value, setKeyValue];
  };
};
