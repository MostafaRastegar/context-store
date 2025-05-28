# React ConStore

⚡ **Ultra-lightweight state management for React 18+ applications (~950B gzipped)**

## 📊 Quick Stats

| 📦 NPM Package | 📏 Bundle Size | ⭐ GitHub Stars | 📥 Downloads |
|----------------|----------------|-----------------|--------------|
| [react-constore](https://www.npmjs.com/package/react-constore) | **~950B gzipped** | [⭐ Star us!](https://github.com/mostafarastegar/react-constore/stargazers) | [📈 NPM Trends](https://npmtrends.com/react-constore) |

## ✅ Features

- ✅ **TypeScript Ready** - Full type safety out of the box
- ✅ **React 18+ Compatible** - Concurrent features supported  
- ✅ **Zero Dependencies** - No external packages needed
- ✅ **SSR Ready** - Works with Next.js App Router
- ✅ **Tree Shakeable** - Only bundle what you use
- ✅ **MIT Licensed** - Free for commercial use

## 🔗 Quick Links

- 📖 **Documentation**: [GitHub Repository](https://github.com/mostafarastegar/react-constore)
- 📦 **Install**: `npm install react-constore`
- 📊 **Bundle Analysis**: [Bundle Phobia](https://bundlephobia.com/package/react-constore)
- 📈 **Download Stats**: [NPM Package](https://www.npmjs.com/package/react-constore)
- 🐛 **Issues & Support**: [GitHub Issues](https://github.com/mostafarastegar/react-constore/issues)

---

## 📋 Table of Contents

### 🚀 Getting Started
- [Why React ConStore?](#-why-react-constore)
- [Key Features](#-key-features)  
- [Installation](#-installation)
- [Quick Start](#-quick-start)

### 📖 Core Concepts
- [Hooks Guide](#-hooks-guide)
  - [`useStoreKey()` - Single Value](#usestorekeykey---subscribe-to-single-value)
  - [`useStoreKeys()` - Multiple Values](#usestorekeyskeys---subscribe-to-multiple-values)
  - [`useStore()` - Entire State](#usestore---subscribe-to-entire-state)
- [Re-rendering Intelligence](#-re-rendering-intelligence)

### 🔧 API Reference
- [Store API Reference](#️-store-api-reference)
  - [Creating a Store](#creating-a-store)
  - [Direct Store Access](#️-getstate---snapshot-access-not-reactive)
- [Advanced Patterns](#-advanced-patterns)
  - [Computed Values](#computed-values)
  - [Action Patterns](#action-patterns)
  - [Middleware Pattern](#middleware-pattern)
  - [Async Operations](#async-operations)

### ⚛️ React Integration
- [React 18+ Features](#️-react-18-features)
  - [Automatic Batching](#automatic-batching)
  - [Concurrent Features](#concurrent-features)
- [Next.js Integration](#-nextjs-integration)
  - [App Router (Next.js 13+)](#app-router-nextjs-13)
  - [SSR with Initial Data](#ssr-with-initial-data)
- [React Native Support](#-react-native-support)

### 🔄 Migration & Comparison
- [Migration Guide](#-migration-guide)
  - [From Redux/Redux Toolkit](#from-reduxredux-toolkit)
  - [From Zustand](#from-zustand)
  - [From Context API](#from-context-api)
- [Bundle Size Comparison](#-bundle-size-comparison)
- [When to Use vs Alternatives](#-when-to-use-vs-alternatives)

### 📚 Best Practices & Help
- [Best Practices](#-best-practices)
- [Testing](#-testing)
- [Troubleshooting](#-troubleshooting)
- [Resources](#-resources)

---

## 🚀 Quick Navigation

**⚡ Just getting started?** → [Quick Start](#-quick-start) | [Installation](#-installation)

**🤔 Coming from other libraries?** → [Migration Guide](#-migration-guide) | [Comparison](#-bundle-size-comparison)

**🐛 Having issues?** → [Troubleshooting](#-troubleshooting) | [Best Practices](#-best-practices)

**📖 Need detailed docs?** → [Hooks Guide](#-hooks-guide) | [API Reference](#️-store-api-reference)

---

## 🚀 Why React ConStore?

```jsx
// Traditional React state management ❌
const [count, setCount] = useState(0);
const [user, setUser] = useState({ name: 'Guest' });
const [todos, setTodos] = useState([]);
// Props drilling nightmare... 😱

// With React ConStore ✅
const store = createStore({
  count: 0,
  user: { name: 'Guest' },
  todos: []
});

// Use anywhere, anytime 🎉
const [count, setCount] = store.useStoreKey('count');
```

## ✨ Key Features

| Feature | Description | Benefit |
|---------|-------------|---------|
| 🪶 **Ultra Lightweight** | Less than 1KB gzipped | Faster bundle, better performance |
| ⚛️ **React 18/19 Ready** | Concurrent features, automatic batching | Future-proof your app |
| 🎯 **Smart Re-renders** | Deep equality checks | Only render when data actually changes |
| 🔍 **Selective Subscriptions** | Subscribe to specific keys | Granular control over updates |
| 📝 **Full TypeScript** | Complete type safety | Catch bugs at compile time |
| 🌐 **SSR Compatible** | Next.js 13+ App Router | Server-side rendering support |

## 📦 Installation

```bash
# npm
npm install react-constore

# yarn
yarn add react-constore

# pnpm
pnpm add react-constore
```

## 🎯 Quick Start

```jsx
'use client'; // for Next.js App Router

import createStore from 'react-constore';

// 1. Create your store
const store = createStore({
  count: 0,
  user: { name: 'Guest', age: 25 },
  todos: [],
  theme: 'light'
});

// 2. Use in components
function Counter() {
  const [count, setCount] = store.useStoreKey('count');
  
  return (
    <div>
      <h2>Count: {count}</h2>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(c => c + 1)}>
        Functional Update
      </button>
    </div>
  );
}

function UserProfile() {
  const [user, setUser] = store.useStoreKey('user');
  
  return (
    <div>
      <h2>{user.name} (Age: {user.age})</h2>
      <button onClick={() => setUser({ ...user, age: user.age + 1 })}>
        Happy Birthday! 🎉
      </button>
    </div>
  );
}

// 3. Components automatically sync!
function App() {
  return (
    <div>
      <Counter />
      <UserProfile />
    </div>
  );
}
```

## 🎣 Hooks Guide

### `useStoreKey(key)` - Subscribe to Single Value

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

### `useStoreKeys([keys])` - Subscribe to Multiple Values

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

### `useStore()` - Subscribe to Entire State

**Best for:** Debug components, state viewers, or when you need everything.

```jsx
function DebugPanel() {
  const [state, setState] = store.useStore();
  
  // ⚠️ Re-renders on ANY store change
  // Use sparingly in production
  
  return (
    <details>
      <summary>Debug State (Click to expand)</summary>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <button onClick={() => setState({ debugMode: !state.debugMode })}>
        Toggle Debug Mode
      </button>
    </details>
  );
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

## 🏗️ Store API Reference

### Creating a Store

```jsx
// Simple initialization
const store = createStore({
  count: 0,
  user: null,
  items: []
});

// Dynamic initialization
const store = createStore(() => ({
  timestamp: Date.now(),
  sessionId: generateUniqueId(),
  user: loadUserFromStorage()
}));

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

### Direct Store Access

#### ⚠️ `getState()` - Snapshot Access (Not Reactive!)

**Important:** `getState()` returns a **one-time snapshot** and does NOT subscribe to changes!

```jsx
// ✅ Correct usage - Get current value once
const handleButtonClick = () => {
  const currentCount = store.getState('count');
  console.log('Current count:', currentCount); // Gets value at this moment
  
  // Do something with the current value
  if (currentCount > 10) {
    store.setState({ count: 0 });
  }
};

// ✅ Correct - Use in event handlers, effects, or external functions
useEffect(() => {
  const currentUser = store.getState('user');
  if (currentUser) {
    analytics.track('user_active', { userId: currentUser.id });
  }
}, []);

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

#### When to Use `getState()` vs Hooks

| Use Case | Method | Reactive? |
|----------|--------|-----------|
| **React Components** | `useStoreKey()` / `useStoreKeys()` | ✅ Yes |
| **Event Handlers** | `getState()` | ❌ No (one-time read) |
| **External Functions** | `getState()` | ❌ No (one-time read) |
| **Initial Values** | `getState()` | ❌ No (one-time read) |
| **Conditional Logic** | `getState()` | ❌ No (one-time read) |

#### Complete API Examples

```jsx
// Get entire state (snapshot)
const currentState = store.getState();

// Get specific value (snapshot)
const currentCount = store.getState('count');
const currentUser = store.getState('user');

// Update state directly (outside components)
store.setState({ count: 10 });
store.setState(prev => ({ count: prev.count + 1 }));

// Subscribe to changes (outside components) - with callback
const unsubscribe = store.subscribe('count', (newCount, fullState) => {
  console.log(`Count changed to: ${newCount}`);
  // This callback runs every time count changes
});

// Subscribe to all changes - with callback
const unsubscribeAll = store.subscribe(state => {
  console.log('State updated:', state);
  // This callback runs on any state change
});

// Clean up subscriptions
unsubscribe();
unsubscribeAll();
```

#### Real-world Examples

```jsx
// ✅ Correct: Using getState() for validation
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
  
  // Proceed with submission
  submitOrder({ user, cart });
};

// ✅ Correct: Using getState() in external functions
const saveToLocalStorage = () => {
  const currentState = store.getState();
  localStorage.setItem('app-state', JSON.stringify(currentState));
};

// ✅ Correct: Using getState() for conditional updates
const incrementIfLessThan100 = () => {
  const currentCount = store.getState('count');
  if (currentCount < 100) {
    store.setState({ count: currentCount + 1 });
  }
};

// ❌ WRONG: Expecting getState() to be reactive
function BrokenComponent() {
  const [, forceUpdate] = useState({});
  
  // This will NOT work - getState() doesn't subscribe!
  const count = store.getState('count'); // ❌ Always shows initial value
  
  return (
    <div>
      <div>Count: {count}</div>
      <button onClick={() => forceUpdate({})}>
        Force Update (Won't help!)
      </button>
    </div>
  );
}

// ✅ CORRECT: Using hooks for reactive data
function WorkingComponent() {
  const [count, setCount] = store.useStoreKey('count');
  
  return (
    <div>
      <div>Count: {count}</div> {/* Always up-to-date */}
      <button onClick={() => setCount(c => c + 1)}>
        Increment
      </button>
    </div>
  );
}
```

## 🔥 Advanced Patterns

### Computed Values

```jsx
const store = createStore({
  items: [
    { id: 1, name: 'Apple', price: 1.50, quantity: 3 },
    { id: 2, name: 'Banana', price: 0.75, quantity: 5 }
  ],
  tax: 0.08
});

function ShoppingCart() {
  const [items] = store.useStoreKey('items');
  const [tax] = store.useStoreKey('tax');
  
  // Computed values
  const subtotal = items.reduce((sum, item) => 
    sum + (item.price * item.quantity), 0
  );
  const taxAmount = subtotal * tax;
  const total = subtotal + taxAmount;
  
  return (
    <div>
      <div>Subtotal: ${subtotal.toFixed(2)}</div>
      <div>Tax: ${taxAmount.toFixed(2)}</div>
      <div>Total: ${total.toFixed(2)}</div>
    </div>
  );
}
```

### Action Patterns

```jsx
// Create action functions for complex operations
const actions = {
  addTodo: (text) => {
    const newTodo = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date()
    };
    
    store.setState(state => ({
      todos: [...state.todos, newTodo]
    }));
  },
  
  toggleTodo: (id) => {
    store.setState(state => ({
      todos: state.todos.map(todo =>
        todo.id === id 
          ? { ...todo, completed: !todo.completed }
          : todo
      )
    }));
  },
  
  deleteTodo: (id) => {
    store.setState(state => ({
      todos: state.todos.filter(todo => todo.id !== id)
    }));
  }
};

function TodoApp() {
  const [todos] = store.useStoreKey('todos');
  
  return (
    <div>
      {todos.map(todo => (
        <div key={todo.id}>
          <span 
            style={{ 
              textDecoration: todo.completed ? 'line-through' : 'none' 
            }}
            onClick={() => actions.toggleTodo(todo.id)}
          >
            {todo.text}
          </span>
          <button onClick={() => actions.deleteTodo(todo.id)}>
            Delete
          </button>
        </div>
      ))}
      <button onClick={() => actions.addTodo('New Task')}>
        Add Todo
      </button>
    </div>
  );
}
```

### Middleware Pattern

```jsx
// Create a store with logging middleware
function createStoreWithLogging(initialState) {
  const store = createStore(initialState);
  const originalSetState = store.setState;
  
  store.setState = (update) => {
    const prevState = store.getState();
    originalSetState(update);
    const nextState = store.getState();
    
    console.group('🔄 State Update');
    console.log('Previous:', prevState);
    console.log('Update:', update);
    console.log('Next:', nextState);
    console.groupEnd();
  };
  
  return store;
}

const store = createStoreWithLogging({
  count: 0,
  user: { name: 'Guest' }
});
```

### Async Operations

```jsx
const store = createStore({
  posts: [],
  loading: false,
  error: null
});

const api = {
  async fetchPosts() {
    store.setState({ loading: true, error: null });
    
    try {
      const response = await fetch('/api/posts');
      const posts = await response.json();
      
      store.setState({ 
        posts, 
        loading: false 
      });
    } catch (error) {
      store.setState({ 
        loading: false, 
        error: error.message 
      });
    }
  }
};

function PostsList() {
  const [{ posts, loading, error }] = store.useStoreKeys([
    'posts', 'loading', 'error'
  ]);
  
  useEffect(() => {
    api.fetchPosts();
  }, []);
  
  if (loading) return <div>Loading posts...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {posts.map(post => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
    </div>
  );
}
```

## ⚛️ React 18+ Features

### Automatic Batching

```jsx
function BatchingExample() {
  const [count, setCount] = store.useStoreKey('count');
  const [user, setUser] = store.useStoreKey('user');
  
  const handleMultipleUpdates = () => {
    // All these updates are automatically batched in React 18+
    setCount(c => c + 1);
    setUser({ name: 'Updated User' });
    setCount(c => c + 1);
    // Only triggers one re-render! 🎉
  };
  
  return <button onClick={handleMultipleUpdates}>Batch Updates</button>;
}
```

### Concurrent Features

```jsx
import { startTransition, useDeferredValue } from 'react';

function ConcurrentSearch() {
  const [query, setQuery] = store.useStoreKey('searchQuery');
  const [results, setResults] = store.useStoreKey('searchResults');
  
  // Defer expensive search results
  const deferredQuery = useDeferredValue(query);
  
  const handleSearch = (newQuery) => {
    // Urgent: Update search input immediately
    setQuery(newQuery);
    
    // Non-urgent: Update results in background
    startTransition(() => {
      const filtered = performExpensiveSearch(newQuery);
      setResults(filtered);
    });
  };
  
  return (
    <div>
      <input 
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        placeholder="Search..."
      />
      <div>
        {results.map(result => (
          <div key={result.id}>{result.title}</div>
        ))}
      </div>
    </div>
  );
}
```

## 🌐 Next.js Integration

### App Router (Next.js 13+)

```jsx
// app/store.js
'use client';
import createStore from 'react-constore';

export const store = createStore({
  user: null,
  cart: [],
  theme: 'light'
});

// app/components/Header.jsx
'use client';
import { store } from '../store';

export function Header() {
  const [user] = store.useStoreKey('user');
  const [cart] = store.useStoreKey('cart');
  
  return (
    <header>
      <div>Welcome, {user?.name || 'Guest'}</div>
      <div>Cart ({cart.length})</div>
    </header>
  );
}

// app/page.jsx (Server Component)
import { Header } from './components/Header';

export default function HomePage() {
  return (
    <div>
      <Header />
      <main>
        {/* Server-side content */}
      </main>
    </div>
  );
}
```

### SSR with Initial Data

```jsx
// pages/_app.js (Pages Router)
import { useEffect } from 'react';
import { store } from '../lib/store';

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Hydrate store with server data
    if (pageProps.initialStoreState) {
      store.setState(pageProps.initialStoreState);
    }
  }, [pageProps.initialStoreState]);

  return <Component {...pageProps} />;
}

// pages/index.js
export async function getServerSideProps() {
  const initialStoreState = {
    user: await fetchUser(),
    posts: await fetchPosts()
  };

  return {
    props: { initialStoreState }
  };
}
```

## 📱 React Native Support

```jsx
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createStore from 'react-constore';

const store = createStore({
  user: null,
  settings: { theme: 'light' },
  offline: false
});

// Persist state to AsyncStorage
store.subscribe(async (state) => {
  try {
    await AsyncStorage.setItem('app-state', JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
});

// Load state on app start
async function initializeStore() {
  try {
    const savedState = await AsyncStorage.getItem('app-state');
    if (savedState) {
      store.setState(JSON.parse(savedState));
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
}

function App() {
  useEffect(() => {
    initializeStore();
  }, []);

  return <YourAppComponents />;
}
```

## 🔧 Migration Guide

### From Redux/Redux Toolkit

```jsx
// Before (Redux)
const counterSlice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: {
    increment: (state) => {
      state.value += 1;
    },
    decrement: (state) => {
      state.value -= 1;
    },
    incrementByAmount: (state, action) => {
      state.value += action.payload;
    }
  }
});

const { increment, decrement, incrementByAmount } = counterSlice.actions;

function Counter() {
  const count = useSelector(state => state.counter.value);
  const dispatch = useDispatch();
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => dispatch(increment())}>+</button>
      <button onClick={() => dispatch(decrement())}>-</button>
    </div>
  );
}

// After (React ConStore)
const store = createStore({ count: 0 });

const actions = {
  increment: () => store.setState(s => ({ count: s.count + 1 })),
  decrement: () => store.setState(s => ({ count: s.count - 1 })),
  incrementByAmount: (amount) => store.setState(s => ({ count: s.count + amount }))
};

function Counter() {
  const [count] = store.useStoreKey('count');
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={actions.increment}>+</button>
      <button onClick={actions.decrement}>-</button>
    </div>
  );
}
```

### From Zustand

```jsx
// Before (Zustand)
const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 }))
}));

function Counter() {
  const { count, increment, decrement } = useStore();
  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
}

// After (React ConStore)
const store = createStore({ count: 0 });

function Counter() {
  const [count, setCount] = store.useStoreKey('count');
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={() => setCount(c => c - 1)}>-</button>
    </div>
  );
}
```

### From Context API

```jsx
// Before (Context API)
const AppContext = createContext();

function AppProvider({ children }) {
  const [state, setState] = useState({
    user: null,
    cart: []
  });
  
  return (
    <AppContext.Provider value={{ state, setState }}>
      {children}
    </AppContext.Provider>
  );
}

function UserProfile() {
  const { state, setState } = useContext(AppContext);
  
  return (
    <div>
      {state.user?.name}
      <button onClick={() => setState(s => ({ 
        ...s, 
        user: { ...s.user, name: 'Updated' } 
      }))}>
        Update
      </button>
    </div>
  );
}

// After (React ConStore)
const store = createStore({
  user: null,
  cart: []
});

function UserProfile() {
  const [user, setUser] = store.useStoreKey('user');
  
  return (
    <div>
      {user?.name}
      <button onClick={() => setUser({ ...user, name: 'Updated' })}>
        Update
      </button>
    </div>
  );
}
```

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

## 🧪 Testing

```jsx
import { renderHook, act } from '@testing-library/react';
import createStore from 'react-constore';

describe('Store Tests', () => {
  it('should update state correctly', () => {
    const store = createStore({ count: 0 });
    
    act(() => {
      store.setState({ count: 5 });
    });
    
    expect(store.getState('count')).toBe(5);
  });
  
  it('should trigger subscriptions', () => {
    const store = createStore({ count: 0 });
    const mockListener = jest.fn();
    
    store.subscribe('count', mockListener);
    
    act(() => {
      store.setState({ count: 1 });
    });
    
    expect(mockListener).toHaveBeenCalledWith(1, { count: 1 });
  });
  
  it('should work with React hooks', () => {
    const store = createStore({ count: 0 });
    
    const { result } = renderHook(() => store.useStoreKey('count'));
    
    act(() => {
      result.current[1](10);
    });
    
    expect(result.current[0]).toBe(10);
  });
});
```

## 📊 Bundle Size Comparison

| Library | Size (gzipped) | Features |
|---------|----------------|----------|
| **React ConStore** | **~950B** | ✅ Hooks, TypeScript, SSR |
| Redux Toolkit | ~3KB | ✅ DevTools, Middleware |
| Zustand | ~600B | ✅ Immer, Persist |
| Jotai | ~4KB | ✅ Atomic, Suspense |
| Valtio | ~2.7KB | ✅ Proxy-based |

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

## 🆚 When to Use vs Alternatives

**Use React ConStore when:**
- ✅ You want minimal bundle size
- ✅ Simple to medium complexity apps
- ✅ TypeScript-first development
- ✅ React 18+ features are important

**Consider alternatives when:**
- 🤔 **Redux Toolkit**: Need time-travel debugging, complex middleware
- 🤔 **Zustand**: Need advanced features (immer, persist, devtools)
- 🤔 **Jotai**: Bottom-up atomic state management
- 🤔 **Context API**: Very simple, component-local state


## 📄 License

MIT © [Mostafa Rastegar](https://github.com/mostafarastegar)

---

**Made with ❤️ for the React community**
