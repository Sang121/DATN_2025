import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import { loadState, saveState } from "../utils/storage";
import orderReducer from "./slices/orderSlice";

// Custom throttle function to avoid lodash dependency issues
function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
const preloadedState = loadState();

const Store = configureStore({
  reducer: {
    user: userReducer,
    order: orderReducer,
  },
  preloadedState: preloadedState,
});

Store.subscribe(
  throttle(() => {
    saveState({
      user: Store.getState().user,
      order: Store.getState().order,
    });
  }, 1000)
);

export default Store;
