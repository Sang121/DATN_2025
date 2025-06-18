const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const authMiddleware = require("../middleware/authMiddleware");
const authUserMiddleware = require("../middleware/authUserMiddleware");
router.post("/createOrder", authUserMiddleware, orderController.createOrder);
module.exports = router;
