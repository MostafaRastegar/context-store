export type State = Record<string, any>;

export type Listener<T = any> = (value: T, state: State) => void;

export type GlobalListener<T extends State> = (state: T) => void;

export type PartialState<T extends State> =
  | Partial<T>
  | ((state: T) => Partial<T>);

export type SetStateAction<T> = T | ((prev: T) => T);

export interface StoreAPI<T extends State> {
  getState(): T;
  getState<K extends keyof T>(key: K): T[K];
  setState(partial: PartialState<T>): void;
  subscribe(listener: GlobalListener<T>): () => void;
  subscribe(key: string, listener: Listener): () => void;
  useStore(): {
    state: T;
    setState: (partial: PartialState<T>) => void;
    changedKey: keyof T;
  };
  useStoreKey<K extends keyof T>(
    key: K
  ): [T[K], (value: SetStateAction<T[K]>) => void];
  useStoreKeys<K extends keyof T>(
    keys: K[]
  ): [
    Pick<T, K>,
    (
      updates:
        | Partial<Pick<T, K>>
        | ((values: Pick<T, K>) => Partial<Pick<T, K>>)
    ) => void
  ];
}
