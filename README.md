# React Context Store

⚡ Ultra-lightweight state management for React 18+ applications (~1KB)

## Features

- 🚀 **Ultra Lightweight**: Less than 1KB gzipped
- ⚛️ **React 18 & 19 Compatible**: Full support for concurrent features
- 🔄 **Optimized Re-renders**: Components only update when their data changes
- 🎯 **Selective Subscriptions**: Subscribe to entire store or specific keys
- 🪝 **React Hooks**: Familiar API using React hooks
- 📝 **TypeScript**: Full type safety included
- 🧠 **Smart Updates**: Deep equality checks prevent unnecessary renders
- 🌐 **Server Components**: Works with Next.js 13+ and React Server Components
- 🔄 **Concurrent Safe**: Compatible with React 18/19 concurrent features

## React Compatibility

| React Version | Support |
|---------------|---------|
| React 18.x    | ✅ Full Support |
| React 19.x    | ✅ Full Support |
| React 17.x    | ❌ Not Supported |

## Installation

```bash
npm install react-constore
# or
yarn add react-constore
```

## Quick Start

```tsx
'use client'; // for Next.js 13+ with App Router

import createStore from 'react-constore';

// Create store
const store = createStore({
  count: 0,
  user: { name: 'Guest' }
});

// Use in components
function Counter() {
  const [count, setCount] = store.useStoreKey('count');
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  );
}
```

## React 18/19 Features

### Automatic Batching
```tsx
function BatchingExample() {
  const [count, setCount] = store.useStoreKey('count');
  
  const handleMultipleUpdates = () => {
    // These updates are automatically batched in React 18/19
    setCount(c => c + 1);
    store.setState({ user: { name: 'Updated' } });
    setCount(c => c + 1);
  };
  
  return <button onClick={handleMultipleUpdates}>Batch Updates</button>;
}
```

### Concurrent Features
```tsx
import { startTransition } from 'react';

function ConcurrentExample() {
  const [count, setCount] = store.useStoreKey('count');
  
  const handleConcurrentUpdate = () => {
    startTransition(() => {
      setCount(count + 100); // Non-urgent update
    });
  };
  
  return <button onClick={handleConcurrentUpdate}>Concurrent Update</button>;
}
```

### Server Components (Next.js 13+)
```tsx
// Works in Server Components
function ServerComponent() {
  // Static data can be initialized server-side
  return <ClientComponent />;
}

// Client-side interactivity
'use client';
function ClientComponent() {
  const [data, setData] = store.useStoreKey('data');
  return <div>{/* Interactive UI */}</div>;
}
```

## API Reference

### `createStore(initialState)`

Create a new store with initial state.

```tsx
const store = createStore({ count: 0, todos: [] });
```

### Store Methods

#### `getState(key?)`
```tsx
const state = store.getState();      // Get entire state
const count = store.getState('count'); // Get specific key
```

#### `setState(updates)`
```tsx
store.setState({ count: 5 });
store.setState(prev => ({ count: prev.count + 1 }));
```

#### `subscribe(listener)` / `subscribe(key, listener)`
```tsx
// Subscribe to all changes
const unsubscribe = store.subscribe(state => console.log(state));

// Subscribe to specific key
const unsubscribe = store.subscribe('count', value => console.log(value));
```

### React Hooks

#### `useStore()`
Subscribe to entire store (re-renders on any change).

```tsx
function App() {
  const [state, setState] = store.useStore();
  return <div>{JSON.stringify(state)}</div>;
}
```

#### `useStoreKey(key)`
Subscribe to specific key (re-renders only when that key changes).

```tsx
function Counter() {
  const [count, setCount] = store.useStoreKey('count');
  return <div onClick={() => setCount(c => c + 1)}>{count}</div>;
}
```

#### `useStoreKeys(keys)`
Subscribe to multiple keys (re-renders when any of those keys change).

```tsx
function UserStats() {
  const [{ user, count }, updateValues] = store.useStoreKeys(['user', 'count']);
  return (
    <div>
      <p>{user.name}: {count}</p>
      <button onClick={() => updateValues({ count: count + 1 })}>
        Increment
      </button>
    </div>
  );
}
```

## TypeScript Support

Full type safety out of the box:

```tsx
interface AppState {
  count: number;
  user: { name: string; email: string };
}

const store = createStore<AppState>({
  count: 0,
  user: { name: 'Guest', email: '' }
});

// All operations are fully typed
const [user, setUser] = store.useStoreKey('user');
// user is typed as { name: string; email: string }
```

## Next.js 13+ App Router

Works seamlessly with the App Router:

```tsx
// app/store.ts
'use client';
import createStore from 'react-constore';

export const store = createStore({
  user: { name: 'Guest' },
  theme: 'light'
});

// app/components/UserProfile.tsx
'use client';
import { store } from '../store';

export function UserProfile() {
  const [user, setUser] = store.useStoreKey('user');
  return <div>{user.name}</div>;
}
```

## Performance Tips

1. Use `useStoreKey` instead of `useStore` when possible
2. Use `useStoreKeys` for multiple related keys
3. Deep equality prevents unnecessary re-renders automatically
4. Compatible with React DevTools Profiler

## Testing React 18/19

Create test projects for both versions:

```bash
# Test React 18
npx create-react-app test-react18 --template typescript
cd test-react18
npm install react-constore

# Test React 19 (when available)
npx create-next-app test-react19 --typescript
cd test-react19
npm install react-constore
```

## Migration from Other State Libraries

### From Redux
```tsx
// Before (Redux)
const slice = createSlice({
  name: 'counter',
  initialState: { value: 0 },
  reducers: { increment: state => { state.value += 1; } }
});

// After (React Context Store)
const store = createStore({ value: 0 });
const [value, setValue] = store.useStoreKey('value');
const increment = () => setValue(v => v + 1);
```

### From Zustand
```tsx
// Before (Zustand)
const useStore = create(set => ({
  count: 0,
  increment: () => set(state => ({ count: state.count + 1 }))
}));

// After (React Context Store)
const store = createStore({ count: 0 });
const [count, setCount] = store.useStoreKey('count');
const increment = () => setCount(c => c + 1);
```

## Bundle Analysis

| Library | Size (gzipped) | React 18 | React 19 |
|---------|----------------|----------|----------|
| Redux Toolkit | ~2.5KB | ✅ | ✅ |
| Zustand | ~2.1KB | ✅ | ✅ |
| Jotai | ~2.8KB | ✅ | ✅ |
| React Context Store | **~950B** | ✅ | ✅ |

## License

MIT