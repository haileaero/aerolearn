import axios from "axios";

// Development must talk to the local API by default. Previous builds fell
// back to the production Render API even when Vite was running locally, which
// made edits look as if they saved and then immediately reverted to the old
// production values.
const configuredApiUrl = String(import.meta.env.VITE_API_URL || "").trim();
const apiBaseUrl = configuredApiUrl ||
  (import.meta.env.DEV
    ? "http://localhost:5000/api"
    : "https://aerolearn.onrender.com/api");

const api = axios.create({
  baseURL: apiBaseUrl.replace(/\/$/, ""),
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login") window.location.href = "/login";
    }

    if (error.code === "ECONNABORTED") console.error("Request Timeout");
    if (!error.response) console.error("Server is unreachable.");
    return Promise.reject(error);
  }
);

export default api;
