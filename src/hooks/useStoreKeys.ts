// src/store/hooks/useStoreKeys.ts
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Listener, State, StoreCore } from "../types/store.types";

/**
 * Creates a hook to use multiple specific keys from the store
 * Component will only re-render when any of these keys change
 *
 * @param {StoreCore<T>} storeCore - Core store methods
 * @returns {Function} useStoreKeys hook
 */
export const createUseStoreKeys = <T extends State>(
  storeCore: StoreCore<T>
) => {
  return <K extends keyof T>(
    keys: K[]
  ): [
    Pick<T, K>,
    (
      updates:
        | Partial<Pick<T, K>>
        | ((values: Pick<T, K>) => Partial<Pick<T, K>>)
    ) => void
  ] => {
    // Memoize keys array to prevent unnecessary re-subscriptions
    const memoizedKeys = useMemo(() => [...keys].sort(), [keys.join(",")]);

    // For accessing multiple specific keys
    const [values, setValues] = useState<Pick<T, K>>(() =>
      memoizedKeys.reduce(
        (acc, key) => ({ ...acc, [key]: storeCore.getState(key as string) }),
        {} as Pick<T, K>
      )
    );
    const mounted = useRef<boolean>(false);

    // Initialize mounted ref
    useEffect(() => {
      mounted.current = true;
      return () => {
        mounted.current = false;
      };
    }, []);

    useEffect(() => {
      // Keep track of which keys we've subscribed to
      const unsubscribes: Array<() => void> = [];

      // Function to update just the changed key
      const createKeyListener = (k: K) => (newValue: T[K]) => {
        if (mounted.current) {
          setValues((prev) => ({ ...prev, [k]: newValue } as Pick<T, K>));
        }
      };

      // Initialize with current values
      const initialValues = memoizedKeys.reduce(
        (acc, k) => ({
          ...acc,
          [k]: storeCore.getState(k as string),
        }),
        {} as Pick<T, K>
      );
      setValues(initialValues);

      // Subscribe to each key
      memoizedKeys.forEach((k) => {
        const unsubscribe = storeCore.subscribe(
          k as string,
          createKeyListener(k) as Listener
        );
        unsubscribes.push(unsubscribe);
      });

      // Cleanup subscriptions
      return () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      };
    }, [memoizedKeys.join(",")]); // Use memoized keys

    // Create a setter function that only updates the keys in this hook
    const setKeyValues = useCallback(
      (
        updates:
          | Partial<Pick<T, K>>
          | ((values: Pick<T, K>) => Partial<Pick<T, K>>)
      ) => {
        // Use Record<string, any> for dynamic assignment
        const allowedUpdates: Record<string, any> = {};

        // Handle function updater pattern
        if (typeof updates === "function") {
          const funcResult = updates(values);
          Object.keys(funcResult).forEach((key) => {
            if (memoizedKeys.includes(key as K)) {
              allowedUpdates[key] = funcResult[key as keyof typeof funcResult];
            }
          });
        } else {
          // Handle object updates
          Object.keys(updates).forEach((key) => {
            if (memoizedKeys.includes(key as K)) {
              allowedUpdates[key] = updates[key as keyof typeof updates];
            }
          });
        }

        // Only call setState if we have valid updates
        if (Object.keys(allowedUpdates).length > 0) {
          // Cast to Partial<T> when passing to storeCore
          storeCore.setState(allowedUpdates as Partial<T>);
        }
      },
      [memoizedKeys.join(","), values]
    );

    return [values, setKeyValues];
  };
};
