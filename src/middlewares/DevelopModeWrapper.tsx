"use client";

import type { StoreAPI } from "./types";

// User component
function ActiveMiddleware({ store }: { store: StoreAPI<any> }) {
  store.useStore();
  return null;
}

export default function DevelopModeWrapper({
  children,
  store,
}: {
  children?: React.ReactNode;
  store: StoreAPI<any>;
}) {
  return (
    <>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ActiveMiddleware store={store} />
      )}
    </>
  );
}
