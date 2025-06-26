import axiosInstance from "../utils/axios";

export const UserChatbot = async (data) => {
  try {
    const response = await axiosInstance.post(`ai/UserChatbot`, data);
    console.log("Chatbot response:", response.data);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred while communicating with the AI chatbot.";
    console.error("Error in AI chatbot service:", errorMessage);
    throw new Error(errorMessage);
  }
};
export const AdminChatbot = async (data) => {
  try {
    const response = await axiosInstance.post(`ai/AdminChatbot`, data);
    console.log("Chatbot response:", response.data);
    return response.data;
  } catch (error) {
    const errorMessage =
      error.response?.data?.message ||
      error.message ||
      "Unknown error occurred while communicating with the AI chatbot.";
    console.error("Error in AI chatbot service:", errorMessage);
    throw new Error(errorMessage);
  }
};
