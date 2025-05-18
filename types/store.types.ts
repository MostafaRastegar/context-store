// src/types/store.types.ts

/**
 * Types for the store implementation
 */

export type Listener<T = any> = (newValue: T, state: State) => void;
export type GlobalListener = (state: State) => void;
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
  subscribe: {
    (listener: GlobalListener): () => void;
    <K extends keyof T>(key: K, listener: Listener<T[K]>): () => void;
  };
  destroy: () => void;
}

/**
 * Complete store API including hooks
 */
export interface StoreAPI<T extends State> extends StoreCore<T> {
  useStore: () => [T, (partial: PartialState<T>) => void];
  useStoreKey: <K extends keyof T>(
    key: K,
  ) => [T[K], (value: SetStateAction<T[K]>) => void];
  useStoreKeys: <K extends keyof T>(
    keys: K[],
  ) => [
    Pick<T, K>,
    (
      updates:
        | Partial<Pick<T, K>>
        | ((values: Pick<T, K>) => Partial<Pick<T, K>>),
    ) => void,
  ];
}
