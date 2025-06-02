import { useEffect } from "react";
import type { StoreAPI } from "./types";

export const withDevtools = <T extends object>(
  storeApi: StoreAPI<T>,
  name = "Store"
): StoreAPI<T> => {
  if (
    typeof window === "undefined" ||
    process.env.NODE_ENV === "production" ||
    !(window as any).__REDUX_DEVTOOLS_EXTENSION__
  ) {
    return storeApi;
  }

  const devtools = (window as any).__REDUX_DEVTOOLS_EXTENSION__.connect({
    name,
  });

  devtools.init(storeApi.getState());

  devtools.subscribe((message: any) => {
    if (message.type === "DISPATCH" && message.state) {
      try {
        const parsed = JSON.parse(message.state);
        storeApi.setState(parsed);
      } catch (err) {
        console.warn("DevTools parse error", err);
      }
    }
  });

  const useStoreWithDevtools = () => {
    const { state, setState, changedKey } = storeApi.useStore();

    useEffect(() => {
      devtools.send({ type: `[${name}, @@INIT]` }, state);
    }, []);

    useEffect(() => {
      if (changedKey === undefined) return;
      devtools.send(
        {
          type: `[${name}, ${String(changedKey)}]`,
          payload: state[changedKey],
        },
        state
      );
    }, [state]);
    return { state, setState, changedKey };
  };

  return {
    ...storeApi,
    useStore: useStoreWithDevtools,
  };
};
