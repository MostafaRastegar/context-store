# React Context Store

A lightweight and flexible library for state management in React applications with TypeScript support.

## Key Features

- 🔄 **Efficient Re-rendering**: Components only re-render when their shared state changes
- 🧩 **Modular Access**: Ability to share the entire store or specific keys
- 🪝 **React Hook Interface**: Familiar pattern for React developers
- 🔍 **Type-safe**: Full TypeScript support
- 🧠 **Smart Updates**: Deep equality checks to prevent unnecessary renders
- 🗄️ **Single Source of Truth**: Centralized state management
- 🔧 **Flexible API**: Works with both object and function update patterns
- 🐛 **Debug-friendly**: Built-in logging and debugging tools
- ⚡ **Performance Optimized**: Shallow comparison options and memoization
- 🛡️ **Error Handling**: Comprehensive error management with custom error types

# Refactored Store Structure

The refactored store implementation follows SOLID and DRY principles by separating concerns into these files:

```
src/
├── types/
│   └── store.types.ts          # Type definitions for the store
├── utils/
│   ├── comparison.ts           # Deep/shallow comparison utilities
│   ├── logger.ts               # Logging and error handling
│   └── errorHandler.ts         # Centralized error management
├── store/
│   ├── core.ts                 # Core store functionality 
│   ├── notifier.ts             # Handle notifications to listeners
│   ├── hooks/
│   │   ├── useStore.ts         # Hook for using the entire store
│   │   ├── useStoreKey.ts      # Hook for using a single key
│   │   └── useStoreKeys.ts     # Hook for using multiple keys
│   └── index.ts                # Main export that composes everything
```

## Installation

```bash
npm install react-state-store
# or
yarn add react-state-store
```

## Basic Usage

### Creating a Store and Using in Components

```tsx
import createStore from 'react-state-store';

// 1. Create a store with initial state
const store = createStore({
  count: 0,
  user: { name: 'Guest', isLoggedIn: false },
  todos: [],
});

// 2. Use the store in components
function Counter() {
  // Subscribe only to the 'count' value
  const [count, setCount] = store.useStoreKey('count');
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increase</button>
      <button onClick={() => setCount(c => c - 1)}>Decrease</button>
    </div>
  );
}

function UserProfile() {
  // Subscribe only to the 'user' object
  const [user, setUser] = store.useStoreKey('user');
  
  return (
    <div>
      <p>User: {user.name}</p>
      <button 
        onClick={() => setUser({ ...user, name: 'Ali', isLoggedIn: true })}
      >
        Login
      </button>
    </div>
  );
}

function App() {
  // Subscribe to the entire store (re-renders with any state change)
  const [state, setState] = store.useStore();
  
  return (
    <div>
      <h1>Application State</h1>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <Counter />
      <UserProfile />
    </div>
  );
}
```

## API Reference

### `createStore<T>(initialState)`

Creates a new store with the provided initial state.

**Parameters:**
- `initialState`: An object or function that returns the initial state

**Returns:** A store object with the following properties and methods:

### Store Methods

#### `getState(key?: string)`

Gets the current state or value of a specific key.

```tsx
// Get the entire state
const state = store.getState();

// Get a specific key
const count = store.getState('count');
```

#### `setState(partialState)`

Updates the state with a partial state object or a function that returns a partial state.

```tsx
// Object update
store.setState({ count: 5 });

// Function update (previous state)
store.setState(prevState => ({ count: prevState.count + 1 }));
```

#### `subscribe(key, listener)` or `subscribe(listener)`

Subscribes to changes on a specific key or any state change.

```tsx
// Subscribe to a specific key
const unsubscribe = store.subscribe('count', (newValue, state) => {
  console.log('Count changed to:', newValue);
});

// Subscribe to any state change
const unsubscribeGlobal = store.subscribe(state => {
  console.log('State changed:', state);
});

// Later: unsubscribe to stop receiving updates
unsubscribe();
unsubscribeGlobal();
```

#### `destroy()`

Clears all subscriptions. Call this when you no longer need the store.

```tsx
store.destroy();
```

#### `getListenersInfo()` (Debug Only)

Returns debugging information about current listeners. Useful for development and debugging.

```tsx
const info = store.getListenersInfo();
console.log('Listeners info:', info);
// Output: { keyListeners: { count: 2, user: 1 }, globalListeners: 3 }
```

### React Hooks

#### `useStore()`

Hook to use the entire store. Component re-renders with any state change.

```tsx
function TotalState() {
  const [state, setState] = store.useStore();
  
  return (
    <div>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <button onClick={() => setState({ count: 0 })}>Reset Count</button>
    </div>
  );
}
```

#### `useStoreKey(key)`

Hook to use a specific key from the store. Component only re-renders when this key changes.

```tsx
function Counter() {
  const [count, setCount] = store.useStoreKey('count');
  
  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(count + 1)}>Increase</button>
      <button onClick={() => setCount(c => c - 1)}>Decrease</button>
    </div>
  );
}
```

#### `useStoreKeys(keys)`

Hook to use multiple specific keys from the store. Component only re-renders when any of these keys change.

```tsx
function UserStats() {
  const [{ user, count }, setValues] = store.useStoreKeys(['user', 'count']);
  
  return (
    <div>
      <p>User: {user.name}</p>
      <p>Count: {count}</p>
      <button onClick={() => setValues({ count: count + 1 })}>Increase Count</button>
      <button onClick={() => setValues(prev => ({ user: { ...prev.user, name: 'Updated' } }))}>
        Update Name
      </button>
    </div>
  );
}
```

## Debugging and Development Tools

### Built-in Logging

The store includes a comprehensive logging system for development:

```tsx
import createStore, { StoreLogger } from 'react-state-store';

// Enable logging for development (automatically enabled in NODE_ENV=development)
StoreLogger.enable();

const store = createStore({ count: 0 });

// All store operations will now be logged:
store.setState({ count: 1 }); // Logs: "🏪 Store: setState"
store.subscribe('count', (newValue) => {}); // Logs: "🏪 Store: subscribe (key)"

// Disable logging when not needed
StoreLogger.disable();
```

### Error Handling

The store provides detailed error information with custom error types:

```tsx
import { StateUpdateError, SubscriptionError } from 'react-state-store';

try {
  store.setState(null); // Invalid state
} catch (error) {
  if (error instanceof StateUpdateError) {
    console.log('State update error:', error.message);
    console.log('Attempted update:', error.data);
  }
}

try {
  store.subscribe('invalidKey'); // Invalid subscription
} catch (error) {
  if (error instanceof SubscriptionError) {
    console.log('Subscription error:', error.message);
  }
}
```

### Performance Monitoring

Monitor store performance and listener counts:

```tsx
function DebugInfo() {
  const info = store.getListenersInfo();
  
  return (
    <div>
      <h3>Store Debug Info</h3>
      <p>Global Listeners: {info.globalListeners}</p>
      <h4>Key Listeners:</h4>
      <ul>
        {Object.entries(info.keyListeners).map(([key, count]) => (
          <li key={key}>{key}: {count} listeners</li>
        ))}
      </ul>
    </div>
  );
}
```

## Advanced Usage

### Performance Optimization

For better performance, you can choose between deep and shallow equality checks:

```tsx
import { isEqual, isShallowEqual } from 'react-state-store';

// Deep equality (default) - handles nested objects, arrays, dates, etc.
const isDeepEqual = isEqual(obj1, obj2);

// Shallow equality - faster for simple objects
const isShallowEqual = isShallowEqual(obj1, obj2);

// Use shallow comparison when you know your state structure is flat
function SimpleCounter() {
  // This component benefits from shallow comparison
  // since we only have primitive values
  const [value, setValue] = store.useStoreKey('simpleValue');
  return <div>{value}</div>;
}
```

### Complex Data Types Support

The store handles complex JavaScript types correctly:

```tsx
const complexStore = createStore({
  date: new Date(),
  regex: /pattern/gi,
  map: new Map([['key', 'value']]),
  set: new Set([1, 2, 3]),
  nested: { deep: { object: 'value' } }
});

// All these will trigger re-renders only when values actually change
complexStore.setState({ date: new Date() }); // Different date = re-render
complexStore.setState({ date: new Date(complexStore.getState('date')) }); // Same date = no re-render
```

### Dynamic State Keys

You can dynamically add new keys to your state. The store will automatically handle subscriptions for new keys:

```tsx
function AddFeature() {
  const handleAddFeature = () => {
    // Dynamically add new state keys
    store.setState({ 
      newFeature: { enabled: true, config: {} },
      anotherKey: 'some value'
    });
    
    // You can immediately subscribe to these new keys
    const unsubscribe = store.subscribe('newFeature', (value) => {
      console.log('New feature changed:', value);
    });
  };
  
  return <button onClick={handleAddFeature}>Add New Feature</button>;
}
```

### Nested Updates

When updating nested objects, make sure to maintain immutability:

```tsx
function UpdateUserSettings() {
  const [user, setUser] = store.useStoreKey('user');
  
  const updateEmail = (newEmail) => {
    setUser({
      ...user,
      settings: {
        ...user.settings,
        email: newEmail
      }
    });
  };
  
  return (
    <input 
      value={user.settings?.email || ''} 
      onChange={e => updateEmail(e.target.value)}
    />
  );
}
```

### Using with TypeScript

This store is fully type-safe:

```tsx
// Define your application state interface
interface AppState {
  count: number;
  user: {
    name: string;
    isLoggedIn: boolean;
  };
  todos: Array<{ id: number; text: string; completed: boolean }>;
}

// Create a typed store
const store = createStore<AppState>({
  count: 0,
  user: { name: 'Guest', isLoggedIn: false },
  todos: [],
});

function TypedComponent() {
  // Everything is fully typed!
  const [user, setUser] = store.useStoreKey('user');
  
  // TypeScript ensures type safety
  user.name // ✓ correct
  user.unknownProp // ✗ error
  
  // Update functions also maintain type safety
  setUser(prev => ({ ...prev, isLoggedIn: true })); // ✓ correct
  setUser({ name: 'New Name', isLoggedIn: true }); // ✓ correct
  setUser({ wrongProp: true }); // ✗ error
}
```

## Performance Optimization

For better performance:

1. Use `useStoreKey` and `useStoreKeys` instead of `useStore` when possible
2. Avoid subscribing to the entire state in components that only need specific parts
3. This store uses deep equality checks to prevent unnecessary renders

## Server-Side Rendering

This store is compatible with server-side rendering frameworks like Next.js.

```tsx
// Initialize store with isomorphic logic
const initialState = typeof window !== 'undefined' 
  ? window.__INITIAL_STATE__ || { count: 0 }
  : { count: 0 };

const store = createStore(initialState);

// Now use the store normally in your components
```

## Custom Persistence

You can easily add persistence to your store:

```tsx
// Create a store with persisted state
const createPersistedStore = (key, defaultState) => {
  // Load initial state from storage
  const loadState = () => {
    try {
      const serializedState = localStorage.getItem(key);
      if (serializedState === null) {
        return defaultState;
      }
      return JSON.parse(serializedState);
    } catch (err) {
      return defaultState;
    }
  };

  // Create store with loaded state
  const store = createStore(loadState());

  // Subscribe to changes and save to localStorage
  store.subscribe(state => {
    try {
      const serializedState = JSON.stringify(state);
      localStorage.setItem(key, serializedState);
    } catch (err) {
      console.error('Could not save state:', err);
    }
  });

  return store;
};

// Usage
const store = createPersistedStore('app-state', { count: 0, user: { name: 'Guest' } });
```

## Complete Application Example (Todo App)

```tsx
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import createStore from 'react-state-store';

// Define types
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

interface AppState {
  todos: Todo[];
  filter: 'all' | 'active' | 'completed';
}

// Create store
const store = createStore<AppState>({
  todos: [],
  filter: 'all'
});

// Add todo component
function AddTodo() {
  const [text, setText] = useState('');
  const [state, setState] = store.useStore();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    setState({
      todos: [
        ...state.todos,
        { id: Date.now(), text, completed: false }
      ]
    });
    setText('');
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={text} 
        onChange={e => setText(e.target.value)} 
        placeholder="What do you want to do?"
      />
      <button type="submit">Add</button>
    </form>
  );
}

// Todo list component
function TodoList() {
  const [{ todos, filter }, setValues] = store.useStoreKeys(['todos', 'filter']);
  
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });
  
  const toggleTodo = (id: number) => {
    setValues({
      todos: todos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    });
  };
  
  return (
    <div>
      <ul>
        {filteredTodos.map(todo => (
          <li 
            key={todo.id}
            style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}
            onClick={() => toggleTodo(todo.id)}
          >
            {todo.text}
          </li>
        ))}
      </ul>
      
      {todos.length === 0 && <p>No items available!</p>}
    </div>
  );
}

// Filter component
function FilterButtons() {
  const [filter, setFilter] = store.useStoreKey('filter');
  
  return (
    <div>
      <button 
        onClick={() => setFilter('all')}
        disabled={filter === 'all'}
      >
        All
      </button>
      <button 
        onClick={() => setFilter('active')}
        disabled={filter === 'active'}
      >
        Active
      </button>
      <button 
        onClick={() => setFilter('completed')}
        disabled={filter === 'completed'}
      >
        Completed
      </button>
    </div>
  );
}

// Stats component
function Stats() {
  const [todos] = store.useStoreKey('todos');
  
  const completed = todos.filter(t => t.completed).length;
  const total = todos.length;
  
  return (
    <div>
      <p>
        {completed} of {total} items completed
        ({total ? Math.round((completed / total) * 100) : 0}%)
      </p>
    </div>
  );
}

// Main component
function App() {
  return (
    <div>
      <h1>Task Management</h1>
      <AddTodo />
      <FilterButtons />
      <TodoList />
      <Stats />
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
```

## Internal Architecture

This library is built on the following architectural principles:

1. **Single Source of Truth**: All application state is stored in a central object.

2. **Publish/Subscribe System**: Updates are managed through a pub/sub system that only notifies relevant subscribers.

3. **Immutability**: Each update creates a new state rather than directly modifying the current state.

4. **Subscriber Isolation**: Ability to subscribe to specific parts of the state rather than the whole.

5. **Deep Equality Checking**: To prevent unnecessary renders, only actual changes result in subscriber notifications. Supports complex data types including Arrays, Dates, Maps, Sets, and deeply nested objects.

6. **Error Handling**: Comprehensive error management with custom error types (`StateUpdateError`, `SubscriptionError`, `StoreError`) for better debugging experience.

7. **Performance Optimization**: 
   - Shallow comparison options for simple objects
   - Memoization in hooks to prevent unnecessary re-subscriptions
   - Automatic cleanup of empty listener sets
   - Optimized change detection

8. **Development Support**: Built-in logging system and debugging tools for development and testing.

## Performance Considerations

For optimal performance:

1. **Use specific hooks**: Prefer `useStoreKey` and `useStoreKeys` over `useStore` when possible
2. **Avoid whole-store subscriptions**: Only subscribe to parts of state you actually need
3. **Consider shallow comparison**: For simple state structures, shallow comparison is faster
4. **Monitor listener counts**: Use `getListenersInfo()` to check for memory leaks or excessive subscriptions
5. **Batch updates**: Multiple `setState` calls in the same synchronous execution will be batched automatically

## License

MIT