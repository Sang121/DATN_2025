import axiosInstance from "../utils/axios";

// API để lấy tổng quan thống kê
export const getOverviewStats = async (startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosInstance.get("/statistics/overview", {
      params
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch overview statistics: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// API để lấy doanh số theo thời gian
export const getRevenueByPeriod = async (period = "7days") => {
  try {
    const response = await axiosInstance.get(`/statistics/revenue/${period}`);
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch revenue data: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// API để lấy top sản phẩm bán chạy
export const getTopSellingProducts = async (limit = 10) => {
  try {
    const response = await axiosInstance.get("/statistics/top-products", {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch top selling products: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// API để lấy thống kê theo danh mục
export const getCategoryStats = async () => {
  try {
    const response = await axiosInstance.get("/statistics/category-stats");
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch category statistics: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// API để lấy thống kê return/refund
export const getReturnRefundStats = async (startDate, endDate) => {
  try {
    const params = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    
    const response = await axiosInstance.get("/return/admin/return-requests/stats", {
      params
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch return/refund statistics: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// API để lấy thống kê đơn hàng theo trạng thái
export const getOrderStatusStats = async () => {
  try {
    const response = await axiosInstance.get("/statistics/order-status");
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch order status statistics: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// API để lấy thống kê khách hàng
export const getCustomerStats = async () => {
  try {
    const response = await axiosInstance.get("/statistics/customer-stats");
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch customer statistics: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// API để lấy doanh thu theo khoảng thời gian tùy chỉnh
export const getRevenueByDateRange = async (startDate, endDate) => {
  try {
    const response = await axiosInstance.get("/statistics/revenue-date-range", {
      params: { startDate, endDate },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch revenue by date range: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// API để lấy thống kê sản phẩm chi tiết
export const getProductAnalytics = async () => {
  try {
    const response = await axiosInstance.get("/statistics/product-analytics");
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch product analytics: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// API để lấy hiệu suất bán hàng
export const getSalesPerformance = async (period = "monthly") => {
  try {
    const response = await axiosInstance.get("/statistics/sales-performance", {
      params: { period },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch sales performance: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// API để lấy dashboard summary
export const getDashboardSummary = async () => {
  try {
    const response = await axiosInstance.get("/statistics/dashboard-summary");
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch dashboard summary: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// Utility function để format currency
export const formatCurrency = (value) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value || 0);
};

// Utility function để format number
export const formatNumber = (value) => {
  return new Intl.NumberFormat("vi-VN").format(value || 0);
};

// Utility function để format percentage
export const formatPercentage = (value) => {
  return `${(value || 0).toFixed(2)}%`;
};
