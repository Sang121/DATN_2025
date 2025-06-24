const express = require("express");
const router = express.Router();
const userController = require("../controllers/UserController");
const authAdminMiddleware = require("../middleware/authAdminMiddleware");
const authUserMiddleware = require("../middleware/authUserMiddleware");
router.post("/signin", userController.loginUser);
router.post("/signup", userController.createUser);
router.post("/logout", userController.logoutUser);
router.put("/update-user/:id", userController.updateUser);
router.delete(
  "/delete-user/:id",
  authAdminMiddleware,
  userController.deleteUser
);
router.get("/getAllUser", authAdminMiddleware, userController.getAllUser);
router.get(
  "/getDetailUser/:id",
  authUserMiddleware,
  userController.getDetailUser
);
router.get("/refreshToken", userController.refreshToken);
router.get("/check-token", authUserMiddleware, userController.checkToken);

module.exports = router;
