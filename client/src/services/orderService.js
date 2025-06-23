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

export const getOrdersByUserId = async (userId, limit = 5, page = 0) => {
  try {
    const url = `${
      import.meta.env.VITE_API_URL
    }/order/getOrdersByUserId/${userId}?limit=${limit}&page=${page}`;
    const response = await Promise.race([axiosInstance.get(url)]);
    console.log("Orders fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred while fetching orders.";
    console.error("Error fetching orders:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const getOrderDetails = async (orderId) => {
  try {
    const response = await axiosInstance.get(
      `/order/getOrderDetails/${orderId}`
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred while fetching order details.";
    console.error("Error fetching order details:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const getAllOrders = async (limit = 10, page = 0) => {
  try {
    const response = await axiosInstance.get(
      `/order/getAllOrders?limit=${limit}&page=${page}`
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred while fetching all orders.";
    console.error("Error fetching all orders:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const cancelOrder = async (orderId) => {
  try {
    const response = await axiosInstance.put(`/order/cancelOrder/${orderId}`);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred while cancelling the order.";
    console.error("Error cancelling order:", errorMessage);
    throw new Error(errorMessage);
  }
};
