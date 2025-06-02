
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


