import axios from "axios";

/** =========================
 *  Base URL (Coolify / local)
 *  ========================= */
const RAW  = process.env.REACT_APP_API_URL || "";
const BASE = RAW.replace(/\/+$/, ""); // strip trailing slash

// localStorage keys
const ACCESS_KEY  = "access";
const REFRESH_KEY = "refresh";

// Public (no-auth) GET endpoints (safe to retry anonymously)
const PUBLIC_GET_PATHS = [
  /^\/api\/products\/?$/i,
  /^\/api\/product\/\d+\/?$/i,
  /^\/api\/brands\/?$/i,
  /^\/api\/shipping-rates\/?$/i,
  /^\/payments\/shipping-rates\/?$/i,
];

// utilities
const isLikelyJwt = (t) => typeof t === "string" && t.split(".").length === 3;

const normalizePath = (rawUrl) => {
  let url = String(rawUrl || "");
  if (BASE && url.startsWith(BASE)) url = url.slice(BASE.length);
  if (url.charAt(0) !== "/") url = `/${url}`;
  const q = url.indexOf("?");
  const h = url.indexOf("#");
  const cut = Math.min(q === -1 ? url.length : q, h === -1 ? url.length : h);
  return url.slice(0, cut);
};

const isPublicGet = (config) => {
  if ((config.method || "get").toLowerCase() !== "get") return false;
  const path = normalizePath(config.url);
  return PUBLIC_GET_PATHS.some((re) => re.test(path));
};

// axios instance
const api = axios.create({
  baseURL: BASE,
  timeout: 20000,
});

/* ------------ Request: attach/remove auth ------------ */
api.interceptors.request.use((config) => {
  // always strip auth on public GETs
  if (isPublicGet(config)) {
    if (config.headers?.Authorization) delete config.headers.Authorization;
    return config;
  }
  const token =
    localStorage.getItem(ACCESS_KEY) ||
    localStorage.getItem("token"); // legacy key support

  if (token && isLikelyJwt(token)) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    // clean bad tokens
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem("token");
  }
  return config;
});

/* ------------ Response: refresh + safe anon retry ------------ */
let refreshing = false;
let queue = [];
const flushQueue = (err, token = null) => {
  queue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token)));
  queue = [];
};

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const { config, response } = err;

    // 1) Any 401 on a PUBLIC GET → retry once WITHOUT Authorization (anonymous)
    if (response?.status === 401 && isPublicGet(config) && !config.__retriedWithoutAuth) {
      const clone = { ...config, __retriedWithoutAuth: true };
      if (clone.headers?.Authorization) delete clone.headers.Authorization;
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem("token");
      return api(clone);
    }

    // 2) Explicit "token not valid" → clear tokens (no refresh attempt)
    const detail = response?.data?.detail || response?.data?.message || "";
    const invalidToken =
      response?.status === 401 &&
      typeof detail === "string" &&
      detail.toLowerCase().includes("token not valid");
    if (invalidToken) {
      localStorage.removeItem(ACCESS_KEY);
      localStorage.removeItem(REFRESH_KEY);
      localStorage.removeItem("token");
      return Promise.reject(err);
    }

    // 3) Normal refresh flow for non-public requests
    const is401 = response?.status === 401;
    if (!is401 || config.__isRetryRequest || isPublicGet(config)) {
      return Promise.reject(err);
    }

    const refresh = localStorage.getItem(REFRESH_KEY);
    if (!refresh || !isLikelyJwt(refresh)) return Promise.reject(err);

    if (refreshing) {
      // queue while we refresh
      return new Promise((resolve, reject) => {
        queue.push({
          resolve: (token) => {
            const retry = { ...config, __isRetryRequest: true };
            retry.headers = retry.headers || {};
            retry.headers.Authorization = `Bearer ${token}`;
            resolve(api(retry));
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

      const retry = { ...config, __isRetryRequest: true };
      retry.headers = retry.headers || {};
      retry.headers.Authorization = `Bearer ${newAccess}`;
      return api(retry);
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

/* ------------ Small auth helper ------------ */
export const auth = {
  async tokenPair({ username, password }) {
    // DRF simplejwt default
    const { data } = await api.post(`/api/token/`, { username, password });
    if (data?.access)  localStorage.setItem(ACCESS_KEY, data.access);
    if (data?.refresh) localStorage.setItem(REFRESH_KEY, data.refresh);
    return data;
  },
  logout() {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem("token");
  },
};
