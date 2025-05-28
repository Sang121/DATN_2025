import axiosInstance from "../utils/axios"; // Đảm bảo đã import axiosInstance
//import axios from "axios"; // Import axios để sử dụng trong các hàm khác
import { message as antdMessage } from "antd"; // Import Ant Design message for error handling
export const signInUser = async (credentials) => {
  try {
    // SỬ DỤNG axiosInstance và BỎ baseURL khỏi đường dẫn
    const response = await axiosInstance.post(
      `/user/signin`, // BaseURL đã được cấu hình trong axiosInstance
      credentials // credentials là đối tượng chứa thông tin đăng nhập (email, password)
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred during sign in.";
    console.error("Error during sign in:", errorMessage);
    throw new Error(errorMessage);
  }
};

export const signUpUser = async (userData) => {
  try {
    // SỬ DỤNG axiosInstance và BỎ baseURL khỏi đường dẫn
    const response = await axiosInstance.post(
      `/user/signup`, // BaseURL đã được cấu hình trong axiosInstance
      userData
    );
    console.log("Sign up response:", response.data);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred during sign up.";
    console.error(errorMessage);
    antdMessage.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// Hàm getDetailUser: Đã đúng, đang dùng axiosInstance
export const getDetailUser = async (userId, token) => {
  try {
    const response = await axiosInstance.get(
      `/user/getDetailUser/${userId}`,
      { headers: { token: `Bearer ${token}` } }
    );
    console.log("User details fetched successfully:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching user details for ID ${userId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// Hàm logoutUser: Đã đúng, đang dùng axiosInstance
export const logoutUser = async (userId) => {
  try {
    const response = await axiosInstance.post(
      `/user/logout`,
      { userId }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error logging out user with ID ${userId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const refreshToken = async () => {
  try {
    const response = await axiosInstance.get(
      `/user/refreshToken`
    );
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred during refresh token.";
    console.error("Error refreshing token:", errorMessage);
    throw new Error(errorMessage);
  }
};
