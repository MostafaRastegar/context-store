## 🚨 Troubleshooting

### 🔴 Common Mistake: Using `getState()` Instead of Hooks

**Problem:** Many developers try to use `getState()` in components expecting it to be reactive.

```jsx
// ❌ WRONG - Component won't update when count changes
function BrokenCounter() {
  const count = store.getState('count'); // No subscription!
  
  return (
    <div>
      <p>Count: {count}</p> {/* Always shows initial value */}
      <button onClick={() => store.setState({ count: count + 1 })}>
        Increment (Broken!)
      </button>
    </div>
  );
}

// ✅ CORRECT - Use hooks for reactive updates
function WorkingCounter() {
  const [count, setCount] = store.useStoreKey('count');
  
  return (
    <div>
      <p>Count: {count}</p> {/* Updates automatically */}
      <button onClick={() => setCount(c => c + 1)}>
        Increment (Works!)
      </button>
    </div>
  );
}
```

**Solution:** Always use hooks (`useStoreKey`, `useStoreKeys`, `useStore`) in React components for reactive data.

### Component Not Re-rendering

```jsx
// Problem: Direct mutation
const [user, setUser] = store.useStoreKey('user');
user.name = 'New Name'; // ❌ Won't work

// Solution: Create new object
setUser({ ...user, name: 'New Name' }); // ✅ Works
```

### Too Many Re-renders

```jsx
// Problem: Using useStore() everywhere
function App() {
  const [state] = store.useStore(); // ❌ Re-renders on ANY change
  return <div>{state.count}</div>;
}

// Solution: Use specific keys
function App() {
  const [count] = store.useStoreKey('count'); // ✅ Only count changes
  return <div>{count}</div>;
}
```

### Data Not Updating in External Functions

```jsx
// Problem: Expecting getState() to be reactive outside components
let currentCount = store.getState('count'); // ❌ Stale reference

setInterval(() => {
  console.log(currentCount); // Always logs initial value!
}, 1000);

// Solution: Use subscribe() for external reactivity
store.subscribe('count', (newCount) => {
  console.log('Count updated to:', newCount); // ✅ Always current
});

// Or get fresh value each time
setInterval(() => {
  const freshCount = store.getState('count'); // ✅ Fresh value
  console.log(freshCount);
}, 1000);
```

### TypeScript Errors

```jsx
// Problem: No type definition
const store = createStore({ count: 0 });
const [user] = store.useStoreKey('user'); // ❌ Type error

// Solution: Define interface
interface AppState {
  count: number;
  user?: { name: string };
}

const store = createStore<AppState>({ count: 0 }); // ✅ Typed
```
