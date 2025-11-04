// src/api.js
import axios from "axios";

const RAW = process.env.REACT_APP_API_URL || ""; // same origin unless overridden
const BASE = RAW.replace(/\/+$/, "");

const ACCESS_KEY = "access";
const REFRESH_KEY = "refresh";

const api = axios.create({
  baseURL: BASE,
  timeout: 20000,
});

// helper: is token string clearly unusable?
const looksBad = (t) =>
  !t || t === "undefined" || t === "null" || typeof t !== "string" || t.split(".").length < 3;

// attach Authorization if we have a token that at least “looks” like a JWT
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem(ACCESS_KEY) || localStorage.getItem("token");
  if (token && !looksBad(token)) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // ensure we don't send a broken header
    delete config.headers.Authorization;
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

    // If there is no response (network), pass through
    if (!response) return Promise.reject(err);

    const is401 = response.status === 401;

    // If we already retried without auth, or it's not 401, just reject
    if (!is401 && !config.__retriedNoAuth) return Promise.reject(err);

    // If it's the “token not valid” error from SimpleJWT -> clear tokens and retry GET *once* without auth
    const msg =
      response?.data?.detail ||
      response?.data?.code ||
      response?.data?.messages?.[0]?.message ||
      "";

    const tokenInvalid =
      String(msg).includes("token_not_valid") ||
      String(msg).includes("Given token not valid");

    if (is401 && tokenInvalid && !config.__retriedNoAuth) {
      // blow away tokens
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);

      // retry once with no Authorization header
      const noAuth = { ...config, headers: { ...(config.headers || {}) } };
      delete noAuth.headers.Authorization;
      noAuth.__retriedNoAuth = true;

      try {
        return await api(noAuth);
      } catch (e) {
        return Promise.reject(e);
      }
    }

    // Regular refresh flow for expired-but-refreshable access tokens
    if (is401 && !config.__isRetryRequest) {
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
        const { data } = await axios.post(`${BASE}/api/token/refresh/`, { refresh });
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

    return Promise.reject(err);
  }
);

export default api;

export const auth = {
  async tokenPair({ username, password }) {
    const { data } = await api.post(`/api/token/`, { username, password });
    // store for interceptors
    if (data?.access) localStorage.setItem(ACCESS_KEY, data.access);
    if (data?.refresh) localStorage.setItem(REFRESH_KEY, data.refresh);
    return data;
  },
  logout() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};
