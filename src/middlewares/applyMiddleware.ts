import { StoreAPI } from 'react-constore';

export const applyMiddleware = <T extends object>(
  store: StoreAPI<T>,
  ...middlewares: ((store: StoreAPI<T>) => StoreAPI<T>)[]
): StoreAPI<T> => {
  return middlewares.reduce((acc, mw) => mw(acc), store);
};
