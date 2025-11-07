// src/api.js
import axios from "axios";

/** Decide backend base URL */
function chooseBaseURL() {
  const env = (process.env.REACT_APP_API_URL || "").trim();
  if (env) return env; // e.g. "https://api.miniglowbyshay.cloud"

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.endsWith("miniglowbyshay.cloud") && !host.startsWith("api.")) {
      return "https://api.miniglowbyshay.cloud";
    }
  }
  return "http://localhost:8000";
}

/* 🔧 Make sure no global axios default leaks into requests */
delete axios.defaults?.headers?.common?.Authorization;

const api = axios.create({
  baseURL: `${chooseBaseURL()}/api`,
  timeout: 20000,
});

/**
 * We ONLY send Authorization if the caller asks for it with `_authRequired: true`.
 * Also, if there is any Authorization header attached accidentally, we strip it.
 */
api.interceptors.request.use((config) => {
  // defensive: never let a stray Authorization leak onto public requests
  if (!config._authRequired && config.headers?.Authorization) {
    delete config.headers.Authorization;
  }

  if (config._authRequired) {
    const token =
      localStorage.getItem("access") || localStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    delete config._authRequired; // don’t send our custom flag
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    console.error("API error:", err?.response || err?.message);
    return Promise.reject(err);
  }
);

export default api;
