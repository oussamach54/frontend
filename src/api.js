// src/api.js
import axios from "axios";

/**
 * Normalize an API origin:
 * - trim spaces
 * - remove trailing slash
 * - if user mistakenly sets .../api, strip it to keep ONLY the origin
 *   so we can safely append "/api" once.
 */
function normalizeOrigin(v) {
  let s = String(v || "").trim();
  if (!s) return "";
  s = s.replace(/\/+$/, "");
  if (s.endsWith("/api")) s = s.slice(0, -4);
  return s;
}

/** Pick the correct API origin (local vs prod) */
function chooseApiOrigin() {
  const env = normalizeOrigin(process.env.REACT_APP_API_URL);
  if (env) return env; // ✅ should be like https://api.miniglowbyshay.cloud (NO /api)

  if (typeof window !== "undefined") {
    const host = window.location.hostname || "";
    // If frontend is on *.miniglowbyshay.cloud (not api subdomain) -> use api subdomain
    if (host.endsWith("miniglowbyshay.cloud") && !host.startsWith("api.")) {
      return "https://api.miniglowbyshay.cloud";
    }
  }
  return "http://localhost:8000";
}

/** Exported so apiOrders.js can build one guaranteed-correct absolute URL */
export const API_ORIGIN = chooseApiOrigin();

/** Env-scoped storage keys so local/prod don’t clash */
export function storageKeys() {
  const isProd =
    typeof window !== "undefined" &&
    window.location.hostname.endsWith("miniglowbyshay.cloud");

  return {
    user: "userInfo",
    access: isProd ? "access_prod" : "access_local",
    refresh: isProd ? "refresh_prod" : "refresh_local",
  };
}

export function saveToken(token, refresh) {
  const { access, refresh: rKey } = storageKeys();
  if (token) {
    localStorage.setItem(access, token);
    // legacy keys some code still reads
    localStorage.setItem("access", token);
    localStorage.setItem("token", token);
  }
  if (refresh) {
    localStorage.setItem(rKey, refresh);
    localStorage.setItem("refresh", refresh);
  }
}

export function readToken() {
  const { access } = storageKeys();
  return (
    localStorage.getItem(access) ||
    localStorage.getItem("access") ||
    localStorage.getItem("token")
  );
}

export function clearTokens() {
  const { access, refresh, user } = storageKeys();

  // new keys
  localStorage.removeItem(access);
  localStorage.removeItem(refresh);
  localStorage.removeItem(user);

  // legacy keys
  localStorage.removeItem("access");
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
  localStorage.removeItem("userInfo");
}

const api = axios.create({
  // ✅ Always exactly one "/api"
  baseURL: `${API_ORIGIN}/api`,
  timeout: 20000,
});

/** Attach JWT automatically if present */
api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

/** Central error handling */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const detail = err?.response?.data?.detail;

    // token invalid / expired -> logout silently
    if (status === 401 && typeof detail === "string") {
      const low = detail.toLowerCase();
      if (
        low.includes("given token not valid for any token type") ||
        low.includes("token is invalid or expired") ||
        low.includes("not authenticated")
      ) {
        clearTokens();
      }
    }

    // eslint-disable-next-line no-console
    console.error("API error:", err?.response || err.message);
    return Promise.reject(err);
  }
);

export default api;
