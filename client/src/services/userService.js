import axios from "axios";
import axiosInstance from "../utils/axios";
export const signInUser = async (credentials) => {
  try {
    const response = await axiosInstance.post(`/user/signin`, credentials);
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

// Hàm signUpUser
export const signUpUser = async (userData) => {
  try {
    const response = await axiosInstance.post(`/user/signup`, userData);
    console.log("Sign up response:", response.data);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred during sign up.";
    console.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// Hàm getDetailUser
export const getDetailUser = async (userId) => {
  try {
    const response = await axiosInstance.get(`/user/getDetailUser/${userId}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching user details for ID ${userId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

// Hàm logoutUser
export const logoutUser = async (userId) => {
  try {
    const response = await axiosInstance.post(`/user/logout`, { userId });
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
    const response = await axiosInstance.get(`/user/refreshToken`);
    console.log("Token refreshed successfully (userService):", response.data);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred during refresh token.";
    console.error("Error refreshing token (userService):", errorMessage);
    throw error;
  }
};

export const updateUser = async (userId, userData) => {
  console.log("id", userId, "data", userData);
  try {
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/user/update-user/${userId}`,
      userData
    );

    return response.data;
  } catch (error) {
    console.error(
      `Error updating user with ID ${userId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
export const getAllUser = async () => {
  try {
    const response = await axiosInstance.get(`/user/getAllUser`);
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error(
      `Error fetching user  :`,
      error.response?.data || error.message
    );
    throw error;
  }
};
export const deleteUser = async (userId) => {
 try {
    const response = await axiosInstance.delete(
      `/user/delete-user/${userId.id}`
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error(
      `Error delete user  :`,
      error.response?.data || error.message
    );
    throw error;
  }
};
