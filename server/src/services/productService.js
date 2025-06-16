const Product = require("../models/productModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const createProduct = (productData) => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("Creating product with data:", productData);
      // Validate required fields
      if (
        !productData.name ||
        !productData.category ||
        !productData.gender ||
        !productData.price ||
        !Array.isArray(productData.variants) ||
        !Array.isArray(productData.images)
      ) {
        return resolve({
          status: "Err",
          message: "Missing required fields",
          data: null,
        });
      }

      // Validate numeric fields
      if (isNaN(productData.price) || productData.price <= 0) {
        return resolve({
          status: "Err",
          message: "Price must be a positive number",
          data: null,
        });
      }

      if (
        isNaN(productData.discount) ||
        productData.discount < 0 ||
        productData.discount > 100
      ) {
        return resolve({
          status: "Err",
          message: "Discount must be between 0 and 100",
          data: null,
        });
      }

      if (isNaN(productData.variants.stock) < 0) {
        return resolve({
          status: "Err",
          message: "Stock must be a non-negative number",
          data: null,
        });
      }
      if (
        !productData.variants ||
        !Array.isArray(productData.variants) ||
        productData.variants.length === 0
      ) {
        return resolve({
          status: "Err",
          message: "Product variants are required",
          data: null,
        });
      }

      // Validate each variant
      for (const variant of productData.variants) {
        if (!variant.size || !variant.color || variant.stock < 0) {
          return resolve({
            status: "Err",
            message: "Invalid variant data. Size, color and stock are required",
            data: null,
          });
        }
      }
      // Check if product exists
      const checkProduct = await Product.findOne({ name: productData.name });
      if (checkProduct) {
        return resolve({
          status: "Err",
          message: "Product already exists",
          data: null,
        });
      }

      // Create product
      const createProduct = await Product.create(productData);

      if (createProduct) {
        const processedProduct = processImageUrls(createProduct);
        return resolve({
          status: "Success",
          message: "Product created successfully",
          data: processedProduct,
        });
      } else {
        throw new Error("Failed to create product - no data returned");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      reject({
        status: "Err",
        message: "Error creating product",
        error: error.message || "Unknown error occurred",
      });
    }
  });
};
const updateProduct = (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        reject({
          status: "Err",
          message: "Product not found",
          data: null,
        });
      }
      const updateProduct = await Product.findByIdAndUpdate(id, data, {
        new: true,
      });
      const processedProduct = processImageUrls(updateProduct);
      resolve({ status: "Ok", message: "Success", data: processedProduct });
    } catch (error) {
      reject({ message: "Server error while update product", error });
    }
  });
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

const getDetailProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const product = await Product.findById(id);
      if (!product) {
        reject({
          status: "Err",
          message: "Product not found",
        });
      }

      const processedProduct = processImageUrls(product);

      resolve({
        status: "Ok",
        message: "Get product success",
        data: processedProduct,
      });
    } catch (error) {
      reject({ message: "Server error while get product", error });
    }
  });
};

const getAllProduct = (limit = 8, page = 1, sort, filter, q) => {
  return new Promise(async (resolve, reject) => {
    try {
      let query = {};

      // Xử lý  theo category
      if (filter) {
        query.category = filter;
      }

      if (q && !filter) {
        query = {
          $or: [
            { name: { $regex: q, $options: "i" } },
            { category: { $regex: q, $options: "i" } },
            { gender: { $regex: q, $options: "i" } },
            { description: { $regex: q, $options: "i" } },
            { brand: { $regex: q, $options: "i" } },
            { attributes: { $regex: q, $options: "i" } },
          ],
        };
      }

      const totalProduct = await Product.countDocuments(query);

      // Lấy danh sách sản phẩm với phân trang và sắp xếp
      const allProduct = await Product.find(query)
        .limit(limit)
        .skip((page - 1) * limit)
        .sort(sort ? { [sort]: 1 } : { createdAt: -1 });

      const processedProducts = allProduct.map(processImageUrls);

      resolve({
        status: "Ok",
        message: q ? "Search product success" : "Get all product success",
        data: processedProducts,
        total: totalProduct,
        pageCurrent: page,
        totalPage: Math.ceil(totalProduct / limit),
      });
    } catch (error) {
      reject({ message: "Server error when get product", error });
    }
  });
};
const deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingProduct = await Product.findById(id);
      if (!existingProduct) {
        reject({
          status: "Err",
          message: "Product not found",
        });
      }
      await Product.findByIdAndDelete(id);

      resolve({ status: "Ok", message: "Delete product success" });
    } catch (error) {
      reject({ message: "Server error when delete product", error });
    }
  });
};
const deleteImage = (imageName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const { imageName } = req.params;
      const imagePath = path.join(__dirname, "../uploads", imageName);

      // Kiểm tra file có tồn tại không
      try {
        await fs.access(imagePath);
      } catch (error) {
        return res.status(404).json({
          status: "Err",
          message: "Image file not found",
        });
      }

      // Xóa file
      await fs.unlink(imagePath);

      res.json({
        status: "Ok",
        message: "Image deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting image:", error);
      res.status(500).json({
        status: "Err",
        message: "Failed to delete image",
      });
    }
  });
};
const getProductByCategory = (category) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingCategory = await Product.find({
        category: category,
      });
      if (!existingCategory) {
        resolve({
          status: "Err",
          message: "Category not found",
        });
      }
      const allProduct = await Product.find({
        category: category,
      });
      const processedProducts = allProduct.map(processImageUrls);

      resolve({
        status: "Ok",
        message: "Get all  product success",
        data: processedProducts,
      });
    } catch (error) {
      reject({
        message: "Server error when get get Product By Category",
        error,
      });
    }
  });
};
const searchProduct = (query) => {
  return new Promise(async (resolve, reject) => {
    try {
      const productSearch = await Product.find({
        $or: [
          { name: { $regex: query, $options: "i" } },
          { category: { $regex: query, $options: "i" } },
          { gender: { $regex: query, $options: "i" } },
          { description: { $regex: query, $options: "i" } },
          { brand: { $regex: query, $options: "i" } },
        ],
      });
      if (!productSearch) {
        resolve({
          status: "Ok",
          message: "Product not found",
        });
      }
      const processedProducts = productSearch.map(processImageUrls);

      resolve({
        status: "Ok",
        message: "Search product success",
        data: processedProducts,
      });
    } catch (error) {
      reject({ message: "Server error when search product", error });
    }
  });
};

module.exports = {
  createProduct,
  updateProduct,
  getDetailProduct,
  deleteProduct,
  getAllProduct,
  getProductByCategory,
  searchProduct,
  deleteImage,
};
