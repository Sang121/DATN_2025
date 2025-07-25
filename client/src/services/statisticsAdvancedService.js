import axiosInstance from "../utils/axios";

// API để lấy doanh thu theo giờ
export const getHourlyRevenue = async (date) => {
  try {
    const response = await axiosInstance.get("/statistics/advanced/hourly-revenue", {
      params: { date },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch hourly revenue: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// API để lấy thống kê so sánh
export const getComparisonStats = async (currentStart, currentEnd, previousStart, previousEnd) => {
  try {
    const response = await axiosInstance.get("/statistics/advanced/comparison", {
      params: { currentStart, currentEnd, previousStart, previousEnd },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch comparison statistics: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// API để lấy thống kê khách hàng nâng cao
export const getAdvancedCustomerStats = async () => {
  try {
    const response = await axiosInstance.get("/statistics/advanced/advanced-customers");
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch advanced customer statistics: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};

// API để lấy xu hướng sản phẩm
export const getProductTrends = async (days = 30) => {
  try {
    const response = await axiosInstance.get("/statistics/advanced/product-trends", {
      params: { days },
    });
    return response.data;
  } catch (error) {
    throw new Error(
      `Failed to fetch product trends: ${
        error.response?.data?.message || error.message
      }`
    );
  }
};
