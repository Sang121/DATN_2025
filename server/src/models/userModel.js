const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelUser = new Schema(
  {
    fullName: { type: String },
    username: { type: String },
    email: { type: String },
    password: { type: String },
    phone: { type: String },
    address: { type: String },
    isAdmin: { type: Boolean, default: false },
    cart: [
      {
        _id: false,
        id: {
          type: String,
          required: true,
        },
        product: {
          type: String,
          required: true,
        },

        name: { type: String },

        amount: {
          type: Number,
          required: true,
          default: 1,
        },
        originalPrice: { type: Number, required: true },
        image: { type: String, required: true },

        newPrice: { type: Number, required: true },
        isDiscount: { type: Boolean, default: false },
        variant: {
          _id: {
            type: mongoose.Schema.Types.ObjectId,

            ref: "Order",
          }, // ID của biến thể sản phẩm
          size: { type: String, required: true },
          color: { type: String, required: true },
          stock: { type: Number, required: true },
        },
      },
    ],
    favorite: { default: [], type: Array, ref: "Product" },
    access_token: { type: String, default: null },
    refresh_token: { type: String, default: null },
    avatar: { type: String, default: null },
    gender: { type: String, enum: ["male", "female", "other"] },
    typeLogin: { type: String, enum: ["Email", "Google"] },
    totalOrder: { type: Number, default: 0 },
    isAuthenticated: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", modelUser);
