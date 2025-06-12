const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
router.post("/createProduct", productController.createProduct);
router.put(
  "/updateProduct/:id",
  authMiddleware,
  productController.updateProduct
);
router.get("/getDetailProduct/:id", productController.getDetailProduct);
router.delete(
  "/deleteProduct/:id",
  authMiddleware,
  productController.deleteProduct
);
router.get(
  "/getProductByCategory/:category",
  productController.getProductByCategory
);

router.get("/getAllProduct", productController.getAllProduct);
router.delete(
  "/deleteImage/:imageName",
  authMiddleware,
  productController.deleteImage
);
router.post(
  "/uploadImage",
  upload.array("images", 10),
  productController.uploadImage
);
//router.get('/category/:category',productController.getProductByCategory);
router.get("/search/:query", productController.searchProduct);

module.exports = router;
