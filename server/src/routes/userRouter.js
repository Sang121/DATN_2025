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

  userController.getDetailUser
);
router.get("/refreshToken", userController.refreshToken);
router.get("/check-token", authUserMiddleware, userController.checkToken);
router.post(
  "/add-favorite/:productId",
  authUserMiddleware,
  userController.addFavorite
);
router.get("/getFavorite/", authUserMiddleware, userController.getFavorite);
router.post(
  "/remove-favorite/:productId",
  authUserMiddleware,
  userController.removeFavorite
);
router.get("/getCart/:userId", authUserMiddleware, userController.getCart);
router.post("/addToCart", authUserMiddleware, userController.addToCart);
router.put("/updateCartItem", authUserMiddleware, userController.updateCart);
router.delete(
  "/removeFromCart",
  authUserMiddleware,
  userController.removeFromCart
);

module.exports = router;
