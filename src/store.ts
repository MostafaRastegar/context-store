// پیشنهاد: اضافه کردن cleanup method به store

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

// Enhanced StoreAPI with cleanup
interface EnhancedStoreAPI<T extends State> extends StoreAPI<T> {
  cleanup(): void;
  isDestroyed(): boolean;
}

const createStore = <T extends State>(
  initialState: T | (() => T)
): EnhancedStoreAPI<T> => {
  let state: T =
    typeof initialState === "function"
      ? (initialState as () => T)()
      : initialState;

  const keyListeners = new Map<string, Set<Listener>>();
  const globalListeners = new Set<GlobalListener<T>>();

  // Flag برای چک کردن destroyed بودن store
  let isDestroyed = false;

  const notify = (changedKeys: string[]) => {
    if (isDestroyed || changedKeys.length === 0) return;

    changedKeys.forEach((key) => {
      const listeners = keyListeners.get(key);
      if (listeners) {
        listeners.forEach((listener) => listener(state[key], state));
      }
    });

    globalListeners.forEach((listener) => listener(state));
  };

  function getState(): T;
  function getState<K extends keyof T>(key: K): T[K];
  function getState<K extends keyof T>(key?: K) {
    if (isDestroyed) {
      console.warn("Store has been destroyed");
      return key === undefined ? ({} as T) : (undefined as T[K]);
    }
    return key === undefined ? state : state[key];
  }

  const setState = (partial: PartialState<T>) => {
    if (isDestroyed) {
      console.warn("Cannot setState on destroyed store");
      return;
    }

    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!nextState || typeof nextState !== "object") return;

    const changedKeys: string[] = [];
    const updates: Record<string, any> = {};
    let hasChanges = false;

    Object.keys(nextState).forEach((key) => {
      if (!isEqual(state[key], nextState[key])) {
        updates[key] = nextState[key];
        changedKeys.push(key);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      state = { ...state, ...updates } as T;
      notify(changedKeys);
    }
  };

  const subscribe = ((
    keyOrListener: string | GlobalListener<T>,
    listener?: Listener
  ) => {
    if (isDestroyed) {
      console.warn("Cannot subscribe to destroyed store");
      return () => {};
    }

    if (typeof keyOrListener === "function") {
      globalListeners.add(keyOrListener);
      return () => globalListeners.delete(keyOrListener);
    }

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
  }) as EnhancedStoreAPI<T>["subscribe"];

  // 🆕 Cleanup method برای پاک کردن کامل store
  const cleanup = () => {
    // تمام listeners را پاک کن
    keyListeners.clear();
    globalListeners.clear();

    // State را reset کن
    state = {} as T;

    // Flag را set کن
    isDestroyed = true;

    console.log("Store has been cleaned up and destroyed");
  };

  // 🆕 Check کردن destroyed بودن
  const checkIsDestroyed = () => isDestroyed;

  const useStore = (): [T, (partial: PartialState<T>) => void] => {
    const [localState, setLocalState] = useState<T>(() => getState());
    const mountedRef = useRef(true);

    useEffect(() => {
      if (isDestroyed) return;

      setLocalState(getState());
      const unsubscribe = subscribe((newState: T) => {
        if (mountedRef.current && !isDestroyed) {
          setLocalState(newState);
        }
      });

      return () => {
        mountedRef.current = false;
        unsubscribe();
      };
    }, []);

    useEffect(() => {
      return () => {
        mountedRef.current = false;
      };
    }, []);

    return [localState, setState];
  };

  const useStoreKey = <K extends keyof T>(
    key: K
  ): [T[K], (value: SetStateAction<T[K]>) => void] => {
    const [value, setValue] = useState<T[K]>(() => getState(key));
    const mountedRef = useRef(true);

    useEffect(() => {
      if (isDestroyed) return;

      setValue(getState(key));
      const unsubscribe = subscribe(key as string, (newValue: T[K]) => {
        if (mountedRef.current && !isDestroyed) {
          setValue(newValue);
        }
      });

      return () => {
        unsubscribe();
      };
    }, [key]);

    const setKeyValue = useCallback(
      (newValue: SetStateAction<T[K]>) => {
        if (isDestroyed) return;

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

    useEffect(() => {
      return () => {
        mountedRef.current = false;
      };
    }, []);

    return [value, setKeyValue];
  };

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
    const stableKeys = useMemo(() => [...keys], [keys.join(",")]);
    const [values, setValues] = useState<Pick<T, K>>(() => {
      const result = {} as Pick<T, K>;
      stableKeys.forEach((key) => {
        result[key] = getState(key);
      });
      return result;
    });

    const mountedRef = useRef(true);

    useEffect(() => {
      if (isDestroyed) return;

      const initialValues = {} as Pick<T, K>;
      stableKeys.forEach((key) => {
        initialValues[key] = getState(key);
      });
      setValues(initialValues);

      const unsubscribes = stableKeys.map((key) =>
        subscribe(key as string, (newValue: T[K]) => {
          if (mountedRef.current && !isDestroyed) {
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
        if (isDestroyed) return;

        const result =
          typeof updates === "function" ? updates(values) : updates;
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
    cleanup, // 🆕 Cleanup method
    isDestroyed: checkIsDestroyed, // 🆕 Check destroyed status
  };
};

export default createStore;

// 🆕 نحوه استفاده:
// const store = createStore({ count: 0 });
//
// // وقتی می‌خوای store رو کاملاً پاک کنی:
// store.cleanup();
//
// // چک کردن destroyed بودن:
// if (store.isDestroyed()) {
//   console.log('Store is destroyed');
// }
