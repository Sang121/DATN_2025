const productService = require("../services/productService");

// Thêm biến BASE_URL ở đầu file
const BASE_URL =
  process.env.VITE_API_URL || `http://localhost:${process.env.PORT || 3001}`;

const createProduct = async (req, res) => {
  try {

    // Validate request body
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        status: "Err",
        message: "No data received",
      });
    }

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
    } = req.body;

    // Validate required fields
    if (!name || !category || !gender || !price || !stock) {
      return res.status(400).json({
        status: "Err",
        message: "Missing required fields",
      });
    }

    // Convert numeric fields
    const productData = {
      name,
      category,
      gender,
      price: Number(price),
      discount: Number(discount || 0),
      stock: Number(stock),
      description: description || "",
      attributes: attributes || {},
      images: images || [],
    };


    const response = await productService.createProduct(productData);
    return res.status(200).json(response);
  } catch (error) {
    console.error("Error in createProduct controller:", error);
    return res.status(500).json({
      status: "Err",
      message: "Error creating product",
      error: error.message,
    });
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
const deleteImage = async (req, res) => {
  const imageName = req.params.imageName;
  const response = await productService.deleteImage(imageName);
  return res.status(200).json(response);
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
  deleteImage,
};
