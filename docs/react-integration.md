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


