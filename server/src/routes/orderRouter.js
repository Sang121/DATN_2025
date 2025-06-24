const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authAdminMiddleware = require("../middleware/authAdminMiddleware");
const authUserMiddleware = require("../middleware/authUserMiddleware");

router.post("/createOrder", authUserMiddleware, orderController.createOrder);
router.get(
  "/getOrdersByUserId/:userId",
  authUserMiddleware,
  orderController.getOrdersByUserId
);
router.get(
  "/getOrderDetails/:orderId",
  authUserMiddleware,
  orderController.getOrderDetails
);
router.get(
  "/getAllOrders",
  authAdminMiddleware,
  (req, res, next) => {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ status: "Err", message: "Forbidden: Admins only" });
    }
    next();
  },
  orderController.getAllOrders
);

router.get(
  "/getOrdersCount/:userId",
  authUserMiddleware,
  orderController.getOrdersCount
);

router.put(
  "/cancelOrder/:orderId",
  authUserMiddleware,
  orderController.cancelOrder
);

router.put(
  "/updateOrderStatus/:orderId",
  authAdminMiddleware,
  (req, res, next) => {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ status: "Err", message: "Forbidden: Admins only" });
    }
    next();
  },
  orderController.updateOrderStatus
);

router.put(
  "/updatePaymentStatus/:orderId",
  authAdminMiddleware,
  (req, res, next) => {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ status: "Err", message: "Forbidden: Admins only" });
    }
    next();
  },
  orderController.updatePaymentStatus
);

// VNPAY routes
router.post("/create_payment_url", orderController.createPaymentUrl);
router.get("/vnpay_return", orderController.vnpayReturn);
router.get("/vnpay_ipn", orderController.vnpayIpn);
router.post("/vnpay_ipn", orderController.vnpayIpn); // Thêm route POST cho IPN
router.post(
  "/updateOrderAfterPayment",
  authUserMiddleware,
  orderController.updateOrderAfterPaymentClient
);

module.exports = router;
