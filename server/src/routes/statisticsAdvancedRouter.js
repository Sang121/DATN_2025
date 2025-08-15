const express = require("express");
const router = express.Router();
const statisticsAdvancedController = require("../controllers/statisticsAdvancedController");
const authAdminMiddleware = require("../middleware/authAdminMiddleware");

// Advanced statistics endpoints - chỉ dành cho admin
router.get(
  "/comparison",
  authAdminMiddleware,
  statisticsAdvancedController.getComparisonStats
);

router.get(
  "/product-trends",
  authAdminMiddleware,
  statisticsAdvancedController.getProductTrends
);

module.exports = router;
