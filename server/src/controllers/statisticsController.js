const statisticsService = require("../services/statisticsService");

/**
 * Lấy tổng quan thống kê doanh số
 */
const getOverviewStats = async (req, res) => {
  try {
    const response = await statisticsService.getOverviewStats();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "Err",
      message: "Error retrieving overview statistics",
      error: error.message,
    });
  }
};

/**
 * Lấy doanh số theo thời gian
 */
const getRevenueByPeriod = async (req, res) => {
  try {
    const { period } = req.params; // 7days, 30days, 12months
    const response = await statisticsService.getRevenueByPeriod(period);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "Err",
      message: "Error retrieving revenue by period",
      error: error.message,
    });
  }
};

/**
 * Lấy top sản phẩm bán chạy
 */
const getTopSellingProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const response = await statisticsService.getTopSellingProducts(limit);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "Err",
      message: "Error retrieving top selling products",
      error: error.message,
    });
  }
};

/**
 * Lấy thống kê theo danh mục
 */
const getCategoryStats = async (req, res) => {
  try {
    const response = await statisticsService.getCategoryStats();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "Err",
      message: "Error retrieving category statistics",
      error: error.message,
    });
  }
};

/**
 * Lấy thống kê trạng thái đơn hàng
 */
const getOrderStatusStats = async (req, res) => {
  try {
    const response = await statisticsService.getOrderStatusStats();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "Err",
      message: "Error retrieving order status statistics",
      error: error.message,
    });
  }
};

/**
 * Lấy thống kê khách hàng
 */
const getCustomerStats = async (req, res) => {
  try {
    const response = await statisticsService.getCustomerStats();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "Err",
      message: "Error retrieving customer statistics",
      error: error.message,
    });
  }
};

/**
 * Lấy doanh số theo khoảng thời gian tùy chỉnh
 */
const getRevenueByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        status: "Err",
        message: "Both startDate and endDate are required",
      });
    }

    const response = await statisticsService.getRevenueByDateRange(startDate, endDate);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "Err",
      message: "Error retrieving revenue by date range",
      error: error.message,
    });
  }
};

/**
 * Lấy thống kê sản phẩm chi tiết
 */
const getProductAnalytics = async (req, res) => {
  try {
    const response = await statisticsService.getProductAnalytics();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "Err",
      message: "Error retrieving product analytics",
      error: error.message,
    });
  }
};

/**
 * Lấy thống kê hiệu suất bán hàng
 */
const getSalesPerformance = async (req, res) => {
  try {
    const { period } = req.query; // daily, weekly, monthly
    const response = await statisticsService.getSalesPerformance(period);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "Err",
      message: "Error retrieving sales performance",
      error: error.message,
    });
  }
};

/**
 * Lấy dashboard summary
 */
const getDashboardSummary = async (req, res) => {
  try {
    const response = await statisticsService.getDashboardSummary();
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "Err",
      message: "Error retrieving dashboard summary",
      error: error.message,
    });
  }
};

module.exports = {
  getOverviewStats,
  getRevenueByPeriod,
  getRevenueByDateRange,
  getTopSellingProducts,
  getCategoryStats,
  getOrderStatusStats,
  getCustomerStats,
  getProductAnalytics,
  getSalesPerformance,
  getDashboardSummary,
};
