import axiosInstance from "../utils/axios";
export const createProduct = async (productData) => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/product/createProduct`;
    const response = await axiosInstance.post(url, productData);
    console.log("response", response);
    return response; // Trả về response.data thay vì response
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};
export const uploadImage = async (formData) => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/product/uploadImage`;
    const response = await axiosInstance.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    if (!response.data || !response.data.data) {
      throw new Error("Invalid response format");
    }

    return response.data;
  } catch (error) {
    console.error("Error uploading image:", error);
    throw error;
  }
};
export const deleteProduct = async (id) => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/product/deleteProduct${id}`;
    const response = await axiosInstance.delete(url);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
export const getAllProduct = async () => {
  try {
    let url = `${import.meta.env.VITE_API_URL}/product/getAllProduct?`;

    const response = await axiosInstance.get(url);
    console.log("response getAllProduct", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
export const getDetailProduct = async (productId) => {
  try {
    const url = `${
      import.meta.env.VITE_API_URL
    }/product/getDetailProduct/${productId}`;
    const response = await axiosInstance.get(url);
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching product detail for ID ${productId}:`, error);
    throw error;
  }
};
export const getProductByCategory = async (category) => {
  try {
    console.log("category", category);
    const url = `${
      import.meta.env.VITE_API_URL
    }/product/getProductByCategory/${category}`;
    const response = await axiosInstance.get(url);
    console.log("response getProductByCategory", response);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
export const searchProduct = async (query) => {
  try {
    const url = `${
      import.meta.env.VITE_API_URL
    }/product/search/${query}`;
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
