const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const CreateDetailController = require("../controllers/CreateDetailController");
const authAdminMiddleware = require("../middleware/authAdminMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
router.post(
  "/createProduct",
  authAdminMiddleware,
  productController.createProduct
);
router.put(
  "/updateProduct/:id",
  authAdminMiddleware,
  productController.updateProduct
);
router.get("/getDetailProduct/:id", productController.getDetailProduct);
router.delete(
  "/deleteProduct/:id",
  authAdminMiddleware,
  productController.deleteProduct
);
router.get(
  "/getProductByCategory/:category",
  productController.getProductByCategory
);

router.get("/getAllProduct", productController.getAllProduct);
router.delete(
  "/deleteImage/:imageName",
  authAdminMiddleware,
  productController.deleteImage
);
router.post(
  "/uploadImage",
  upload.array("images", 10),
  productController.uploadImage
);
//router.get('/category/:category',productController.getProductByCategory);
router.get("/search/:query", productController.searchProduct);
router.get("/bestSeller", productController.bestSellerProduct);
router.post("/createCategory", CreateDetailController.createCategory);

module.exports = router;
