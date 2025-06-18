const Order = require("../models/orderModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const createOrder = (orderData) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Creating order with data:");
      // Validate required fields
      if (
        !orderData.items ||
        !orderData.shippingInfo ||
        !orderData.paymentMethod ||
        !orderData.deliveryMethod ||
        !orderData.itemsPrice ||
        !orderData.taxPrice ||
        !orderData.totalPrice ||
        !orderData.user
      ) {
        return reject({
          status: "Err",
          message: "Missing required fields service",
          data: null,
        });
      }

      // Validate numeric fields
      if (isNaN(orderData.itemsPrice) || orderData.itemsPrice <= 0) {
        return reject({
          status: "Err",
          message: "Price must be a positive number",
          data: null,
        });
      }

      if (isNaN(orderData.taxPrice) || orderData.taxPrice < 0) {
        return reject({
          status: "Err",
          message: "Tax must be a positive number",
          data: null,
        });
      }


      if (
        !orderData.items ||
        !Array.isArray(orderData.items) ||
        orderData.items.length === 0
      ) {
        return reject({
          status: "Err",
          message: "Products are required",
          data: null,
        });
      }

      // Validate each item
      for (const item of orderData.items) {
        if (!item.id || !item.name || !item.price || !item.amount) {
          return reject({
            status: "Err",
            message:
              "Invalid item data. ID, name, price and amount are required",
            data: null,
          });
        }
      }

      // Create order
      const createOrder = await Order.create(orderData);

      if (createOrder) {
        return resolve({
          status: "Success",
          message: "Order created successfully",
          data: createOrder,
        });
      } else {
        throw new Error("Failed to create order - no data returned");
      }
    } catch (error) {
      console.error("Error creating order:");
      reject({
        status: "Err",
        message: "Error creating order",
        error: error.message || "Unknown error occurred",
      });
    }
  });
};

module.exports = {
  createOrder,
};
