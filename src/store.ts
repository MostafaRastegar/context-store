import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import type {
  State,
  StoreAPI,
  PartialState,
  SetStateAction,
  Listener,
  GlobalListener,
} from "./types";
import { isEqual } from "./utils";

const createStore = <T extends State>(
  initialState: T | (() => T)
): StoreAPI<T> => {
  // Initialize state
  let state: T =
    typeof initialState === "function"
      ? (initialState as () => T)()
      : initialState;

  // Listeners storage - keep original structure
  const keyListeners = new Map<string, Set<Listener>>();
  const globalListeners = new Set<GlobalListener<T>>();

  // Keep original synchronous notify but optimize object creation
  const notify = (changedKeys: string[]) => {
    if (changedKeys.length === 0) return;

    // Notify key-specific listeners (synchronous)
    changedKeys.forEach((key) => {
      const listeners = keyListeners.get(key);
      if (listeners) {
        listeners.forEach((listener) => listener(state[key], state));
      }
    });

    // Notify global listeners (synchronous)
    globalListeners.forEach((listener) => listener(state));
  };

  // Get current state or specific key
  function getState(): T;
  function getState<K extends keyof T>(key: K): T[K];
  function getState<K extends keyof T>(key?: K) {
    return key === undefined ? state : state[key];
  }

  // Optimized setState with single object creation
  const setState = (partial: PartialState<T>) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!nextState || typeof nextState !== "object") return;

    const changedKeys: string[] = [];
    const updates: Record<string, any> = {};
    let hasChanges = false;

    // Collect all changes first to avoid multiple object creations
    Object.keys(nextState).forEach((key) => {
      if (!isEqual(state[key], nextState[key])) {
        updates[key] = nextState[key];
        changedKeys.push(key);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      // Single object creation instead of multiple spreads
      state = { ...state, ...updates } as T;
      notify(changedKeys);
    }
  };

  // Keep original subscribe signature
  const subscribe = ((
    keyOrListener: string | GlobalListener<T>,
    listener?: Listener
  ) => {
    if (typeof keyOrListener === "function") {
      // Global listener
      globalListeners.add(keyOrListener);
      return () => globalListeners.delete(keyOrListener);
    }

    // Key-specific listener
    const key = keyOrListener;
    if (!keyListeners.has(key)) {
      keyListeners.set(key, new Set());
    }
    keyListeners.get(key)!.add(listener!);

    return () => {
      const listeners = keyListeners.get(key);
      if (listeners) {
        listeners.delete(listener!);
        if (listeners.size === 0) {
          keyListeners.delete(key);
        }
      }
    };
  }) as StoreAPI<T>["subscribe"];

  // Hook to use entire store with memory optimization
  const useStore = (): [T, (partial: PartialState<T>) => void] => {
    const [localState, setLocalState] = useState<T>(() => getState());
    const mountedRef = useRef(true);

    useEffect(() => {
      setLocalState(getState());

      const unsubscribe = subscribe((newState: T) => {
        // Prevent setState on unmounted components
        if (mountedRef.current) {
          setLocalState(newState);
        }
      });

      return () => {
        mountedRef.current = false;
        unsubscribe();
      };
    }, []);

    // Track component mount status
    useEffect(() => {
      return () => {
        mountedRef.current = false;
      };
    }, []);

    return [localState, setState];
  };

  // Optimized useStoreKey with stable references
  const useStoreKey = <K extends keyof T>(
    key: K
  ): [T[K], (value: SetStateAction<T[K]>) => void] => {
    const [value, setValue] = useState<T[K]>(() => getState(key));
    const mountedRef = useRef(true);

    useEffect(() => {
      setValue(getState(key));

      const unsubscribe = subscribe(key as string, (newValue: T[K]) => {
        if (mountedRef.current) {
          setValue(newValue);
        }
      });

      return () => {
        unsubscribe();
      };
    }, [key]);

    // Optimized setter with better closure handling
    const setKeyValue = useCallback(
      (newValue: SetStateAction<T[K]>) => {
        setState(
          (prevState) =>
            ({
              [key]:
                typeof newValue === "function"
                  ? (newValue as Function)(prevState[key])
                  : newValue,
            } as Partial<T>)
        );
      },
      [key]
    );

    // Track mount status
    useEffect(() => {
      return () => {
        mountedRef.current = false;
      };
    }, []);

    return [value, setKeyValue];
  };

  // Optimized useStoreKeys with better performance
  const useStoreKeys = <K extends keyof T>(
    keys: K[]
  ): [
    Pick<T, K>,
    (
      updates:
        | Partial<Pick<T, K>>
        | ((values: Pick<T, K>) => Partial<Pick<T, K>>)
    ) => void
  ] => {
    // Stabilize keys array to prevent unnecessary re-renders
    const stableKeys = useMemo(() => [...keys], [keys.join(",")]);

    // Create initial values
    const [values, setValues] = useState<Pick<T, K>>(() => {
      const result = {} as Pick<T, K>;
      stableKeys.forEach((key) => {
        result[key] = getState(key);
      });
      return result;
    });

    const mountedRef = useRef(true);

    useEffect(() => {
      // Set initial values
      const initialValues = {} as Pick<T, K>;
      stableKeys.forEach((key) => {
        initialValues[key] = getState(key);
      });
      setValues(initialValues);

      // Subscribe to each key
      const unsubscribes = stableKeys.map((key) =>
        subscribe(key as string, (newValue: T[K]) => {
          if (mountedRef.current) {
            setValues((prev) => ({ ...prev, [key]: newValue }));
          }
        })
      );

      return () => unsubscribes.forEach((unsub) => unsub());
    }, [stableKeys.join(",")]);

    const setKeyValues = useCallback(
      (
        updates:
          | Partial<Pick<T, K>>
          | ((values: Pick<T, K>) => Partial<Pick<T, K>>)
      ) => {
        const result =
          typeof updates === "function" ? updates(values) : updates;

        // Filter only the keys we're subscribed to
        const filteredUpdates: Record<string, any> = {};
        Object.keys(result).forEach((key) => {
          if (stableKeys.includes(key as K)) {
            filteredUpdates[key] = result[key as keyof typeof result];
          }
        });

        if (Object.keys(filteredUpdates).length > 0) {
          setState(filteredUpdates as Partial<T>);
        }
      },
      [stableKeys.join(","), values]
    );

    // Track mount status
    useEffect(() => {
      return () => {
        mountedRef.current = false;
      };
    }, []);

    return [values, setKeyValues];
  };

  return {
    getState,
    setState,
    subscribe,
    useStore,
    useStoreKey,
    useStoreKeys,
  };
};

export default createStore;
