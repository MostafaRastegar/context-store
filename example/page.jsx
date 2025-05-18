'use client';

// App.js
import React from 'react';
import { Controls, ProductCounter, ProductManager } from './components';

function App() {
  return (
    <div>
      <ProductCounter />
      <Controls />
      <ProductManager />
    </div>
  );
}

export default App;
