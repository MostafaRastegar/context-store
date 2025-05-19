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

  // Listeners storage
  const keyListeners = new Map<string, Set<Listener>>();
  const globalListeners = new Set<GlobalListener<T>>();

  // Notify listeners about changes
  const notify = (changedKeys: string[]) => {
    // Notify key-specific listeners
    changedKeys.forEach((key) => {
      const listeners = keyListeners.get(key);
      if (listeners) {
        listeners.forEach((listener) => listener(state[key], state));
      }
    });

    // Notify global listeners
    if (changedKeys.length > 0) {
      globalListeners.forEach((listener) => listener(state));
    }
  };

  // Get current state or specific key
  const getState = (key?: string) => (key ? state[key] : state);

  // Update state
  const setState = (partial: PartialState<T>) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!nextState || typeof nextState !== "object") return;

    const changedKeys: string[] = [];

    // Check each key for changes
    Object.keys(nextState).forEach((key) => {
      if (!isEqual(state[key], nextState[key])) {
        state = { ...state, [key]: nextState[key] } as T;
        changedKeys.push(key);
      }
    });

    // Notify only if there were changes
    if (changedKeys.length > 0) {
      notify(changedKeys);
    }
  };

  // Subscribe to changes
  const subscribe = ((
    keyOrListener: string | GlobalListener<T>,
    listener?: Listener
  ) => {
    // Global listener
    if (typeof keyOrListener === "function") {
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
    const [localState, setLocalState] = useState<T>(() => getState() as T);
    const isMounted = useRef<boolean>(false);

    useEffect(() => {
      isMounted.current = true;
      setLocalState(getState() as T);

      const unsubscribe = subscribe((newState: T) => {
        if (isMounted.current) {
          setLocalState(newState);
        }
      });

      return () => {
        isMounted.current = false;
        unsubscribe();
      };
    }, []);

    return [localState, useCallback(setState, [])];
  };

  // Hook to use specific key
  const useStoreKey = <K extends keyof T>(
    key: K
  ): [T[K], (value: SetStateAction<T[K]>) => void] => {
    const [value, setValue] = useState<T[K]>(() => getState(key as string));
    const isMounted = useRef<boolean>(false);

    useEffect(() => {
      isMounted.current = true;
      setValue(getState(key as string));

      const unsubscribe = subscribe(key as string, (newValue: T[K]) => {
        if (isMounted.current) {
          setValue(newValue);
        }
      });

      return () => {
        isMounted.current = false;
        unsubscribe();
      };
    }, [key]);

    const setKeyValue = useCallback(
      (newValue: SetStateAction<T[K]>) => {
        setState({
          [key]:
            typeof newValue === "function"
              ? (newValue as Function)(getState(key as string))
              : newValue,
        } as Partial<T>);
      },
      [key]
    );

    return [value, setKeyValue];
  };

  // Hook to use multiple keys
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
    const sortedKeys = useMemo(() => [...keys].sort(), [keys.join(",")]);

    const [values, setValues] = useState<Pick<T, K>>(() => {
      return sortedKeys.reduce<Pick<T, K>>((acc, key) => {
        acc[key] = getState(key as string);
        return acc;
      }, {} as Pick<T, K>);
    });

    const isMounted = useRef<boolean>(false);

    useEffect(() => {
      isMounted.current = true;

      // Set initial values
      const initialValues = sortedKeys.reduce<Pick<T, K>>((acc, key) => {
        acc[key] = getState(key as string);
        return acc;
      }, {} as Pick<T, K>);
      setValues(initialValues);

      // Subscribe to each key
      const unsubscribes: (() => void)[] = sortedKeys.map((key) =>
        subscribe(key as string, (newValue: T[K]) => {
          if (isMounted.current) {
            setValues((prev) => ({ ...prev, [key]: newValue }));
          }
        })
      );

      return () => {
        isMounted.current = false;
        unsubscribes.forEach((unsub: () => void) => unsub());
      };
    }, [sortedKeys.join(",")]);

    const setKeyValues = useCallback(
      (
        updates:
          | Partial<Pick<T, K>>
          | ((values: Pick<T, K>) => Partial<Pick<T, K>>)
      ) => {
        const result =
          typeof updates === "function" ? updates(values) : updates;
        const filteredUpdates: Record<string, any> = {};

        Object.keys(result).forEach((key) => {
          if (sortedKeys.includes(key as K)) {
            filteredUpdates[key] = result[key as keyof typeof result];
          }
        });

        if (Object.keys(filteredUpdates).length > 0) {
          setState(filteredUpdates as Partial<T>);
        }
      },
      [sortedKeys.join(","), values]
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
