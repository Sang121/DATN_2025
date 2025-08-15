const express = require('express');
const router = express.Router();
const Order = require('../models/orderModel');

// Test endpoint để kiểm tra đơn hàng delivered
router.get('/test/delivered-orders', async (req, res) => {
  try {
    const orders = await Order.find({ 
      $or: [
        { isDelivered: true },
        { orderStatus: 'delivered' }
      ]
    }).populate('items.product').limit(5);

    res.json({
      success: true,
      count: orders.length,
      data: orders.map(order => ({
        _id: order._id,
        isDelivered: order.isDelivered,
        orderStatus: order.orderStatus,
        deliveredAt: order.deliveredAt,
        user: order.user,
        totalPrice: order.totalPrice,
        paymentMethod: order.paymentMethod,
        items: order.items.length
      }))
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test endpoint để cập nhật đơn hàng thành delivered
router.put('/test/mark-delivered/:orderId', async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.orderId,
      {
        isDelivered: true,
        orderStatus: 'delivered',
        deliveredAt: new Date()
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order marked as delivered',
      data: order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
