
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
