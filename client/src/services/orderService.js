import axiosInstance from "../utils/axios";

export const createOrder = async (orderData) => {
  try {
    const response = await axiosInstance.post(`/order/createOrder`, orderData);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred during order creation.";
    console.error("Error during order creation:", errorMessage);
    throw new Error(errorMessage);
  }
};
