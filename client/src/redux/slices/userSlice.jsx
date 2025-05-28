import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  _id: "",
  username: "",
  email: "",
  phone: "",
  access_token: "",
  isAuthenticated: false,
  loading: false,
  error: "",
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    updateUser: (state, action) => {
      state._id = action.payload._id || "";
      state.username = action.payload.username || "";
      state.email = action.payload.email || "";
      state.phone = action.payload.phone || "";
      state.access_token = action.payload.access_token || "";
      state.isAdmin = action.payload.isAdmin || false;
      state.isAuthenticated = !!action.payload.access_token; // Đặt isAuthenticated dựa trên access_token
    },
    logout: (state) => {
      state._id = "";
      state.username = "";
      state.email = "";
      state.phone = "";
      state.isAdmin = false;
      state.isAuthenticated = false;
      state.access_token = "";
    },
  },
});

export const { updateUser, logout } = userSlice.actions;
export default userSlice.reducer;
