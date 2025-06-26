const express = require("express");
const router = express.Router();
const ChatbotController = require("../controllers/ChatbotController");
const authMiddleware = require("../middleware/authAdminMiddleware");

router.post("/UserChatbot", ChatbotController.UserChatbot);
router.post("/AdminChatbot", authMiddleware, ChatbotController.AdminChatbot);

module.exports = router;
