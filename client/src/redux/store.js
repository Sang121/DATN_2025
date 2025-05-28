import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./slices/userSlice";
import { loadState, saveState } from "../utils/storage";
import throttle from "lodash/throttle"; 

const preloadedState = loadState();

const Store = configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState: preloadedState,
});

Store.subscribe(
  throttle(() => {
    saveState({
      user: Store.getState().user,
    });
  }, 1000)
);

export default Store;
