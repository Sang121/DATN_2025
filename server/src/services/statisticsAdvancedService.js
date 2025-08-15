const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const User = require("../models/userModel");
const moment = require("moment");

/**
 * Lấy thống kê so sánh theo khoảng thời gian
 */
const getComparisonStats = (currentStart, currentEnd, previousStart, previousEnd) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Current period stats
      const currentStats = await Order.aggregate([
        {
          $match: {
            orderStatus: "delivered",
            createdAt: { $gte: new Date(currentStart), $lte: new Date(currentEnd) },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: "$totalPrice" },
            totalItems: { $sum: { $sum: "$items.amount" } },
          },
        },
      ]);

      // Previous period stats
      const previousStats = await Order.aggregate([
        {
          $match: {
            orderStatus: "delivered",
            createdAt: { $gte: new Date(previousStart), $lte: new Date(previousEnd) },
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$totalPrice" },
            orders: { $sum: 1 },
            avgOrderValue: { $avg: "$totalPrice" },
            totalItems: { $sum: { $sum: "$items.amount" } },
          },
        },
      ]);

      const current = currentStats[0] || { revenue: 0, orders: 0, avgOrderValue: 0, totalItems: 0 };
      const previous = previousStats[0] || { revenue: 0, orders: 0, avgOrderValue: 0, totalItems: 0 };

      // Calculate growth percentages (FIX: Division by zero)
      const revenueGrowth = previous.revenue > 0 ? 
        parseFloat(((current.revenue - previous.revenue) / previous.revenue * 100).toFixed(2)) : 
        (current.revenue > 0 ? 100 : 0); // Nếu previous = 0 mà current > 0 thì tăng 100%
        
      const orderGrowth = previous.orders > 0 ? 
        parseFloat(((current.orders - previous.orders) / previous.orders * 100).toFixed(2)) : 
        (current.orders > 0 ? 100 : 0);
        
      const avgOrderValueGrowth = previous.avgOrderValue > 0 ? 
        parseFloat(((current.avgOrderValue - previous.avgOrderValue) / previous.avgOrderValue * 100).toFixed(2)) : 
        (current.avgOrderValue > 0 ? 100 : 0);

      resolve({
        status: "Ok",
        message: "Comparison statistics retrieved successfully",
        data: {
          current: {
            revenue: Math.round(current.revenue),
            orders: current.orders,
            avgOrderValue: Math.round(current.avgOrderValue),
            totalItems: current.totalItems,
            period: `${moment(currentStart).format("DD/MM/YYYY")} - ${moment(currentEnd).format("DD/MM/YYYY")}`,
          },
          previous: {
            revenue: Math.round(previous.revenue),
            orders: previous.orders,
            avgOrderValue: Math.round(previous.avgOrderValue),
            totalItems: previous.totalItems,
            period: `${moment(previousStart).format("DD/MM/YYYY")} - ${moment(previousEnd).format("DD/MM/YYYY")}`,
          },
          growth: {
            revenue: revenueGrowth,
            orders: orderGrowth,
            avgOrderValue: avgOrderValueGrowth,
          },
        },
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Error retrieving comparison statistics",
        error: error.message,
      });
    }
  });
};

/**
 * Lấy thống kê xu hướng sản phẩm
 */
const getProductTrends = (days = 30) => {
  return new Promise(async (resolve, reject) => {
    try {
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const productTrends = await Order.aggregate([
        {
          $match: {
            orderStatus: "delivered",
            createdAt: { $gte: startDate },
          },
        },
        { $unwind: "$items" },
        {
          $lookup: {
            from: "products",
            localField: "items.product",
            foreignField: "_id",
            as: "productInfo",
          },
        },
        { $unwind: "$productInfo" },
        {
          $group: {
            _id: {
              productId: "$items.product",
              week: { $week: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            productName: { $first: "$productInfo.name" },
            category: { $first: "$productInfo.category" },
            weeklyUnits: { $sum: "$items.amount" },
            weeklyRevenue: { $sum: { $multiply: ["$items.amount", "$items.newPrice"] } },
          },
        },
        {
          $group: {
            _id: "$_id.productId",
            productName: { $first: "$productName" },
            category: { $first: "$category" },
            weeklyData: {
              $push: {
                week: "$_id.week",
                year: "$_id.year",
                units: "$weeklyUnits",
                revenue: "$weeklyRevenue",
              },
            },
            totalUnits: { $sum: "$weeklyUnits" },
            totalRevenue: { $sum: "$weeklyRevenue" },
          },
        },
        { $sort: { totalUnits: -1 } },
        { $limit: 10 },
      ]);

      resolve({
        status: "Ok",
        message: "Product trends retrieved successfully",
        data: productTrends.map(product => ({
          productId: product._id,
          productName: product.productName,
          category: product.category,
          totalUnits: product.totalUnits,
          totalRevenue: Math.round(product.totalRevenue),
          weeklyTrend: product.weeklyData,
        })),
        summary: {
          period: `${days} days`,
          totalProducts: productTrends.length,
        },
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Error retrieving product trends",
        error: error.message,
      });
    }
  });
};

module.exports = {
  getComparisonStats,
  getProductTrends,
};
