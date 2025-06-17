import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  orderItems: [ 
   
  ],
  shippingAddress: {
    fullName: "",
    address: "",
    city: "",
    phone: "",
    country: "",
  },
  paymentMethod: "",
  itemsPrice: 0,
  shippingPrice: 0,
  taxPrice: 0,
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
    removeOrderItem: (state, action) => {
      const id = action.payload;
      const existingItem = state.orderItems.find((item) => item.id === id);
      if (existingItem) {
        state.orderItems = state.orderItems.filter((item) => item.id !== id);
      }
    },
    // You can add more reducers here
  },
});

export const { addOrderItem, updateOrderItem, removeOrderItem } = orderSlice.actions;
export default orderSlice.reducer;
