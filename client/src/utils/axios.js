import axios from "axios";
import { jwtDecode } from "jwt-decode";
import Store from "../redux/store";
import { updateUser, logout } from "./../redux/slices/userSlice";
import { refreshToken as callRefreshTokenAPI } from "./../services/userService";
import { message } from "antd";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Request Interceptor
axiosInstance.interceptors.request.use(
  async (config) => {
    // Lấy user state hiện tại từ Redux store.
    // currentUser ở đây là toàn bộ slice state của user (ví dụ: { user: {...}, isLoading: false, error: null })
    let currentUserState = Store.getState().user;
    // Lấy access_token từ thuộc tính 'user' trong currentUserState, sau đó là từ sessionStorage
    let accessToken =
      currentUserState?.user?.access_token ||
      sessionStorage.getItem("access_token");

    console.log(
      "Current access token (from redux/sessionStorage):",
      accessToken
    );

    // Bỏ qua interceptor này cho yêu cầu làm mới token để tránh vòng lặp vô hạn
    if (config.url === "/user/refreshToken") {
      return config;
    }

    if (accessToken) {
      try {
        const decodedAccessToken = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;

        if (decodedAccessToken.exp < currentTime + 5) {
          console.warn(
            "Access Token expired or about to expire. Attempting to refresh..."
          );

          // Sử dụng _retry flag để chỉ cho phép thử làm mới token một lần duy nhất cho mỗi request
          if (!config._retry) {
            config._retry = true; // Mark the request as retried
            try {
              // GỌI HÀM REFRESH TOKEN TỪ userService.js ĐÃ IMPORT
              const response = await callRefreshTokenAPI();
              console.log("Response when refreshing token:", response);

              // Backend của bạn nên trả về một object có access_token bên trong
              const newAccessToken = response?.access_token;

              if (newAccessToken) {
                console.log(
                  "New access token successfully received from refresh API."
                );

                // Cập nhật Redux store: Chỉ cập nhật thuộc tính 'user' bên trong state user
                Store.dispatch(
                  updateUser({
                    ...currentUserState.user,
                    // Cập nhật access_token mới
                    access_token: newAccessToken,
                  })
                );
                // Cập nhật sessionStorage
                sessionStorage.setItem("access_token", newAccessToken);

                // Cập nhật Authorization header cho request hiện tại
                config.headers.token = `Bearer ${newAccessToken}`;
              } else {
                console.error(
                  "No valid new access token received from refresh API. Logging out."
                );
                // Nếu không có token mới, coi như làm mới thất bại và đăng xuất
                throw new Error("No new access token after refresh.");
              }
            } catch (e) {
              console.error(
                "Failed to refresh token in request interceptor:",
                e
              );
              // Đăng xuất và clear session khi không thể làm mới token
              Store.dispatch(logout());
              Cookies.remove("refresh_token");
              message.error(
                "Phiên đăng nhập đã hết hạn hoặc không thể làm mới. Vui lòng đăng nhập lại."
              );
              sessionStorage.clear();
              window.location.href = "/login";
              // Từ chối request ban đầu
              return Promise.reject(e);
            }
          } else {
            console.error(
              "Request already retried for token refresh. Preventing infinite loop."
            );
            return Promise.reject(
              new Error("Request retry limit reached for token refresh.")
            );
          }
        } else {
          // Access Token vẫn còn hạn, thêm vào header
          config.headers.token = `Bearer ${accessToken}`;
        }
      } catch (error) {
        console.error(
          "Error processing access token (decode or initial check):",
          error
        );
        Store.dispatch(logout());
        Cookies.remove("refresh_token");
        message.error("Lỗi xác thực. Vui lòng đăng nhập lại.");
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(error);
      }
    }
    // Nếu không có access token nào (ví dụ: người dùng chưa đăng nhập), request sẽ đi mà không có token
    // Server sẽ xử lý việc từ chối 401 nếu API yêu cầu xác thực
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
axiosInstance.interceptors.response.use(
  (response) => response, 
  async (error) => {
    const originalRequest = error.config;

    if (!error.response) {
      console.error("Network Error: Unable to connect to the server.", error);
      message.error("Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.");
      return Promise.reject(
        new Error("Network Error: Unable to connect to the server.")
      );
    }

    // Nếu lỗi là 401 (Unauthorized) và request chưa được thử lại sau khi refresh
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Đánh dấu là đã thử lại

      try {
        console.warn(
          "Received 401 Unauthorized. Attempting to refresh token from response interceptor..."
        )
        // GỌI HÀM REFRESH TOKEN TỪ userService.js ĐÃ IMPORT
        const response = await callRefreshTokenAPI();
        console.log("Response after 401 refresh attempt:", response);

        const newAccessToken = response?.access_token; // Lấy access_token từ object phản hồi

        if (newAccessToken) {
          console.log(
            "Successfully refreshed token after 401. Retrying original request."
          );
          // Cập nhật Redux store và sessionStorage
          Store.dispatch(
            updateUser({
              ...Store.getState().user.user, 
              access_token: newAccessToken,
            })
          );
          sessionStorage.setItem("access_token", newAccessToken);

          // Cập nhật Authorization header cho request ban đầu và gửi lại
          originalRequest.headers.token = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest); 
        } else {
          console.error("No new access token after 401 refresh. Logging out.");
          throw new Error("No new access token from refresh after 401.");
        }
      } catch (refreshError) {
        console.error(
          "Failed to refresh token after 401 or refresh_token is invalid:",
          refreshError
        );
        // Đăng xuất và clear session khi không thể làm mới token
        Store.dispatch(logout());
        Cookies.remove("refresh_token");
        message.error(
          "Phiên đăng nhập đã hết hạn hoặc không thể làm mới. Vui lòng đăng nhập lại."
        );
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    
    console.error("API error:", error.response?.data || error.message);

    return Promise.reject(error);
  }
);

export default axiosInstance;
