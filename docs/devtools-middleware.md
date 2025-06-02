# 📚 Devtools & Middleware

A collection of middleware utilities for enhancing your React stores with logging, debugging, and development tools.

## Features

- **Logger Middleware**: Console logging for state changes and debugging
- **DevTools Integration**: Redux DevTools Extension support for time-travel debugging
***Requirements:***
It can be used as a browser extension (for [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd), [Edge](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdiaponcejilbhhikei) and [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)), as [a standalone app](https://github.com/reduxjs/redux-devtools/tree/main/packages/redux-devtools-app) or as [a React component](https://github.com/reduxjs/redux-devtools/tree/master/packages/redux-devtools) integrated in the client app.
- **Middleware Composition**: Easy composition of multiple middleware
- **Development Mode Wrapper**: Conditional middleware activation in development

## Installation

```bash
npm install react-constore
```

## Quick Start

```typescript
import { createStore } from 'react-constore';
import { applyMiddleware, withDevtools, withLogger } from 'react-constore/middleware';

// Create your base store
// my-store.ts
const MyStore = createStore({
  count: 0,
  user: null,
});

// Apply middleware
export const store = applyMiddleware(
  MyStore,
  (store) => withDevtools(store, 'MyStore'),
  (store) => withLogger(store, 'MyStore'),
);

// Use in your main or child components
// MyComponent.tsx
import { DevelopModeWrapper } from 'react-constore/middlewares';
import { store } from './my-store';
function Counter() {
  return (
    <div>
      // other codes ...
      <DevelopModeWrapper store={store} />
    </div>
  );
}
```

## Middleware

### Logger Middleware

Provides console logging for store state changes and debugging information.

```typescript
import { withLogger } from './middleware';

const storeWithLogger = withLogger(MyStore, 'MyStoreName');
```

**Features:**
- Logs initial state when component mounts
- Groups state updates with changed key information
- Shows payload and next state for each update

**Console Output:**
```
[MyStore] Mounted. Initial state: { count: 0, user: null }
🔄 MyStore Update: [count]
  Payload: 1
  Next: { count: 1, user: null }
```

### DevTools Middleware

Integrates with Redux DevTools Extension for advanced debugging capabilities.

```typescript
import { withDevtools } from './middleware';

const storeWithDevtools = withDevtools(MyStore, 'MyStoreName');
```

**Features:**
- Time-travel debugging
- State inspection and modification
- Action tracking
- Automatic production environment detection

**Requirements:**
- Redux DevTools Extension installed in browser
- Only active in development environment
It can be used as a browser extension (for [Chrome](https://chrome.google.com/webstore/detail/redux-devtools/lmhkpmbekcpmknklioeibfkpmmfibljd), [Edge](https://microsoftedge.microsoft.com/addons/detail/redux-devtools/nnkgneoiohoecpdiaponcejilbhhikei) and [Firefox](https://addons.mozilla.org/en-US/firefox/addon/reduxdevtools/)), as [a standalone app](https://github.com/reduxjs/redux-devtools/tree/main/packages/redux-devtools-app) or as [a React component](https://github.com/reduxjs/redux-devtools/tree/master/packages/redux-devtools) integrated in the client app.

### Middleware Composition

Apply multiple middleware using the `applyMiddleware` utility:

```typescript
import { applyMiddleware, withDevtools, withLogger } from './middleware';

export const store = applyMiddleware(
  MyStore,
  (store) => withDevtools(store, 'MyStore'),
  (store) => withLogger(store, 'MyStore'),
  // Add more middleware as needed
);
```

**Middleware Order:**
Middleware is applied from left to right. The last middleware in the chain will be the outermost wrapper.

## Development Mode Wrapper

Use `DevelopModeWrapper` to conditionally activate middleware only in development:

```typescript
import { DevelopModeWrapper } from './middleware';

function App() {
  return (
    <DevelopModeWrapper store={store}>
      <YourAppComponents />
    </DevelopModeWrapper>
  );
}
```

This ensures middleware hooks are called even when not directly used in your components, enabling logging and devtools functionality.

## API Reference

### `applyMiddleware(store, ...middlewares)`

Composes multiple middleware functions with a store.

**Parameters:**
- `store`: The base store API
- `middlewares`: Array of middleware functions

**Returns:** Enhanced store API with all middleware applied

### `withLogger(storeApi, name?)`

Adds console logging to store operations.

**Parameters:**
- `storeApi`: Store API to enhance
- `name`: Optional name for log messages (default: 'Store')

**Returns:** Enhanced store API with logging

### `withDevtools(storeApi, name?)`

Adds Redux DevTools integration.

**Parameters:**
- `storeApi`: Store API to enhance  
- `name`: Optional name for DevTools instance (default: 'Store')

**Returns:** Enhanced store API with DevTools support

### `DevelopModeWrapper`

React component that activates middleware in development mode.

**Props:**
- `children`: React children to render
- `store`: Store API that needs middleware activation

## Best Practices

1. **Development Only**: Use middleware primarily in development environments
2. **Meaningful Names**: Provide descriptive names for stores in DevTools and logs
3. **Middleware Order**: Apply DevTools before Logger for better debugging experience
4. **Production Safety**: Middleware automatically detects production environment

## Environment Detection

The middleware automatically detects the environment:
- **Development**: Full functionality enabled
- **Production**: DevTools middleware becomes a no-op
- **Server-side**: Safe handling of `window` object checks

## TypeScript Support

All middleware functions are fully typed and preserve your store's type information:

```typescript
interface MyState {
  count: number;
  user: User | null;
}

const MyStore = createStore<MyState>({ count: 0, user: null });
const enhancedStore = applyMiddleware(MyStore, withLogger); // Type preserved
```

## Troubleshooting

**DevTools not working:**
- Ensure Redux DevTools Extension is installed
- Check that you're in development mode
- Verify `window.__REDUX_DEVTOOLS_EXTENSION__` exists

**Logging not appearing:**
- Confirm you're in development environment  
- Check that store is being used in components
- Use `DevelopModeWrapper` if middleware isn't activating

**Performance concerns:**
- Middleware is automatically disabled in production
- Logging overhead is minimal in development
- Consider selective middleware application for large applications