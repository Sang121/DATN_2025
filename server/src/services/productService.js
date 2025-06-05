const Product = require("../models/productModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const createProduct = (newProduct) => {
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
  } = newProduct;

  return new Promise(async (resolve, reject) => {
    try {
      const checkProduct = await Product.findOne({
        name: name,
      });
      if (checkProduct !== null) {
        return resolve({
          status: "Err",
          message: "Product already exist",
          data: null,
        });
      }
      const createProduct = await Product.create({
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
      });
      if (createProduct) {
        return resolve({
          status: "Success",
          message: "Product created successfully",
          data: createProduct,
        });
      }
    } catch (error) {
      reject({ message: "Server error while create user", error });
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
      resolve({ status: "Ok", message: "Success", data: updateProduct });
      // }else{
      //     reject({ message: 'User created Unsuccessfully' });
      // }
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

      // Xử lý filter theo category
      if (filter) {
        query.category = filter;
      }

      // Xử lý tìm kiếm (chỉ áp dụng khi không có filter)
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

      // Đếm tổng số sản phẩm thỏa mãn điều kiện
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
  return new Prmise(async (resolve, reject) => {
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
      // }else{
      //     reject({ message: 'User created Unsuccessfully' });
      // }
    } catch (error) {
      reject({ message: "Server error when delete product", error });
    }
  });
};
const getProductByCategory = (category) => {
  return new Promise(async (resolve, reject) => {
    try {
      const existingCategory = await Product.find({
        category: category,
      });
      console.log(existingCategory);
      if (!existingCategory) {
        resolve({
          status: "Ok",
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
      console.log(productSearch);
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
};
