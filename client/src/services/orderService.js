import axios from "axios";
import axiosInstance from "../utils/axios";
import { Navigate } from "react-router-dom";

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
export const create_payment_url = async (paymentData) => {
  try {
    const response = await axios.post(
      `http://localhost:3001/order/create_payment_url`,
      paymentData
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred while fetching order.";
    console.error("Error fetching order:", errorMessage);
    throw new Error(errorMessage);
  }
};
