import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import { loadState, saveState } from "../utils/storage";
import throttle from "lodash/throttle"; 
import orderReducer from "./slices/orderSlice";
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
