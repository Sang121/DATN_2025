import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Store from "../redux/store";
import { updateUser, logout } from "./../redux/slices/userSlice";
import { refreshToken as callRefreshTokenAPI } from "./../services/userService";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

console.log("Axios Base URL:", import.meta.env.VITE_API_URL);

// Request Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    let currentUser = Store.getState().user;
    let accessToken = currentUser?.access_token;
    const refreshToken = sessionStorage.getItem("refresh_token");

    if (accessToken) {
      try {
        const decodedAccessToken = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000; // Thời gian hiện tại tính bằng giây

        // Nếu Access Token hết hạn (hoặc sắp hết hạn, ví dụ: trong 5 giây cuối)
        if (decodedAccessToken.exp < currentTime + 5) {
          console.log(
            "Access Token expired or about to expire. Attempting to refresh..."
          );
          if (refreshToken) {
            const response = await callRefreshTokenAPI(refreshToken); // Gọi API refreshToken
            const newAccessToken = response.access_token;
            const newRefreshToken = response.refresh_token; // Nếu backend trả về refresh token mới

            // Cập nhật Redux store và sessionStorage với token mới
            Store.dispatch(
              updateUser({ ...currentUser, access_token: newAccessToken })
            );
            sessionStorage.setItem("access_token", newAccessToken);
            if (newRefreshToken) {
              sessionStorage.setItem("refresh_token", newRefreshToken);
            }

            // Cập nhật header Authorization cho request hiện tại
            config.headers.token = `Bearer ${newAccessToken}`;
          } else {
            console.error("No refresh token available. Logging out user.");
            Store.dispatch(logout());
            sessionStorage.clear();
            window.location.href = "/login";
            return Promise.reject(new Error("No refresh token available"));
          }
        } else {
          // Access Token vẫn còn hạn, thêm vào header
          config.headers.token = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.error(
          "Error decoding access token or refreshing token:",
          error
        );
        Store.dispatch(logout());
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (tùy chọn, để xử lý lỗi 401 chung)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!error.response) {
      console.error("Network Error: Unable to connect to the server.", error);
      return Promise.reject(
        new Error("Network Error: Unable to connect to the server.")
      );
    }

    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu đã thử lại một lần
      const refreshToken = sessionStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const response = await callRefreshTokenAPI(refreshToken);
          const newAccessToken = response.access_token;
          const newRefreshToken = response.refresh_token;

          Store.dispatch(
            updateUser({
              ...Store.getState().user,
              access_token: newAccessToken,
            })
          );
          sessionStorage.setItem("access_token", newAccessToken);
          if (newRefreshToken) {
            sessionStorage.setItem("refresh_token", newRefreshToken);
          }

          // Thử lại request ban đầu với Access Token mới
          originalRequest.headers.token = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        } catch (refreshError) {
          console.error("Failed to refresh token on 401 retry:", refreshError);
          Store.dispatch(logout());
          sessionStorage.clear();
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
      } else {
        console.error(
          "No refresh token available on 401 error. Logging out user."
        );
        Store.dispatch(logout());
        sessionStorage.clear();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
