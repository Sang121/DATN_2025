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
export const addFavorite = async (productId) => {
  try {
    const response = await axiosInstance.post(
      `/user/add-favorite/${productId}`
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error adding favorite for ${productId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
export const removeFavorite = async (productId) => {
  try {
    const response = await axiosInstance.post(
      `/user/remove-favorite/${productId}`,
      {
        productId,
      }
    );
    return response.data;
  } catch (error) {
    console.error(
      `Error removing favorite for ${productId}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};

export const addToCart = async (productId, variantId, amount) => {
  try {
    const response = await axiosInstance.post(`/user/addToCart`, {
      productId,
      variantId,
      amount,
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error adding product ${productId} to cart with amount ${amount}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
export const updateCartItem = async (id, amount) => {
  try {
    const response = await axiosInstance.put(`/user/updateCartItem`, {
      id,
      amount,
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error updating product ${id} in cart with amount ${amount}:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
export const removeFromCart = async (id) => {
  try {
    const response = await axiosInstance.delete(`/user/removeFromCart`, {
      data: { id },
    });
    return response.data;
  } catch (error) {
    console.error(
      `Error removing product ${id} from cart:`,
      error.response?.data || error.message
    );
    throw error;
  }
};
