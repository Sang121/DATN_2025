const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelUser = new Schema(
  {
    fullName: { type: String, require: true },
    username: { type: String, require: true },
    email: { type: String, require: true },
    password: { type: String, require: true },
    phone: { type: String, require: true },
    address: { type: String, require: true },
    isAdmin: { type: Boolean, default: false },
    access_token: { type: String, default: null },
    refresh_token: { type: String, default: null },
    avatar: { type: String, default: null },
    gender: { type: String, enum: ["male", "female", "other"] },
    typeLogin: { type: String, enum: ["email", "google"] },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", modelUser);
