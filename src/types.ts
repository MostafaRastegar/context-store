// Minimal types
export type State = Record<string, any>;
export type Listener<T = any> = (value: T, state: State) => void;
export type GlobalListener<T extends State> = (state: T) => void;
export type PartialState<T extends State> =
  | Partial<T>
  | ((state: T) => Partial<T>);
export type SetStateAction<T> = T | ((prev: T) => T);

export interface StoreAPI<T extends State> {
  getState: (key?: string) => any;
  setState: (partial: PartialState<T>) => void;
  subscribe: {
    (listener: GlobalListener<T>): () => void;
    (key: string, listener: Listener): () => void;
  };
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
