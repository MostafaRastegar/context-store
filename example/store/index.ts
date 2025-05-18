// store.js
import createStore from "@/papak/context-store";

const ProductInitStore = createStore({
  count: 0,
  product: "Apple",
});

const ProductStore = {
  ...ProductInitStore,
  increasePopulation() {
    ProductInitStore.setState((state) => ({ count: state.count + 1 }));
  },
  removeAllProducts() {
    ProductInitStore.setState({ count: 0 });
  },
  updateProducts(newProducts: number) {
    ProductInitStore.setState({ count: newProducts });
  },
};

export default ProductStore;
