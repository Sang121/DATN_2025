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

// Global variable để tracking refresh token process
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

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

    // console.log(
    //   "Current access token (from redux/sessionStorage):",
    //   accessToken
    // );

    // Bỏ qua interceptor này cho yêu cầu làm mới token để tránh vòng lặp vô hạn
    if (config.url === "/user/refreshToken") {
      return config;
    }

    if (accessToken) {
      try {
        const decodedAccessToken = jwtDecode(accessToken);
        const currentTime = Date.now() / 1000;

        if (decodedAccessToken.exp < currentTime + 5) {
          // Token sắp hết hạn hoặc đã hết hạn

          // Nếu đang refresh, thêm request vào queue
          if (isRefreshing) {
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                config.headers.token = `Bearer ${token}`;
                // Thêm userId từ Redux store mới nhất
                const currentUserState = Store.getState().user;
                const userId = currentUserState?.user?._id;
                if (userId) {
                  config.headers.userId = `${userId}`;
                }
                return config;
              })
              .catch((err) => {
                return Promise.reject(err);
              });
          }

          // Đánh dấu đang refresh
          isRefreshing = true;

          try {
            // GỌI HÀM REFRESH TOKEN TỪ userService.js ĐÃ IMPORT
            const response = await callRefreshTokenAPI();
            console.log("Response when refreshing token:", response);

            // Backend của bạn nên trả về một object có access_token bên trong
            const newAccessToken = response?.access_token;
            const newUser = response.newUser;

            if (newAccessToken) {
              console.log(
                "New access token successfully received from refresh API."
              );

              // Cập nhật Redux store: Chỉ cập nhật thuộc tính 'user' bên trong state user
              Store.dispatch(
                updateUser({
                  _id: newUser._id,
                  username: newUser.username,
                  fullName: newUser.fullName,
                  avatar: newUser.avatar,
                  address: newUser.address,
                  email: newUser.email,
                  phone: newUser.phone,
                  isAdmin: newUser.isAdmin,
                  gender: newUser.gender,
                  isAuthenticated: newUser.isAuthenticated,
                  loading: newUser.loading,
                  access_token: newAccessToken,
                })
              );

              // Cập nhật sessionStorage
              sessionStorage.setItem("access_token", newAccessToken);

              // Cập nhật Authorization header cho request hiện tại
              config.headers.token = `Bearer ${newAccessToken}`;

              // Cập nhật userId header cho request hiện tại
              const userId = newUser?._id;
              if (userId) {
                config.headers.userId = `${userId}`;
                console.log(
                  `Added userId to request headers after refresh: ${userId} for URL: ${config.url}`
                );
              }

              // Process queued requests
              processQueue(null, newAccessToken);
            } else {
              console.error(
                "No valid new access token received from refresh API. Logging out."
              );
              processQueue(
                new Error("No new access token after refresh."),
                null
              );
              throw new Error("No new access token after refresh.");
            }
          } catch (e) {
            console.error("Failed to refresh token in request interceptor:", e);
            processQueue(e, null);

            // Đăng xuất và clear session khi không thể làm mới token
            Store.dispatch(logout());
            Cookies.remove("refresh_token");
            message.error(
              "Phiên đăng nhập đã hết hạn hoặc không thể làm mới. Vui lòng đăng nhập lại."
            );
            sessionStorage.clear();

            // Từ chối request ban đầu
            return Promise.reject(e);
          } finally {
            isRefreshing = false;
          }
        } else {
          // Access Token vẫn còn hạn, thêm vào header
          config.headers.token = `Bearer ${accessToken}`;

          // Lấy userId từ đúng cấu trúc Redux: currentUserState.user._id
          const userId = currentUserState?.user?._id;
          console.log("currentUserState", currentUserState);

          if (userId) {
            config.headers.userId = `${userId}`;
            console.log(
              `Added userId to request headers: ${userId} for URL: ${config.url}`
            );
          } else {
            console.warn(`No userId available for request to: ${config.url}`);
          }
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
      // Nếu đang refresh token, thêm request vào queue
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token) => {
              originalRequest.headers.token = `Bearer ${token}`;
              // Thêm userId từ Redux store mới nhất
              const currentUserState = Store.getState().user;
              const userId = currentUserState?.user?._id;
              if (userId) {
                originalRequest.headers.userId = `${userId}`;
              }
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true; // Đánh dấu là đã thử lại
      isRefreshing = true;

      try {
        console.warn(
          "Received 401 Unauthorized. Attempting to refresh token from response interceptor..."
        );

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

          // Cập nhật userId header cho request retry
          const currentUserState = Store.getState().user;
          const userId = currentUserState?.user?._id;
          if (userId) {
            originalRequest.headers.userId = `${userId}`;
            console.log(
              `Added userId to retry request headers: ${userId} for URL: ${originalRequest.url}`
            );
          }

          // Process queued requests
          processQueue(null, newAccessToken);

          return axiosInstance(originalRequest);
        } else {
          console.error("No new access token after 401 refresh. Logging out.");
          processQueue(
            new Error("No new access token from refresh after 401."),
            null
          );
          throw new Error("No new access token from refresh after 401.");
        }
      } catch (refreshError) {
        console.error(
          "Failed to refresh token after 401 or refresh_token is invalid:",
          refreshError
        );
        processQueue(refreshError, null);

        // Đăng xuất và clear session khi không thể làm mới token
        Store.dispatch(logout());
        Cookies.remove("refresh_token");
        message.error(
          "Phiên đăng nhập đã hết hạn hoặc không thể làm mới. Vui lòng đăng nhập lại."
        );
        sessionStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    console.error("API error:", error.response?.data || error.message);

    return Promise.reject(error);
  }
);

export default axiosInstance;
