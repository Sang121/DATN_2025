const express = require("express");
const router = express.Router();
const statisticsController = require("../controllers/statisticsController");
const authAdminMiddleware = require("../middleware/authAdminMiddleware");

// Tất cả các endpoint thống kê chỉ dành cho admin
router.get(
  "/overview",
  authAdminMiddleware,
  statisticsController.getOverviewStats
);

router.get(
  "/dashboard-summary",
  authAdminMiddleware,
  statisticsController.getDashboardSummary
);

router.get(
  "/revenue/:period",
  authAdminMiddleware,
  statisticsController.getRevenueByPeriod
);

router.get(
  "/revenue-date-range",
  authAdminMiddleware,
  statisticsController.getRevenueByDateRange
);

router.get(
  "/top-products",
  authAdminMiddleware,
  statisticsController.getTopSellingProducts
);

router.get(
  "/product-analytics",
  authAdminMiddleware,
  statisticsController.getProductAnalytics
);

router.get(
  "/category-stats",
  authAdminMiddleware,
  statisticsController.getCategoryStats
);

router.get(
  "/order-status",
  authAdminMiddleware,
  statisticsController.getOrderStatusStats
);

router.get(
  "/customer-stats",
  authAdminMiddleware,
  statisticsController.getCustomerStats
);

router.get(
  "/sales-performance",
  authAdminMiddleware,
  statisticsController.getSalesPerformance
);

module.exports = router;
