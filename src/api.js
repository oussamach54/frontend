// src/api.js
import axios from "axios";

/**
 * Base URL:
 * - Same origin by default (""), so /api/... is proxied in dev.
 * - To call a different origin, set REACT_APP_API_URL, e.g. "https://api.miniglowbyshay.cloud".
 */
const RAW = process.env.REACT_APP_API_URL || "";
const BASE = RAW.replace(/\/+$/, "");

// localStorage keys
const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";

// Endpoints that are PUBLIC (no auth header, and safe to retry without it)
const PUBLIC_GET_PATHS = [
  /^\/api\/products\/?$/i,
  /^\/api\/brands\/?$/i,
  /^\/api\/product\/\d+\/?$/i,
  /^\/api\/shipping-rates\/?$/i,            // product app
  /^\/payments\/shipping-rates\/?$/i,       // payments app
];

// Helpers
const isLikelyJwt = (t) => typeof t === "string" && t.split(".").length === 3;
const isPublicGet = (config) => {
  if ((config.method || "get").toLowerCase() !== "get") return false;
  // Normalize URL path (strip base)
  let path = config.url || "";
  if (BASE && path.startsWith(BASE)) path = path.slice(BASE.length);
  // Ensure it starts with '/'
  if (path.charAt(0) !== "/") path = `/${path}`;
  return PUBLIC_GET_PATHS.some((re) => re.test(path));
};

// Create a single axios instance used everywhere
const api = axios.create({
  baseURL: BASE,
  timeout: 20000,
});

// Attach Authorization when appropriate
api.interceptors.request.use((config) => {
  // Don’t send auth on public GETs
  if (isPublicGet(config)) {
    if (config.headers?.Authorization) delete config.headers.Authorization;
    return config;
  }

  const token =
    localStorage.getItem(ACCESS_KEY) || localStorage.getItem("token"); // keep legacy key

  if (token && isLikelyJwt(token)) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // bad/old token in storage → remove it to avoid 401 on public routes
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem("token");
  }

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

    // If we got a 401 because the token is invalid, clear tokens and retry once
    const body = response?.data;
    const detail = body?.detail || body?.message || "";
    const isInvalidToken =
      response?.status === 401 &&
      typeof detail === "string" &&
      detail.toLowerCase().includes("token not valid");

    if (isInvalidToken) {
      // clear and optionally retry public GET without auth
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem("token");

      if (!config.__retriedWithoutAuth && isPublicGet(config)) {
        const clone = { ...config, __retriedWithoutAuth: true };
        if (clone.headers?.Authorization) delete clone.headers.Authorization;
        return api(clone);
      }
      return Promise.reject(err);
    }

    // Normal refresh flow for expired access token
    const is401 = response?.status === 401;
    if (!is401 || config.__isRetryRequest) return Promise.reject(err);

    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh || !isLikelyJwt(refresh)) return Promise.reject(err);

    if (refreshing) {
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            config.headers = config.headers || {};
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
      const { data } = await axios.post(`${BASE}/api/token/refresh/`, { refresh });
      const newAccess = data?.access;
      if (!newAccess) throw new Error("No access token from refresh");

      localStorage.setItem(ACCESS_KEY, newAccess);
      flushQueue(null, newAccess);

      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${newAccess}`;
      config.__isRetryRequest = true;
      return api(config);
    } catch (e) {
      flushQueue(e, null);
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem("token");
      return Promise.reject(e);
    } finally {
      refreshing = false;
    }
  }
);

export default api;

// Optional helpers used by actions
export const auth = {
  async tokenPair({ username, password }) {
    const { data } = await api.post(`/api/token/`, { username, password });
    if (data?.access) localStorage.setItem(ACCESS_KEY, data.access);
    if (data?.refresh) localStorage.setItem(REFRESH_KEY, data.refresh);
    return data;
  },
  logout() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem("token");
  },
};
