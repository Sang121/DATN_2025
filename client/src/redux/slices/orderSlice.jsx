import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orderItems: [],
  shippingInfo: {},
  items: [],
  paymentMethod: "",
  itemsPrice: 0,
  shippingPrice: 0,
  taxPrice: 0,
  totalDiscount: 0,
  totalPrice: 0,
  isPaid: false,
  paidAt: "",
  isDelivered: false,
  deliveredAt: "",
  user: "",
};

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    addOrderItem: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.orderItems.find(
        (item) => item.id === newItem.id
      );
      if (existingItem) {
        existingItem.amount += newItem.amount;
      } else {
        state.orderItems.push(newItem);
      }
    },
    updateOrderItem: (state, action) => {
      const newItem = action.payload;
      const existingItem = state.orderItems.find(
        (item) => item.id === newItem.id
      );
      if (existingItem) {
        existingItem.amount = newItem.amount;
      }
    },
    updateShippingInfo: (state, action) => {
      state.shippingInfo = action.payload;
    },
    updateOrder: (state, action) => {
      state.items = action.payload.items;
      state.user = action.payload.user;
      state.itemsPrice = action.payload.itemsPrice;
      state.taxPrice = action.payload.taxPrice;
      state.totalPrice = action.payload.totalPrice;
      state.totalDiscount = action.payload.totalDiscount;
    },
    removeOrderItem: (state, action) => {
      const id = action.payload;
      const existingItem = state.orderItems.find((item) => item.id === id);
      if (existingItem) {
        state.orderItems = state.orderItems.filter((item) => item.id !== id);
      }
    },
    clearImmediateOrder: (state) => {
      const orderItemsToKeep = state.orderItems.filter(
        (item) => !state.items.some((orderedItem) => orderedItem.id === item.id)
      );

      return {
        ...initialState,
        orderItems: orderItemsToKeep,
        shippingInfo: state.shippingInfo,
        user: state.user,
      };
    },
    clearOrder: (state) => {
      const orderItemsToKeep = state.orderItems.filter(
        (item) => !state.items.some((orderedItem) => orderedItem.id === item.id)
      );
      return {
        ...initialState,
        orderItems: orderItemsToKeep,
      };
    },
  },
});

export const {
  addOrderItem,
  updateOrderItem,
  updateShippingInfo,
  removeOrderItem,
  updateOrder,
  clearImmediateOrder,
  clearOrder,
} = orderSlice.actions;
export default orderSlice.reducer;
