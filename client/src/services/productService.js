import axiosInstance from "../utils/axios";
export const createProduct = async (productData) => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/product/createProduct`;
    const response = await axiosInstance.post(url, productData);
    return response;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
export const uploadImage = async (formData) => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/product/uploadImage`;
    const response = await axiosInstance.post(url, formData);
console.log('response.data',response.data) ;
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
export const getAllProduct = async (category = "") => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/product/getAllProduct${
      category ? `?q=${category}` : ""
    }`;
    const response = await axiosInstance.get(url);
    console.log("dâtta", response.data.data);
    return response.data.data;
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
