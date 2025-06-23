const orderService = require("../services/orderService");
const dotenv = require("dotenv");
// Thêm biến BASE_URL ở đầu file
const BASE_URL =
  process.env.VITE_API_URL || `http://localhost:${process.env.PORT || 3001}`;

const createOrder = async (req, res) => {
  try {
    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: "Err",
        message: "No data received",
      });
    }
    const {
      items,
      shippingInfo,
      paymentMethod,
      deliveryMethod,
      itemsPrice,
      totalDiscount,
      taxPrice,
      totalPrice,
      user,
    } = req.body;
    // Validate required fields
    if (!items || !shippingInfo || !paymentMethod || !deliveryMethod || !itemsPrice  || !taxPrice || !totalPrice || !user) {
      return res.status(400).json({
        status: "Err",
        message: "Missing required fields controller",
      });
    }

    // Convert numeric fields
    const orderData = {
      items,
      shippingInfo,
      paymentMethod,
      deliveryMethod,
      itemsPrice: Number(itemsPrice),
      totalDiscount: Number(totalDiscount),
      taxPrice: Number(taxPrice),
      totalPrice: Number(totalPrice),
      user,
    };

    const response = await orderService.createOrder(orderData);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "Err",
      message: "Error creating order",
      error: error.message,
    });
  }
};
module.exports = {
  createOrder,
};
  