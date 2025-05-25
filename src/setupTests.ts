import "@testing-library/jest-dom";

// Mock React 18/19 APIs for testing
Object.defineProperty(window, "requestIdleCallback", {
  value: (callback: Function) => setTimeout(callback, 0),
});

Object.defineProperty(window, "cancelIdleCallback", {
  value: (id: number) => clearTimeout(id),
});
