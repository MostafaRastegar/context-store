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
- ✅ **Devtools** - use [`Redux-Devtools`](docs/devtools-middleware.md) for debugging
- ✅ **SSR Ready** - Works with Next.js App Router
- ✅ **Tree Shakeable** - Only bundle what you use
- ✅ **MIT Licensed** - Free for commercial use

## 🔗 Quick Links

- 📖 **Documentation**: [GitHub Repository](https://github.com/mostafarastegar/react-constore)
- 📦 **Install**: `npm install react-constore`
- 📊 **Bundle Analysis**: [Bundle Phobia](https://bundlephobia.com/package/react-constore)
- 📈 **Download Stats**: [NPM Package](https://www.npmjs.com/package/react-constore)
- 🐛 **Issues & Support**: [GitHub Issues](https://github.com/mostafarastegar/react-constore/issues)

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

## 📚 Documentation

### 🚀 Getting Started
- [Installation & Quick Start](#-installation)
- [Core Concepts](docs/hooks-guide.md)

### 📖 API Reference
- [Hooks Guide](docs/hooks-guide.md) - `useStoreKey()`, `useStoreKeys()`, `useStore()`
- [Store API](docs/store-api.md) - `getState()`, `setState()`, `subscribe()`

### 🔧 Advanced Usage
- [DevTools](docs/devtools-middleware.md) - Debugger mode and built-in middlewares
- [Advanced Patterns](docs/advanced-patterns.md) - Computed values, actions, middleware
- [React Integration](docs/react-integration.md) - React 18+, Next.js, React Native

### 🔄 Migration & Comparison
- [Migration Guide](docs/migration-guide.md) - From Redux, Zustand, React Context API

### 📚 Best Practices & Help
- [Best Practices](docs/best-practices.md)
- [Testing](docs/testing.md)
- [Troubleshooting](docs/troubleshooting.md)

## 📊 Bundle Size Comparison

| Library | Size (gzipped) | Features |
|---------|----------------|----------|
| **React ConStore** | **~950B** | ✅ Hooks ✅ TypeScript ✅ SSR ✅ DevTools ✅ Middleware ✅ Persist |
| Redux Toolkit | ~3KB | ✅ DevTools ✅ Middleware ✅ Time Travel ❌ Simple API |
| Zustand | ~600B | ✅ Simple ✅ Middleware ❌ Built-in TypeScript |
| Jotai | ~4KB | ✅ Atomic ✅ TypeScript ❌ Learning Curve |

## 🆚 When to Use

**Use React ConStore when:**
- ✅ You want minimal bundle size
- ✅ Simple to medium complexity apps
- ✅ TypeScript-first development
- ✅ React 18+ features are important
- ✅ Devtools for debugging
- ✅ Custom middleware

**Consider alternatives when:**
- 🤔 **Redux Toolkit**: Need time-travel debugging, complex middleware
- 🤔 **Zustand**: Need advanced features (immer, persist, devtools)
- 🤔 **Jotai**: Bottom-up atomic state management
- 🤔 **Context API**: Very simple, component-local state

## 📄 License

MIT © [Mostafa Rastegar](https://github.com/mostafarastegar)

---

**Made with ❤️ for the React community**

