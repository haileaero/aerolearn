import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "https://aerolearn.onrender.com/api",

  timeout: 15000,


  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ==========================================
   Request Interceptor
========================================== */

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token");

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => Promise.reject(error)
);

/* ==========================================
   Response Interceptor
========================================== */

api.interceptors.response.use(

  (response) => response,

  (error) => {

    if (
      error.response?.status === 401
    ) {

      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (
        window.location.pathname !==
        "/login"
      ) {

        window.location.href =
          "/login";

      }

    }

    if (
      error.code === "ECONNABORTED"
    ) {

      console.error(
        "Request Timeout"
      );

    }

    if (
      !error.response
    ) {

      console.error(
        "Server is unreachable."
      );

    }

    return Promise.reject(error);

  }

);

export default api;