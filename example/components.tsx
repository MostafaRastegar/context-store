import React from 'react';
import ProductStore from './store';

export function ProductCounter() {
  const { useStoreKey } = ProductStore;
  const [count] = useStoreKey('count');
  return <h1>{count} product around here...</h1>;
}

export function Controls() {
  const { increasePopulation } = ProductStore;
  return <button onClick={increasePopulation}>one up</button>;
}

export function ProductManager() {
  const { updateProducts, removeAllProducts } = ProductStore;
  const handleUpdate = (event) => {
    updateProducts(Number(event.target.value));
  };

  return (
    <div>
      <input
        type="number"
        onChange={handleUpdate}
        placeholder="Set bear count"
      />
      <button onClick={removeAllProducts}>Remove all product</button>
    </div>
  );
}
