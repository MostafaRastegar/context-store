// src/store/hooks/useStoreKeys.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { Listener, State, StoreCore } from '../../types/store.types';

/**
 * Creates a hook to use multiple specific keys from the store
 * Component will only re-render when any of these keys change
 *
 * @param {StoreCore<T>} storeCore - Core store methods
 * @returns {Function} useStoreKeys hook
 */
export const createUseStoreKeys = <T extends State>(
  storeCore: StoreCore<T>,
) => {
  return <K extends keyof T>(
    keys: K[],
  ): [
    Pick<T, K>,
    (
      updates:
        | Partial<Pick<T, K>>
        | ((values: Pick<T, K>) => Partial<Pick<T, K>>),
    ) => void,
  ] => {
    // For accessing multiple specific keys
    const [values, setValues] = useState<Pick<T, K>>(
      keys.reduce(
        (acc, key) => ({ ...acc, [key]: storeCore.getState(key as string) }),
        {} as Pick<T, K>,
      ),
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
      const currentValues = { ...values };

      // Function to update just the changed key
      const createKeyListener = (k: K) => (newValue: T[K]) => {
        if (mounted.current) {
          setValues((prev) => ({ ...prev, [k]: newValue }) as Pick<T, K>);
        }
      };

      // Subscribe to each key
      keys.forEach((k) => {
        // Update initial value
        (currentValues as any)[k] = storeCore.getState(k as string);

        // Subscribe to changes
        const unsubscribe = storeCore.subscribe(
          k as string,
          createKeyListener(k) as Listener,
        );
        unsubscribes.push(unsubscribe);
      });

      // Set initial values
      setValues(currentValues);

      // Cleanup subscriptions
      return () => {
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      };
    }, [keys.join(',')]); // Re-run if keys array changes

    // Create a setter function that only updates the keys in this hook
    const setKeyValues = useCallback(
      (
        updates:
          | Partial<Pick<T, K>>
          | ((values: Pick<T, K>) => Partial<Pick<T, K>>),
      ) => {
        const allowedUpdates: Partial<T> = {};

        // Handle function updater pattern
        if (typeof updates === 'function') {
          const funcResult = (updates as Function)(values);
          Object.keys(funcResult).forEach((key) => {
            if (keys.includes(key as K)) {
              allowedUpdates[key] = funcResult[key];
            }
          });
        } else {
          // Handle object updates
          Object.keys(updates).forEach((key) => {
            if (keys.includes(key as K)) {
              allowedUpdates[key] = (updates as Record<string, any>)[key];
            }
          });
        }

        if (Object.keys(allowedUpdates).length > 0) {
          storeCore.setState(allowedUpdates);
        }
      },
      [keys.join(','), values],
    );

    return [values, setKeyValues];
  };
};
