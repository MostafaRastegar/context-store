# 🏗️ Store API Reference

The store provides several methods for creating, accessing, and managing state outside of React components.

## Creating a Store

### Basic Store Creation

```jsx
// Simple initialization
const store = createStore({
  count: 0,
  user: null,
  items: []
});

// Dynamic initialization with function
const store = createStore(() => ({
  timestamp: Date.now(),
  sessionId: generateUniqueId(),
  user: loadUserFromStorage()
}));
```

### TypeScript Support

```jsx
// TypeScript with interface
interface AppState {
  count: number;
  user: { name: string; email: string } | null;
  settings: { theme: 'light' | 'dark' };
}

const store = createStore<AppState>({
  count: 0,
  user: null,
  settings: { theme: 'light' }
});
```

## 🔍 Direct Store Access

### `getState()` - Get Current State (Not Reactive!)

**Important:** `getState()` returns a **one-time snapshot** and does NOT subscribe to changes!

```jsx
// Get entire state (snapshot)
const currentState = store.getState();

// Get specific value (snapshot)
const currentCount = store.getState('count');
const currentUser = store.getState('user');
```

#### ✅ Correct Usage - One-time Reads

```jsx
// ✅ Event handlers - Get current value once
const handleButtonClick = () => {
  const currentCount = store.getState('count');
  console.log('Current count:', currentCount);
  
  if (currentCount > 10) {
    store.setState({ count: 0 });
  }
};

// ✅ Validation - Check current state
const handleSubmit = () => {
  const { user, cart } = store.getState();
  
  if (!user) {
    alert('Please login first');
    return;
  }
  
  if (cart.length === 0) {
    alert('Cart is empty');
    return;
  }
  
  submitOrder({ user, cart });
};

// ✅ Initial setup - Get current snapshot
const initializeApp = () => {
  const currentUser = store.getState('user');
  if (currentUser) {
    redirectToDashboard();
  }
};
```

#### ❌ Wrong Usage - Expecting Reactivity

```jsx
// ❌ WRONG - This will NOT update when count changes!
function BrokenCounter() {
  const count = store.getState('count'); // ❌ No subscription = no updates!
  
  return <div>{count}</div>; // Will always show initial value
}

// ✅ CORRECT - Use hooks for reactive updates
function WorkingCounter() {
  const [count] = store.useStoreKey('count'); // ✅ Subscribes to changes
  
  return <div>{count}</div>; // Updates when count changes
}
```

### `setState()` - Update State

```jsx
// Direct object update
store.setState({ count: 10 });

// Functional update
store.setState(prev => ({ count: prev.count + 1 }));

// Multiple keys at once
store.setState({
  count: 0,
  user: { name: 'New User' },
  theme: 'dark'
});

// Conditional updates
store.setState(prev => ({
  count: prev.count < 100 ? prev.count + 1 : 0
}));
```

## 🔔 Subscription Management

### `subscribe()` - Listen to Changes (Outside Components)

For reactive behavior outside of React components:

```jsx
// Subscribe to specific key changes
const unsubscribe = store.subscribe('count', (newCount, fullState) => {
  console.log(`Count changed to: ${newCount}`);
  document.title = `Count: ${newCount}`;
});

// Subscribe to all state changes
const unsubscribeAll = store.subscribe(state => {
  console.log('State updated:', state);
  localStorage.setItem('app-state', JSON.stringify(state));
});

// Clean up subscriptions
unsubscribe();
unsubscribeAll();
```

### Auto-cleanup with React

```jsx
function ExternalListener() {
  useEffect(() => {
    const unsubscribe = store.subscribe('theme', (newTheme) => {
      document.body.className = `theme-${newTheme}`;
    });
    
    return unsubscribe; // Cleanup on unmount
  }, []);
  
  return null;
}
```

## 🎯 When to Use What?

| Use Case | Method | Reactive? | Usage |
|----------|--------|-----------|--------|
| **React Components** | `useStoreKey()` / `useStoreKeys()` / `useStore()` | ✅ Yes | Component data |
| **Event Handlers** | `getState()` | ❌ No (snapshot) | One-time reads |
| **External Side Effects** | `subscribe()` | ✅ Yes | DOM updates, analytics |
| **Initial Setup** | `getState()` | ❌ No (snapshot) | App initialization |
| **Conditional Logic** | `getState()` | ❌ No (snapshot) | Validation checks |

## 📝 Real-world Examples

### User Authentication

```jsx
const authActions = {
  login: async (credentials) => {
    store.setState({ loading: true, error: null });
    
    try {
      const user = await api.login(credentials);
      store.setState({ 
        user, 
        isAuthenticated: true,
        loading: false 
      });
    } catch (error) {
      store.setState({ 
        error: error.message,
        loading: false 
      });
    }
  },
  
  logout: () => {
    store.setState({ 
      user: null,
      isAuthenticated: false 
    });
  },
  
  checkAuthStatus: () => {
    const token = localStorage.getItem('token');
    if (token) {
      // Use getState() for current snapshot
      const currentUser = store.getState('user');
      if (!currentUser) {
        authActions.loadUserFromToken(token);
      }
    }
  }
};
```

### External Integrations

```jsx
// Analytics tracking
store.subscribe('user', (user) => {
  if (user) {
    analytics.identify(user.id, { 
      name: user.name,
      email: user.email 
    });
  }
});

// Theme synchronization
store.subscribe('theme', (newTheme) => {
  document.body.className = `theme-${newTheme}`;
  localStorage.setItem('preferred-theme', newTheme);
});

// Auto-save functionality
let saveTimeout;
store.subscribe((state) => {
  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    localStorage.setItem('app-state', JSON.stringify(state));
  }, 1000); // Debounced save
});
```

### Complex Business Logic

```jsx
const cartActions = {
  addItem: (product) => {
    store.setState(state => {
      const existingItem = state.cart.find(item => item.id === product.id);
      
      if (existingItem) {
        return {
          cart: state.cart.map(item =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        };
      }
      
      return {
        cart: [...state.cart, { ...product, quantity: 1 }]
      };
    });
  },
  
  updateQuantity: (productId, quantity) => {
    if (quantity <= 0) {
      cartActions.removeItem(productId);
      return;
    }
    
    store.setState(state => ({
      cart: state.cart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      )
    }));
  },
  
  getTotal: () => {
    const { cart } = store.getState();
    return cart.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );
  }
};
```

## 🚨 Common Pitfalls

### 1. Using `getState()` in Components

```jsx
// ❌ Wrong - No reactivity
function BadComponent() {
  const user = store.getState('user'); // Won't update!
  return <div>{user?.name}</div>;
}

// ✅ Correct - Reactive
function GoodComponent() {
  const [user] = store.useStoreKey('user');
  return <div>{user?.name}</div>;
}
```

### 2. Stale References in External Code

```jsx
// ❌ Wrong - Stale reference
let count = store.getState('count');
setInterval(() => console.log(count), 1000); // Always logs initial value

// ✅ Correct - Fresh value each time
setInterval(() => {
  const freshCount = store.getState('count');
  console.log(freshCount);
}, 1000);

// ✅ Better - Reactive subscription
store.subscribe('count', (newCount) => {
  console.log('Count updated:', newCount);
});
```

### 3. Memory Leaks with Subscriptions

```jsx
// ❌ Wrong - Memory leak
store.subscribe('data', handleDataChange); // Never cleaned up

// ✅ Correct - Clean up subscriptions
const unsubscribe = store.subscribe('data', handleDataChange);

// Later...
unsubscribe(); // Don't forget to clean up!

// ✅ Best - Auto-cleanup in React
useEffect(() => {
  const unsubscribe = store.subscribe('data', handleDataChange);
  return unsubscribe; // Cleanup on unmount
}, []);
```

---

**Next:** [Advanced Patterns](advanced-patterns.md) | **Previous:** [Hooks Guide](hooks-guide.md)