// src/types/store.types.ts

/**
 * Types for the store implementation
 */

export type Listener<T = any> = (newValue: T, state: State) => void;
export type GlobalListener<T extends State = State> = (state: T) => void;
export type State = Record<string, any>;
export type SetStateAction<T> = T | ((prevState: T) => T);
export type PartialState<T extends State> =
  | Partial<T>
  | ((state: T) => Partial<T>);

/**
 * Listeners map structure
 */
export interface ListenersMap {
  [key: string]: Set<Listener>;
}

/**
 * Core store methods
 */
export interface StoreCore<T extends State> {
  getState: (key?: string) => any;
  setState: (partial: PartialState<T>) => void;

  // Fixed subscribe function with proper overloads
  subscribe: {
    // Global listener - subscribes to any state change
    (listener: GlobalListener<T>): () => void;
    // Key-specific listener - subscribes to specific key changes
    (key: string, listener: Listener): () => void;
  };

  destroy: () => void;

  // Optional debug method
  getListenersInfo?: () => {
    keyListeners: Record<string, number>;
    globalListeners: number;
  };
}

/**
 * Complete store API including hooks
 */
export interface StoreAPI<T extends State> extends StoreCore<T> {
  useStore: () => [T, (partial: PartialState<T>) => void];
  useStoreKey: <K extends keyof T>(
    key: K
  ) => [T[K], (value: SetStateAction<T[K]>) => void];
  useStoreKeys: <K extends keyof T>(
    keys: K[]
  ) => [
    Pick<T, K>,
    (
      updates:
        | Partial<Pick<T, K>>
        | ((values: Pick<T, K>) => Partial<Pick<T, K>>)
    ) => void
  ];
}
