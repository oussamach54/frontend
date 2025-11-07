// src/api.js
import axios from "axios";

/**
 * Choose the correct API base URL depending on where the app runs.
 *  - In production → use https://api.miniglowbyshay.cloud
 *  - In local dev → use http://localhost:8000
 *  - Or override with REACT_APP_API_URL
 */
function chooseBaseURL() {
  // 1️⃣ Check environment variable first (preferred)
  const env = process.env.REACT_APP_API_URL?.trim();
  if (env) return env; // Example: "https://api.miniglowbyshay.cloud"

  // 2️⃣ Auto-detect based on hostname
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // On your production frontend domain
    if (host.endsWith("miniglowbyshay.cloud") && !host.startsWith("api.")) {
      return "https://api.miniglowbyshay.cloud";
    }
  }

  // 3️⃣ Default to local backend
  return "http://localhost:8000";
}

// Create the Axios instance
const api = axios.create({
  baseURL: `${chooseBaseURL()}/api`, // All calls go to /api/... endpoints
  timeout: 20000,
});

// 🔐 Attach JWT access token automatically if present
api.interceptors.request.use((config) => {
  try {
    const token =
      localStorage.getItem("access") || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn("JWT token read error:", err);
  }
  return config;
});

// Optional: Log API errors for debugging
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API error:", error?.response || error.message);
    return Promise.reject(error);
  }
);

export default api;
