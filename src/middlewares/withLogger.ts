import { useEffect } from "react";
import type { StoreAPI } from "./types";

export const withLogger = <T extends object>(
  storeApi: StoreAPI<T>,
  name = "Store"
): StoreAPI<T> => {
  const originalUseStore = storeApi.useStore;

  const useStoreWithLogger: typeof originalUseStore = () => {
    const { state, setState, changedKey } = originalUseStore();

    useEffect(() => {
      console.log(`[${name}] Mounted. Initial state:`, state);
    }, []);

    useEffect(() => {
      if (!!changedKey) {
        console.group(`🔄 ${name} Update: [${String(changedKey)}]`);
        console.log("Payload:", changedKey ? state[changedKey] : "N/A");
        console.log("Next:", state);
        console.groupEnd();
      }
    }, [state]);

    return { state, setState, changedKey };
  };

  return {
    ...storeApi,
    useStore: useStoreWithLogger,
  };
};
