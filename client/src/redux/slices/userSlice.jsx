import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  username: "",
  fullName: "",
  avatar: "",
  address: "",
  email: "",
  favorite: [],
  cart: [],
  phone: "",
  access_token: "",
  isAuthenticated: false,
  loading: false,
  isAdmin: false,
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      state._id = action.payload._id || "";
      state.username = action.payload.username || "";
      state.avatar = action.payload.avatar || "";
      state.fullName = action.payload.fullName || "";
      state.email = action.payload.email || "";
      state.address = action.payload.address || "";
      state.gender = action.payload.gender || "";
      state.favorite = action.payload.favorite || [];
      state.cart = action.payload.cart || [];
      state.phone = action.payload.phone || "";
      state.access_token = action.payload.access_token || "";
      state.isAdmin = action.payload.isAdmin || false;
      state.isAuthenticated = !!action.payload.access_token; // Đặt isAuthenticated dựa trên access_token
    },
    updateFavorite: (state, action) => {
      state.favorite = action.payload.favorite || [];
    },
    logout: (state) => {
      state._id = "";
      state.username = "";
      state.fullName = "";
      state.avatar = "";
      state.address = "";
      state.email = "";
      state.gender = "";
      state.favorite = [];
      state.phone = "";
      state.isAdmin = false;
      state.isAuthenticated = false;
      state.access_token = "";
    },
  },
});
export const { updateUser, logout, updateFavorite } = userSlice.actions;
export default userSlice.reducer;
