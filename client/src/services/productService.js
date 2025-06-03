import axiosInstance from "../utils/axios";

export const getAllProduct = async (category = "") => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/product/getAllProduct${
      category ? `?q=${category}` : ""
    }`;
    const response = await axiosInstance.get(url);
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
