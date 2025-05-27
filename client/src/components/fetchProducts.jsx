import axios from "axios";

export const fetchProducts = async (category = "") => {
  try {
    const url = `${import.meta.env.VITE_API_URL}/product/getAllProduct${
      category ? `?q=${category}` : ""
    }`;
    const response = await axios.get(url);
    console.log("Products fetched successfully:", response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
 export const fetchDetailProduct = async (productId) => {
  try {
    const url = `${
      import.meta.env.VITE_API_URL
    }/product/getDetailProduct/${productId}`;
    const response = await axios.get(url);
    console.log("Product detail fetched successfully:", response.data.data);
    return response.data.data; 
  } catch (error) {
    console.error(`Error fetching product detail for ID ${productId}:`, error);
    throw error; 
  }
};
export default { fetchDetailProduct, fetchProducts };
