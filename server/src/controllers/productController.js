const productService = require("../services/productService");

// Thêm biến BASE_URL ở đầu file
const BASE_URL =
  process.env.VITE_API_URL || `http://localhost:${process.env.PORT || 3001}`;

const createProduct = async (req, res) => {
  try {
    const {
      name,
      category,
      gender,
      price,
      discount,
      images,
      stock,
      description,
      attributes,
      size,
      color,
      brand,
    } = req.body;
    console.log("product", req.body);

    //         const reg=/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    //         const isCheckEmail=reg.test(email);
    if (
      !name ||
      !category ||
      !gender ||
      !price ||
      !discount ||
      !images ||
      !stock ||
      !description ||
      !attributes
    ) {
      return res.status(200).json({
        status: "Err",
        message: "The input is required",
      });
    }
    const response = await productService.createProduct(req.body);
    return res
      .status(200)
      .json({ response, message: "Create product success" });
  } catch (error) {
    return res.status(500).json({ message: "Error creating product", error });
  }
};
const uploadImage = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        status: "Err",
        message: "No files uploaded",
      });
    }

    const urls = req.files.map((file) => {
      if (!file.mimetype.startsWith("image/")) {
        throw new Error("Invalid file type. Only images are allowed.");
      }
      return `/${file.filename}`;
    });

    // Bỏ resolve và reject không cần thiết
    return res.status(200).json({
      status: "Ok",
      message: "Upload image success",
      data: urls,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return res.status(500).json({
      status: "Error",
      message: "Error from server during image upload",
      error: error.message,
    });
  }
};
const updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const data = req.body;
    console.log("product");
    if (!productId) {
      return res.status(200).json({
        status: "Err",
        message: "the productId is required",
      });
    }
    const response = await productService.updateProduct(productId, data);
    return res.status(200).json(response);
  } catch (error) {
    return res
      .status(404)
      .json({ message: "Server error when update product", error });
  }
};
const processImageUrls = (product) => {
  const baseURL =
    process.env.VITE_API_URL || `http://localhost:${process.env.PORT || 3001}`;
  const productObject = product.toObject();

  if (productObject.images && productObject.images.length > 0) {
    productObject.images = productObject.images.map((imagePath) => {
      const normalizedPath = imagePath.replace(/\\/g, "/");
      return `${baseURL}/uploads/${normalizedPath}`;
    });
  }

  return productObject;
};

const getDetailProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res.status(200).json({
        status: "Err",
        message: "the productId is required",
      });
    }

    const response = await productService.getDetailProduct(productId);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: "Server error", error });
  }
};
const deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      return res.status(200).json({
        status: "Err",
        message: "the productId is required",
      });
    }

    const response = await productService.deleteProduct(productId);
    return res
      .status(200)
      .json({ response, message: "Delete product success" });
  } catch (error) {
    return res.status(404).json({ message: "Server error", error });
  }
};
const getAllProduct = async (req, res) => {
  try {
    let { limit, page, sort, filter, q } = req.query;
    limit = limit ? Number(limit) : 8;
    page = page ? Number(page) : 1;

    const response = await productService.getAllProduct(
      limit,
      page,
      sort,
      filter,
      q
    );
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: "Server error", error });
  }
};
const getProductByCategory = async (req, res) => {
  const category = req.params.category;
  try {
    const response = await productService.getProductByCategory(category);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: "Server error", error });
  }
};
const searchProduct = async (req, res) => {
  const query = req.params.query;
  try {
    const response = await productService.searchProduct(query);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(404).json({ message: "Server error", error });
  }
};

module.exports = {
  createProduct,
  updateProduct,
  getDetailProduct,
  deleteProduct,
  getAllProduct,
  uploadImage,
  getProductByCategory,
  searchProduct,
};
