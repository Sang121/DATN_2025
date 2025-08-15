const statisticsAdvancedService = require("../services/statisticsAdvancedService");

/**
 * Lấy thống kê so sánh
 */
const getComparisonStats = async (req, res) => {
  try {
    const { currentStart, currentEnd, previousStart, previousEnd } = req.query;
    
    if (!currentStart || !currentEnd || !previousStart || !previousEnd) {
      return res.status(400).json({
        status: "Err",
        message: "All date parameters are required (currentStart, currentEnd, previousStart, previousEnd)",
      });
    }

    const response = await statisticsAdvancedService.getComparisonStats(
      currentStart, currentEnd, previousStart, previousEnd
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "Err",
      message: "Error retrieving comparison statistics",
      error: error.message,
    });
  }
};

/**
 * Lấy xu hướng sản phẩm
 */
const getProductTrends = async (req, res) => {
  try {
    const { days } = req.query;
    const response = await statisticsAdvancedService.getProductTrends(days ? parseInt(days) : 30);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({
      status: "Err",
      message: "Error retrieving product trends",
      error: error.message,
    });
  }
};

module.exports = {
  getComparisonStats,
  getProductTrends,
};
