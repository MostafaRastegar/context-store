## 🎯 Best Practices

### ✅ Do's

```jsx
// ✅ Use hooks in React components for reactive data
const [count, setCount] = store.useStoreKey('count');
const [{ user, settings }] = store.useStoreKeys(['user', 'settings']);

// ✅ Use getState() for one-time reads in event handlers
const handleSubmit = () => {
  const currentUser = store.getState('user');
  if (!currentUser) return;
  // ... submit logic
};

// ✅ Use subscribe() for external reactive logic
store.subscribe('theme', (newTheme) => {
  document.body.className = `theme-${newTheme}`;
});

// ✅ Create action functions for complex logic
const actions = {
  login: (credentials) => {
    store.setState({ loading: true });
    // ... login logic
  }
};

// ✅ Use functional updates for state based on previous state
setCount(prevCount => prevCount + 1);

// ✅ Structure your state logically
const store = createStore({
  // User-related data
  user: null,
  isAuthenticated: false,
  
  // UI state
  theme: 'light',
  sidebarOpen: false,
  
  // App data
  posts: [],
  comments: {}
});
```

### ❌ Don'ts

```jsx
// ❌ Don't use getState() in components expecting reactivity
function BadComponent() {
  const count = store.getState('count'); // Won't update!
  return <div>{count}</div>;
}

// ❌ Don't use useStore() everywhere (causes unnecessary re-renders)
const [entireState] = store.useStore(); // Only for debug/dev tools

// ❌ Don't mutate state directly
const [user, setUser] = store.useStoreKey('user');
user.name = 'Changed'; // Won't trigger updates!

// ❌ Don't create multiple stores for the same domain
const userStore = createStore({ user: {} });
const cartStore = createStore({ cart: [] });
// Better: One store with organized structure

// ❌ Don't store functions or non-serializable data
const store = createStore({
  functions: () => {}, // ❌
  domElements: document.querySelector('#app'), // ❌
  classInstances: new MyClass() // ❌
});

// ❌ Don't rely on getState() for external reactive logic
let count = store.getState('count'); // ❌ Stale reference
setInterval(() => console.log(count), 1000); // Always logs initial value

// ✅ Use subscribe() instead
store.subscribe('count', (newCount) => {
  console.log(newCount); // Always current value
});
```

### 🎯 When to Use What

| Scenario | Use | Reason |
|----------|-----|--------|
| **React Component Data** | `useStoreKey()` / `useStoreKeys()` | Automatic re-renders |
| **Event Handler Logic** | `getState()` | One-time current value |
| **External Side Effects** | `subscribe()` | Reactive to changes |
| **Initial Setup** | `getState()` | Current snapshot |
| **Validation/Conditions** | `getState()` | Current state check |
| **Debug/DevTools** | `useStore()` | See all state |
