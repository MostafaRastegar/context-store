# 🎣 Hooks Guide

React ConStore provides three powerful hooks for different use cases. Each hook is optimized for specific scenarios to minimize re-renders and maximize performance.

## `useStoreKey(key)` - Subscribe to Single Value

**Best for:** Individual pieces of state that change independently.

```jsx
function ProductPrice() {
  const [price, setPrice] = store.useStoreKey('price');
  
  // ✅ Only re-renders when 'price' changes
  // ✅ Other store changes (user, cart, etc.) won't trigger re-render
  
  return (
    <div>
      <span>${price}</span>
      <button onClick={() => setPrice(price * 0.9)}>
        Apply 10% Discount
      </button>
    </div>
  );
}

// Functional updates for complex logic
function AdvancedCounter() {
  const [count, setCount] = store.useStoreKey('count');
  
  const handleComplexUpdate = () => {
    setCount(prevCount => {
      if (prevCount < 0) return 0;
      if (prevCount > 100) return 100;
      return prevCount + Math.floor(Math.random() * 10);
    });
  };
  
  return <button onClick={handleComplexUpdate}>Smart Increment</button>;
}
```

## `useStoreKeys([keys])` - Subscribe to Multiple Values

**Best for:** Components that need several related pieces of state.

```jsx
function UserDashboard() {
  const [{ user, notifications, settings }, updateValues] = store.useStoreKeys([
    'user', 'notifications', 'settings'
  ]);
  
  // ✅ Re-renders only when user, notifications, or settings change
  // ✅ Won't re-render for cart, products, or other unrelated changes
  
  return (
    <div>
      <h1>Welcome, {user.name}!</h1>
      <p>You have {notifications.length} notifications</p>
      <p>Theme: {settings.theme}</p>
      
      <button onClick={() => updateValues({
        user: { ...user, lastSeen: Date.now() },
        notifications: []
      })}>
        Mark All as Read
      </button>
    </div>
  );
}

// Functional updates with multiple keys
function SettingsPanel() {
  const [{ theme, language, notifications }, updateSettings] = 
    store.useStoreKeys(['theme', 'language', 'notifications']);
  
  const toggleDarkMode = () => {
    updateSettings(current => ({
      theme: current.theme === 'light' ? 'dark' : 'light',
      // Can update multiple keys in one go
      notifications: {
        ...current.notifications,
        themeChanged: true
      }
    }));
  };
  
  return <button onClick={toggleDarkMode}>Toggle Theme</button>;
}
```

## `useStore()` - Subscribe to Entire State

**Best for:** Debug components, state viewers, or when you need everything.

**Returns:** `{ state, setState, changedKey }` object with additional metadata.

```jsx
function DebugPanel() {
  const { state, setState, changedKey } = store.useStore();
  
  // ⚠️ Re-renders on ANY store change
  // Use sparingly in production
  
  return (
    <details>
      <summary>Debug State (Click to expand)</summary>
      <div>
        <p>Last changed keys: {changedKey}</p>
        <pre>{JSON.stringify(state, null, 2)}</pre>
        <button onClick={() => setState({ debugMode: !state.debugMode })}>
          Toggle Debug Mode
        </button>
      </div>
    </details>
  );
}

// Advanced usage with changedKey for optimization
function SmartLogger() {
  const { state, changedKey } = store.useStore();
  
  useEffect(() => {
    if (changedKey) {
      console.log(`Keys changed: ${changedKey}`, state);
    }
  }, [changedKey, state]);
  
  return null; // Logger component
}
```

## 🔄 Re-rendering Intelligence

React ConStore uses **deep equality checks** to prevent unnecessary re-renders:

```jsx
const store = createStore({
  user: { name: 'Alice', settings: { theme: 'dark' } },
  items: [1, 2, 3]
});

function SmartComponent() {
  const [user, setUser] = store.useStoreKey('user');
  
  const handleClick = () => {
    // ✅ Won't re-render - same object structure
    setUser({ name: 'Alice', settings: { theme: 'dark' } });
    
    // ✅ Will re-render - different name
    setUser({ name: 'Bob', settings: { theme: 'dark' } });
    
    // ✅ Will re-render - nested change
    setUser({ 
      name: 'Alice', 
      settings: { theme: 'light' } // Changed!
    });
  };
  
  return <div>User: {user.name}</div>;
}
```

### Performance Comparison

```jsx
// ❌ Always re-renders (even with same data)
const [data, setData] = useState(complexObject);
setData({ ...complexObject }); // New reference = re-render

// ✅ Smart re-rendering (only when data actually changes)
const [data, setData] = store.useStoreKey('data');
setData({ ...complexObject }); // Same content = no re-render
```

## 🎯 Hook Selection Guide

| Use Case | Hook | Re-renders on | Best for |
|----------|------|---------------|----------|
| **Single value** | `useStoreKey('count')` | Only when `count` changes | Counters, flags, individual fields |
| **Multiple values** | `useStoreKeys(['user', 'cart'])` | When any specified key changes | Related data groups |
| **All state** | `useStore()` | Any state change | Debug panels, dev tools |

## 💡 Pro Tips

### 1. Choose the Right Hook
```jsx
// ✅ Good - Only subscribes to what you need
const [user] = store.useStoreKey('user');

// ❌ Bad - Subscribes to everything
const { state } = store.useStore();
const user = state.user;
```

### 2. Group Related Keys
```jsx
// ✅ Good - Group related data
const [{ user, settings, preferences }] = store.useStoreKeys([
  'user', 'settings', 'preferences'
]);

// ❌ Bad - Multiple separate subscriptions
const [user] = store.useStoreKey('user');
const [settings] = store.useStoreKey('settings');
const [preferences] = store.useStoreKey('preferences');
```

### 3. Use Functional Updates
```jsx
// ✅ Good - Prevents stale closures
setCount(prev => prev + 1);

// ❌ Bad - Can cause stale closure issues
setCount(count + 1);
```

---

**Next:** [Store API Reference](store-api.md) | **Previous:** [Getting Started](getting-started.md)