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
  let state: T =
    typeof initialState === "function"
      ? (initialState as () => T)()
      : initialState;

  const keyListeners = new Map<string, Set<Listener>>();
  const globalListeners = new Set<GlobalListener<T>>();
  let globalChangedKeys = "" as unknown as keyof T;

  const notify = (changedKeys: string[]) => {
    if (changedKeys.length === 0) return;

    globalChangedKeys = changedKeys.join(",");
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
    return key === undefined ? state : state[key];
  }

  const setState = (partial: PartialState<T>) => {
    const nextState = typeof partial === "function" ? partial(state) : partial;
    if (!nextState || typeof nextState !== "object") return;

    const changedKeys: string[] = [];
    let hasChanges = false;

    Object.keys(nextState).forEach((key) => {
      if (!isEqual(state[key], nextState[key])) {
        changedKeys.push(key);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      state = { ...state, ...nextState } as T;
      notify(changedKeys);
    }
  };

  const subscribe = ((
    keyOrListener: string | GlobalListener<T>,
    listener?: Listener
  ) => {
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
  }) as StoreAPI<T>["subscribe"];

  const useStore = (() => {
    const [localState, setLocalState] = useState<T>(state);

    useEffect(() => {
      setLocalState(state);
      return subscribe(setLocalState);
    }, []);

    return { state: localState, setState, changedKey: globalChangedKeys };
  }) as StoreAPI<T>["useStore"];

  const useStoreKey = <K extends keyof T>(
    key: K
  ): [T[K], (value: SetStateAction<T[K]>) => void] => {
    const [value, setValue] = useState<T[K]>(state[key]);
    const mountedRef = useRef(true);

    useEffect(() => {
      setValue(state[key]);
      const unsubscribe = subscribe(key as string, (newValue: T[K]) => {
        if (mountedRef.current) {
          setValue(newValue);
        }
      });

      return () => {
        mountedRef.current = false;
        unsubscribe();
      };
    }, [key]);

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
    const keysDep = keys.join(",");
    const getValues = () => {
      const result = {} as Pick<T, K>;
      keys.forEach((key) => {
        result[key] = state[key];
      });
      return result;
    };

    const [values, setValues] = useState<Pick<T, K>>(getValues);
    const mountedRef = useRef(true);

    useEffect(() => {
      setValues(getValues());
      const unsubscribes = keys.map((key) =>
        subscribe(key as string, () => {
          if (mountedRef.current) {
            setValues((prev) => ({ ...prev, [key]: state[key] }));
          }
        })
      );

      return () => {
        mountedRef.current = false;
        unsubscribes.forEach((unsub) => unsub());
      };
    }, [keysDep]);

    const setKeyValues = useCallback(
      (
        updates:
          | Partial<Pick<T, K>>
          | ((values: Pick<T, K>) => Partial<Pick<T, K>>)
      ) => {
        const result =
          typeof updates === "function" ? updates(values) : updates;

        const filteredUpdates = Object.keys(result).reduce((acc, key) => {
          if (keys.includes(key as K)) {
            acc[key] = result[key as keyof typeof result];
          }
          return acc;
        }, {} as Record<string, any>);

        if (Object.keys(filteredUpdates).length > 0) {
          setState(filteredUpdates as Partial<T>);
        }
      },
      [keysDep, values]
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
