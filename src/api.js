// src/api.js
import axios from "axios";

/**
 * We talk to the backend via the same origin that serves the frontend (Nginx).
 * Nginx already proxies /api -> Django.
 * If you want to hit a different origin, set REACT_APP_API_URL, e.g. "https://api.miniglowbyshay.cloud".
 */
const RAW = process.env.REACT_APP_API_URL || ""; // same origin by default
const BASE = RAW.replace(/\/+$/, "");

const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";

// Create a single axios instance for the whole app
const api = axios.create({
  baseURL: BASE, // "" by default => requests go to /api/..., /static/... on same origin
  timeout: 20000,
});

// Attach JWT on every request if available
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem(ACCESS_KEY) || localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** ---- Automatic refresh with SimpleJWT ---- */
let refreshing = false;
let queue = [];

const flushQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(token);
  });
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { config, response } = err;
    const is401 = response?.status === 401;
    if (!is401 || config.__isRetryRequest) return Promise.reject(err);

    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh) return Promise.reject(err);

    if (refreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            config.headers.Authorization = `Bearer ${token}`;
            config.__isRetryRequest = true;
            resolve(api(config));
          },
          reject,
        });
      });
    }

    try {
      refreshing = true;
      // ✅ SimpleJWT default refresh endpoint
      const { data } = await axios.post(`${BASE}/api/token/refresh/`, {
        refresh,
      });
      const newAccess = data?.access;
      if (!newAccess) throw new Error("No access token from refresh");

      localStorage.setItem(ACCESS_KEY, newAccess);
      flushQueue(null, newAccess);

      config.headers.Authorization = `Bearer ${newAccess}`;
      config.__isRetryRequest = true;
      return api(config);
    } catch (e) {
      flushQueue(e, null);
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      return Promise.reject(e);
    } finally {
      refreshing = false;
    }
  }
);

export default api;

/** Optional helpers used by actions */
export const auth = {
  async tokenPair({ username, password }) {
    // ✅ SimpleJWT default login
    const { data } = await api.post(`/api/token/`, { username, password });
    // store tokens for interceptors
    localStorage.setItem(ACCESS_KEY, data.access);
    localStorage.setItem(REFRESH_KEY, data.refresh);
    return data;
  },
  logout() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
