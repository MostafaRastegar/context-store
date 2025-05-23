import { useState, useEffect, useRef, useCallback } from "react";
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

  // Listeners storage
  const keyListeners = new Map<string, Set<Listener>>();
  const globalListeners = new Set<GlobalListener<T>>();

  // Notify listeners about changes
  const notify = (changedKeys: string[]) => {
    if (changedKeys.length === 0) return;

    // Notify key-specific listeners
    changedKeys.forEach((key) => {
      const listeners = keyListeners.get(key);
      if (listeners) {
        listeners.forEach((listener) => listener(state[key], state));
      }
    });

    // Notify global listeners
    globalListeners.forEach((listener) => listener(state));
  };

  // Get current state or specific key
  function getState(): T;
  function getState<K extends keyof T>(key: K): T[K];
  function getState<K extends keyof T>(key?: K) {
    return key === undefined ? state : state[key];
  }

  // Update state
  const setState = (partial: PartialState<T>) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!nextState || typeof nextState !== "object") return;

    const changedKeys: string[] = [];

    // Check each key for changes using deep equality
    Object.keys(nextState).forEach((key) => {
      if (!isEqual(state[key], nextState[key])) {
        state = { ...state, [key]: nextState[key] } as T;
        changedKeys.push(key);
      }
    });

    notify(changedKeys);
  };

  // Subscribe to changes
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

  // Hook to use entire store
  const useStore = (): [T, (partial: PartialState<T>) => void] => {
    const [localState, setLocalState] = useState<T>(() => getState());

    useEffect(() => {
      setLocalState(getState());
      return subscribe((newState: T) => setLocalState(newState));
    }, []);

    return [localState, setState];
  };

  // Hook to use specific key
  const useStoreKey = <K extends keyof T>(
    key: K
  ): [T[K], (value: SetStateAction<T[K]>) => void] => {
    const [value, setValue] = useState<T[K]>(() => getState(key));

    useEffect(() => {
      setValue(getState(key));
      return subscribe(key as string, (newValue: T[K]) => setValue(newValue));
    }, [key]);

    const setKeyValue = useCallback(
      (newValue: SetStateAction<T[K]>) => {
        setState((prevState) => ({
          ...prevState,
          [key]:
            typeof newValue === "function"
              ? (newValue as Function)(getState(key))
              : newValue,
        }));
      },
      [key]
    );

    return [value, setKeyValue];
  };

  // Hook to use multiple keys - simplified version
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
    // Create initial values
    const [values, setValues] = useState<Pick<T, K>>(() => {
      const result = {} as Pick<T, K>;
      keys.forEach((key) => {
        result[key] = getState(key);
      });
      return result;
    });

    useEffect(() => {
      // Set initial values
      const initialValues = {} as Pick<T, K>;
      keys.forEach((key) => {
        initialValues[key] = getState(key);
      });
      setValues(initialValues);

      // Subscribe to each key
      const unsubscribes = keys.map((key) =>
        subscribe(key as string, (newValue: T[K]) => {
          setValues((prev) => ({ ...prev, [key]: newValue }));
        })
      );

      return () => unsubscribes.forEach((unsub) => unsub());
    }, [keys.join(",")]);

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
          if (keys.includes(key as K)) {
            filteredUpdates[key] = result[key as keyof typeof result];
          }
        });

        if (Object.keys(filteredUpdates).length > 0) {
          setState(filteredUpdates as Partial<T>);
        }
      },
      [keys.join(","), values]
    );

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
