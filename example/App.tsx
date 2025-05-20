import React from "react";
import createStore from "react-constore"; // fix error

// Create store
const store = createStore({
  count: 0,
  user: { name: "Guest", age: 25 },
  todos: [],
});

// Counter component
export function Counter() {
  const [count, setCount] = store.useStoreKey("count");

  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>+</button>
      <button onClick={() => setCount(count - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// User component
export function User() {
  const [user, setUser] = store.useStoreKey("user");

  return (
    <div>
      <h2>
        User: {user.name} ({user.age})
      </h2>
      <button onClick={() => setUser({ ...user, name: "Ali" })}>
        Change Name
      </button>
      <button onClick={() => setUser({ ...user, age: user.age + 1 })}>
        Increase Age
      </button>
    </div>
  );
}

// Multiple keys component
export function MultipleKeys() {
  const [{ count, user }, updateValues] = store.useStoreKeys(["count", "user"]);

  return (
    <div>
      <h2>Multiple Values</h2>
      <p>
        Count: {count}, User: {user.name}
      </p>
      <button onClick={() => updateValues({ count: count + 10 })}>
        Add 10 to Count
      </button>
      <button
        onClick={() => updateValues({ user: { ...user, name: "Updated" } })}
      >
        Update User Name
      </button>
    </div>
  );
}

// Main App
export default function App() {
  const [state] = store.useStore();

  return (
    <div style={{ padding: "20px" }}>
      <h1>React Context Store Example</h1>

      <div
        style={{ border: "1px solid #ccc", padding: "10px", margin: "10px 0" }}
      >
        <h3>Full State:</h3>
        <pre>{JSON.stringify(state, null, 2)}</pre>
      </div>

      <Counter />
      <User />
      <MultipleKeys />
    </div>
  );
}
