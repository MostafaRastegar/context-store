import { renderHook, render, screen, fireEvent } from "@testing-library/react";
import { act } from "react";
import React, { startTransition } from "react";
import "@testing-library/jest-dom";
import createStore from "../src/store";

// Test interfaces
interface TestState {
  count: number;
  user: { name: string; age: number };
  todos: string[];
  nested: { deep: { value: string } };
}

describe("React Context Store", () => {
  describe("Store Creation", () => {
    it("should create store with initial state", () => {
      const initialState = { count: 0, user: { name: "Guest" } };
      const store = createStore(initialState);

      expect(store.getState()).toEqual(initialState);
    });

    it("should create store with function initializer", () => {
      const initializer = () => ({
        count: Math.random(),
        user: { name: "Dynamic" },
      });
      const store = createStore(initializer);

      const state = store.getState();
      expect(typeof state.count).toBe("number");
      expect(state.user.name).toBe("Dynamic");
    });

    it("should have all required methods", () => {
      const store = createStore({ count: 0 });

      expect(typeof store.getState).toBe("function");
      expect(typeof store.setState).toBe("function");
      expect(typeof store.subscribe).toBe("function");
      expect(typeof store.useStore).toBe("function");
      expect(typeof store.useStoreKey).toBe("function");
      expect(typeof store.useStoreKeys).toBe("function");
    });
  });

  describe("getState()", () => {
    it("should return entire state when no key provided", () => {
      const initialState = { count: 5, user: { name: "Test" } };
      const store = createStore(initialState);

      expect(store.getState()).toEqual(initialState);
    });

    it("should return specific key value", () => {
      const store = createStore({ count: 10, user: { name: "Alice" } });

      expect(store.getState("count")).toBe(10);
      expect(store.getState("user")).toEqual({ name: "Alice" });
    });
  });

  describe("setState()", () => {
    it("should update state with object", () => {
      const store = createStore({ count: 0, user: { name: "Guest" } });

      store.setState({ count: 5 });
      expect(store.getState("count")).toBe(5);
      expect(store.getState("user")).toEqual({ name: "Guest" });
    });

    it("should update state with function", () => {
      const store = createStore({ count: 0 });

      store.setState((prev) => ({ count: prev.count + 1 }));
      expect(store.getState("count")).toBe(1);
    });

    it("should handle partial updates", () => {
      const store = createStore({
        count: 0,
        user: { name: "Guest", age: 25 },
        todos: ["item1"],
      });

      store.setState({ count: 10 });

      expect(store.getState()).toEqual({
        count: 10,
        user: { name: "Guest", age: 25 },
        todos: ["item1"],
      });
    });

    it("should not update state if values are equal (deep equality)", () => {
      const store = createStore({ user: { name: "Alice" } });
      const listener = jest.fn();

      store.subscribe("user", listener);
      store.setState({ user: { name: "Alice" } }); // Same value

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("subscribe()", () => {
    it("should subscribe to global state changes", () => {
      const store = createStore({ count: 0, user: { name: "Guest" } });
      const listener = jest.fn();

      store.subscribe(listener);
      store.setState({ count: 1 });

      expect(listener).toHaveBeenCalledWith({
        count: 1,
        user: { name: "Guest" },
      });
    });

    it("should subscribe to specific key changes", () => {
      const store = createStore({ count: 0, user: { name: "Guest" } });
      const countListener = jest.fn();
      const userListener = jest.fn();

      store.subscribe("count", countListener);
      store.subscribe("user", userListener);

      store.setState({ count: 5 });

      expect(countListener).toHaveBeenCalledWith(5, {
        count: 5,
        user: { name: "Guest" },
      });
      expect(userListener).not.toHaveBeenCalled();
    });

    it("should return unsubscribe function", () => {
      const store = createStore({ count: 0 });
      const listener = jest.fn();

      const unsubscribe = store.subscribe("count", listener);
      store.setState({ count: 1 });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();
      store.setState({ count: 2 });
      expect(listener).toHaveBeenCalledTimes(1); // Not called again
    });

    it("should clean up listeners when all unsubscribed", () => {
      const store = createStore({ count: 0 });
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      const unsub1 = store.subscribe("count", listener1);
      const unsub2 = store.subscribe("count", listener2);

      unsub1();
      unsub2();

      store.setState({ count: 1 });
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });
  });

  describe("useStore() Hook", () => {
    it("should return current state and setState function", () => {
      const store = createStore({ count: 0, user: { name: "Guest" } });

      const { result } = renderHook(() => store.useStore());
      const [state, setState] = result.current;

      expect(state).toEqual({ count: 0, user: { name: "Guest" } });
      expect(typeof setState).toBe("function");
    });

    it("should update when store changes", () => {
      const store = createStore({ count: 0 });
      const { result } = renderHook(() => store.useStore());

      act(() => {
        store.setState({ count: 5 });
      });

      expect(result.current[0].count).toBe(5);
    });

    it("should allow updating through returned setState", () => {
      const store = createStore({ count: 0 });
      const { result } = renderHook(() => store.useStore());

      act(() => {
        result.current[1]({ count: 10 });
      });

      expect(result.current[0].count).toBe(10);
    });
  });

  describe("useStoreKey() Hook", () => {
    it("should return specific key value and setter", () => {
      const store = createStore({ count: 0, user: { name: "Guest" } });
      const { result } = renderHook(() => store.useStoreKey("count"));

      const [count, setCount] = result.current;
      expect(count).toBe(0);
      expect(typeof setCount).toBe("function");
    });

    it("should update only when specific key changes", () => {
      const store = createStore({ count: 0, user: { name: "Guest" } });
      let renderCount = 0;

      const { result } = renderHook(() => {
        renderCount++;
        return store.useStoreKey("count");
      });

      const initialRenderCount = renderCount;

      act(() => {
        store.setState({ user: { name: "Alice" } }); // Different key
      });

      // Should not re-render for different key
      expect(renderCount).toBe(initialRenderCount);

      act(() => {
        store.setState({ count: 5 }); // Same key
      });

      // Should re-render for same key
      expect(renderCount).toBe(initialRenderCount + 1);
      expect(result.current[0]).toBe(5);
    });

    it("should support functional updates", () => {
      const store = createStore({ count: 0 });
      const { result } = renderHook(() => store.useStoreKey("count"));

      act(() => {
        result.current[1]((prev) => prev + 5);
      });

      expect(result.current[0]).toBe(5);
    });
  });

  describe("useStoreKeys() Hook", () => {
    it("should return multiple keys and setter", () => {
      const store = createStore({
        count: 0,
        user: { name: "Guest" },
        todos: ["item1"],
      });

      const { result } = renderHook(() =>
        store.useStoreKeys(["count", "user"])
      );
      const [values, setValues] = result.current;

      expect(values).toEqual({
        count: 0,
        user: { name: "Guest" },
      });
      expect(typeof setValues).toBe("function");
    });

    it("should update when any subscribed key changes", () => {
      const store = createStore({
        count: 0,
        user: { name: "Guest" },
        todos: [],
      });
      const { result } = renderHook(() =>
        store.useStoreKeys(["count", "user"])
      );

      act(() => {
        store.setState({ count: 5 });
      });

      expect(result.current[0].count).toBe(5);

      act(() => {
        store.setState({ user: { name: "Alice" } });
      });

      expect(result.current[0].user).toEqual({ name: "Alice" });
    });

    it("should not update for non-subscribed keys", () => {
      const store = createStore({
        count: 0,
        user: { name: "Guest" },
        todos: [],
      });
      let renderCount = 0;

      const { result } = renderHook(() => {
        renderCount++;
        return store.useStoreKeys(["count"]);
      });

      const initialRenderCount = renderCount;

      act(() => {
        store.setState({ todos: ["new item"] }); // Not subscribed
      });

      expect(renderCount).toBe(initialRenderCount);
    });

    it("should support functional updates", () => {
      const store = createStore({ count: 0, user: { name: "Guest" } });
      const { result } = renderHook(() =>
        store.useStoreKeys(["count", "user"])
      );

      act(() => {
        result.current[1]((prev) => ({
          count: prev.count + 1,
          user: { name: "Updated" },
        }));
      });

      expect(result.current[0]).toEqual({
        count: 1,
        user: { name: "Updated" },
      });
    });
  });

  describe("TypeScript Support", () => {
    it("should provide proper type inference", () => {
      interface AppState {
        count: number;
        user: { name: string; email: string };
      }

      const store = createStore<AppState>({
        count: 0,
        user: { name: "Guest", email: "guest@example.com" },
      });

      // Type checking happens at compile time
      const count: number = store.getState("count");
      const user: { name: string; email: string } = store.getState("user");

      expect(typeof count).toBe("number");
      expect(typeof user.name).toBe("string");
      expect(typeof user.email).toBe("string");
    });
  });

  describe("Performance Optimizations", () => {
    it("should use deep equality to prevent unnecessary updates", () => {
      const store = createStore({
        user: { name: "Alice", settings: { theme: "dark" } },
      });
      const listener = jest.fn();

      store.subscribe("user", listener);

      // Same object structure, different reference
      store.setState({
        user: { name: "Alice", settings: { theme: "dark" } },
      });

      expect(listener).not.toHaveBeenCalled();
    });

    it("should handle array equality correctly", () => {
      const store = createStore({ items: [1, 2, 3] });
      const listener = jest.fn();

      store.subscribe("items", listener);
      store.setState({ items: [1, 2, 3] }); // Same array

      expect(listener).not.toHaveBeenCalled();

      store.setState({ items: [1, 2, 3, 4] }); // Different array
      expect(listener).toHaveBeenCalled();
    });

    it("should handle date equality correctly", () => {
      const date = new Date("2023-01-01");
      const store = createStore({ lastUpdated: date });
      const listener = jest.fn();

      store.subscribe("lastUpdated", listener);
      store.setState({ lastUpdated: new Date("2023-01-01") }); // Same date

      expect(listener).not.toHaveBeenCalled();
    });
  });

  describe("React Integration Tests", () => {
    // Test component using the store
    const TestComponent: React.FC = () => {
      const store = createStore({ count: 0, user: { name: "Guest" } });
      const [count, setCount] = store.useStoreKey("count");
      const [user, setUser] = store.useStoreKey("user");

      return (
        <div>
          <div data-testid="count">Count: {count}</div>
          <div data-testid="user">User: {user.name}</div>
          <button
            data-testid="increment"
            onClick={() => setCount((c) => c + 1)}
          >
            Increment
          </button>
          <button
            data-testid="change-user"
            onClick={() => setUser({ name: "Alice" })}
          >
            Change User
          </button>
        </div>
      );
    };

    it("should work in React components", () => {
      render(<TestComponent />);

      expect(screen.getByTestId("count")).toHaveTextContent("Count: 0");
      expect(screen.getByTestId("user")).toHaveTextContent("User: Guest");

      fireEvent.click(screen.getByTestId("increment"));
      expect(screen.getByTestId("count")).toHaveTextContent("Count: 1");

      fireEvent.click(screen.getByTestId("change-user"));
      expect(screen.getByTestId("user")).toHaveTextContent("User: Alice");
    });
  });

  describe("React 18/19 Compatibility", () => {
    it("should work with automatic batching", () => {
      const store = createStore({ count: 0, user: { name: "Guest" } });
      const listener = jest.fn();

      store.subscribe(listener);

      act(() => {
        // Multiple setState calls should be batched
        store.setState({ count: 1 });
        store.setState({ user: { name: "Alice" } });
        store.setState({ count: 2 });
      });

      // Should be called for each actual change
      expect(listener).toHaveBeenCalledTimes(3);
    });

    it("should work with startTransition", () => {
      const store = createStore({ count: 0 });
      const { result } = renderHook(() => store.useStoreKey("count"));

      act(() => {
        startTransition(() => {
          result.current[1](100);
        });
      });

      expect(result.current[0]).toBe(100);
    });
  });

  describe("Edge Cases", () => {
    it("should handle null and undefined values", () => {
      const store = createStore({ value: null, other: undefined });

      expect(store.getState("value")).toBeNull();
      expect(store.getState("other")).toBeUndefined();

      store.setState({ value: "not null" });
      expect(store.getState("value")).toBe("not null");
    });

    it("should handle nested object updates", () => {
      const store = createStore({
        config: {
          ui: { theme: "light", lang: "en" },
          api: { timeout: 5000 },
        },
      });

      store.setState({
        config: {
          ...store.getState("config"),
          ui: { ...store.getState("config").ui, theme: "dark" },
        },
      });

      expect(store.getState("config").ui.theme).toBe("dark");
      expect(store.getState("config").ui.lang).toBe("en");
      expect(store.getState("config").api.timeout).toBe(5000);
    });

    it("should handle empty updates gracefully", () => {
      const store = createStore({ count: 0 });
      const listener = jest.fn();

      store.subscribe(listener);
      store.setState({}); // Empty update

      expect(listener).not.toHaveBeenCalled();
    });

    it("should handle invalid updates gracefully", () => {
      const store = createStore({ count: 0 });
      const initialState = store.getState();

      // These shouldn't throw or change state
      store.setState(null as any);
      store.setState(undefined as any);
      store.setState("invalid" as any);

      expect(store.getState()).toEqual(initialState);
    });
  });

  describe("Memory Management", () => {
    it("should clean up subscriptions properly", () => {
      const store = createStore({ count: 0 });
      const listeners = Array.from({ length: 100 }, () => jest.fn());

      // Add many listeners
      const unsubscribers = listeners.map((listener) =>
        store.subscribe("count", listener)
      );

      // Remove all listeners
      unsubscribers.forEach((unsub) => unsub());

      // Update should not call any listeners
      store.setState({ count: 1 });
      listeners.forEach((listener) => {
        expect(listener).not.toHaveBeenCalled();
      });
    });

    it("should handle component unmounting gracefully", () => {
      const store = createStore({ count: 0 });
      const { unmount } = renderHook(() => store.useStoreKey("count"));

      // This should not throw
      unmount();

      // Store should still work
      store.setState({ count: 5 });
      expect(store.getState("count")).toBe(5);
    });
  });
});
