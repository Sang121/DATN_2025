import axiosInstance from "../utils/axios";
import path from "path";
import fs from "fs/promises";

const validateId = (id) => {
  if (!id) {
    throw new Error("Invalid product ID");
  }
};

const validateCategory = (category) => {
  if (!category) {
    throw new Error("Invalid category");
  }
};

const validateQuery = (query) => {
  if (!query || typeof query !== "string") {
    throw new Error("Invalid search query");
  }
};

const validateProduct = (product) => {
  if (product.price <= 0) {
    throw new Error("Price must be greater than 0");
  }
  if (product.discount < 0 || product.discount > 100) {
    throw new Error("Discount must be between 0 and 100");
  }
  if (product.stock < 0) {
    throw new Error("Stock cannot be negative");
  }
};

const timeout = (ms) =>
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Request timeout")), ms)
  );

export const createProduct = async (productData) => {
  try {
    validateProduct(productData);
    const url = `${import.meta.env.VITE_API_URL}/product/createProduct`;
    const response = await Promise.race([
      axiosInstance.post(url, productData, {
        headers: {
          "Content-Type": "application/json",
        },
      }),
      timeout(5000),
    ]);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Failed to create product: ${
          error.response.data.message || error.message
        }`
      );
    }
    throw error;
  }
};

export const uploadImage = async (formData) => {
  try {
    if (!formData || !(formData instanceof FormData)) {
      throw new Error("Invalid form data");
    }
    const url = `${import.meta.env.VITE_API_URL}/product/uploadImage`;
    const response = await Promise.race([
      axiosInstance.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      timeout(5000),
    ]);

    if (!response.data) {
      throw new Error("Invalid response format");
    }

    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Failed to upload image: ${
          error.response.data.message || error.message
        }`
      );
    }
    throw error;
  }
};
export const updateProduct = async (id, data) => {
  try {
    validateId(id);
    const url = `${import.meta.env.VITE_API_URL}/product/updateProduct/${id}`;
    const response = await Promise.race([
      axiosInstance.put(url, data),
      timeout(5000),
    ]);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Failed to update product: ${
          error.response.data.message || error.message
        }`
      );
    }
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    validateId(id);
    const url = `${import.meta.env.VITE_API_URL}/product/deleteProduct/${id}`;
    const response = await Promise.race([
      axiosInstance.delete(url),
      timeout(5000),
    ]);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Failed to delete product: ${
          error.response.data.message || error.message
        }`
      );
    }
    throw error;
  }
};

export const getAllProduct = async (limit, page) => {
  try {
    if (!limit || !page || isNaN(limit) || isNaN(page)) {
      throw new Error("Invalid pagination parameters");
    }
    const url = `${
      import.meta.env.VITE_API_URL
    }/product/getAllProduct?limit=${limit}&page=${page}`;
    const response = await Promise.race([
      axiosInstance.get(url),
      timeout(5000),
    ]);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Failed to fetch products: ${
          error.response.data.message || error.message
        }`
      );
    }
    throw error;
  }
};

export const getDetailProduct = async (productId) => {
  try {
    validateId(productId);
    const url = `${
      import.meta.env.VITE_API_URL
    }/product/getDetailProduct/${productId}`;
    const response = await Promise.race([
      axiosInstance.get(url),
      timeout(5000),
    ]);
    return response.data.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Failed to fetch product detail: ${
          error.response.data.message || error.message
        }`
      );
    }
    throw error;
  }
};

export const getProductByCategory = async (category) => {
  try {
    validateCategory(category);
    const url = `${
      import.meta.env.VITE_API_URL
    }/product/getProductByCategory/${category}`;
    const response = await Promise.race([
      axiosInstance.get(url),
      timeout(5000),
    ]);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Failed to fetch products by category: ${
          error.response.data.message || error.message
        }`
      );
    }
    throw error;
  }
};

export const searchProduct = async (query) => {
  try {
    validateQuery(query);
    const url = `${import.meta.env.VITE_API_URL}/product/search/${query}`;
    const response = await Promise.race([
      axiosInstance.get(url),
      timeout(5000),
    ]);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        `Failed to search products: ${
          error.response.data.message || error.message
        }`
      );
    }
    throw error;
  }
};

export const deleteImage = (imageName) => {
  return new Promise(async (resolve, reject) => {
    try {
      const imagePath = path.join("../uploads", imageName);

      // Kiểm tra file có tồn tại không
      try {
        await fs.access(imagePath);
      } catch (error) {
        return resolve({
          status: "Err",
          message: "Image file not found " + error,
        });
      }

      // Xóa file
      await fs.unlink(imagePath);

      resolve({
        status: "Ok",
        message: "Image deleted successfully",
      });
    } catch (error) {
      reject({
        status: "Err",
        message: "Failed to delete image",
        error,
      });
    }
  });
};
