const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const createOrder = (orderData) => {
  return new Promise(async (resolve, reject) => {
    try {
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
      } // Validate each item
      for (const item of orderData.items) {
        if (
          !item.id ||
          !item.name ||
          !item.price ||
          !item.amount ||
          !item.product
        ) {
          return reject({
            status: "Err",
            message:
              "Invalid item data. ID, name, price, amount and product are required",
            data: null,
          });
        }

        // Validate variant information
        if (!item.variant || !item.variant.size || !item.variant.color) {
          return reject({
            status: "Err",
            message: "Invalid variant data. Size and color are required",
            data: null,
          });
        }
      }

      // Cập nhật stock và sold của product variants
      await updateProductStock(orderData.items);

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
      reject({
        status: "Err",
        message: "Error creating order",
        error: error.message || "Unknown error occurred",
      });
    }
  });
};
// Hàm cập nhật stock và sold của product variants
const updateProductStock = async (orderItems) => {
  try {
    // BƯỚC 1: Kiểm tra stock trước khi cập nhật
    for (const item of orderItems) {
      // Tìm product chứa variant
      const product = await Product.findById(item.product);

      if (!product) {
        throw new Error(`Product ${item.product} not found`);
      }

      // Tìm variant bằng size + color thay vì ID
      const variant = product.variants.find(
        (v) => v.size === item.variant.size && v.color === item.variant.color
      );

      if (!variant) {
        product.variants.forEach((v, index) => {});
        throw new Error(
          `Variant (${item.variant.size}, ${item.variant.color}) not found in product ${item.product}`
        );
      }

      // Kiểm tra stock trước khi trừ
      if (variant.stock < item.amount) {
        throw new Error(
          `Insufficient stock for ${item.name} - ${variant.size} ${variant.color}. Available: ${variant.stock}, Requested: ${item.amount}`
        );
      }
    } // BƯỚC 2: Cập nhật stock và sold sau khi đã validate
    for (const item of orderItems) {
      const product = await Product.findOneAndUpdate(
        {
          _id: item.product,
          "variants._id": item.id,
        },
        {
          $inc: {
            "variants.$.stock": -item.amount, // Giảm stock
            "variants.$.sold": +item.amount, // Tăng sold
            totalStock: -item.amount, // Giảm totalStock
            sold: +item.amount, // Tăng sold tổng
          },
        },
        { new: true }
      );

      if (!product) {
        throw new Error(
          `Failed to update product ${item.product} ${item.variant._id} variant (${item.variant.size}, ${item.variant.color})`
        );
      }
    }

    // Cập nhật totalStock và sold cho tất cả products bị ảnh hưởng
    const productIds = [...new Set(orderItems.map((item) => item.product))];

    for (const productId of productIds) {
      await Product.findByIdAndUpdate(productId, {});
    }
  } catch (error) {
    throw new Error(`Error updating product stock: ${error.message}`);
  }
};

module.exports = {
  createOrder,
};
