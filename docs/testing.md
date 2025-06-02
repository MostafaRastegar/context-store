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
