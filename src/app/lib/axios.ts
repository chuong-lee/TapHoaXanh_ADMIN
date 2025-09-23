import axios, { AxiosError, AxiosRequestConfig } from "axios";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

const api = axios.create({

  baseURL: process.env.NEXT_PUBLIC_API_URL || "https://taphoaxanh-be.vercel.app/",
  // baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem("userToken"); // đổi tên lưu cho rõ
    if (userStr) {
      const access_token = JSON.parse(userStr).access_token;
      if (access_token) {
        config.headers.Authorization = `Bearer ${access_token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Xử lý response khi token hết hạn
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const tokens = localStorage.getItem("userToken");
      if (!tokens) {
        window.location.href = "/signin";
        return Promise.reject(error);
      }

      const { refresh_token } = JSON.parse(tokens);

      if (!isRefreshing) {
        isRefreshing = true;
        try {
          const res = await axios.post(
            process.env.NEXT_PUBLIC_API_URL + "/auth/refresh-token",
            {
              refresh_token,
            }
          );

          const { access_token, refresh_token: newRefresh } = res.data;
          localStorage.setItem(
            "userToken",
            JSON.stringify({ access_token, refresh_token: newRefresh })
          );

          isRefreshing = false;
          onRefreshed(access_token);

          // Retry request cũ với access_token mới
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${access_token}`;
          }
          return api(originalRequest);
        } catch (err) {
          isRefreshing = false;
          localStorage.removeItem("userToken");
          window.location.href = "/signin";
          return Promise.reject(err);
        }
      }

      // Nếu có nhiều request 401 cùng lúc → chờ token refresh xong
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          resolve(api(originalRequest));
        });
      });
    }

    return Promise.reject(error);
  }
);

export default api;
