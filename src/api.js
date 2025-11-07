// src/api.js
import axios from "axios";

/** Pick the correct API origin (local vs prod) */
function chooseBaseURL() {
  const env = (process.env.REACT_APP_API_URL || "").trim();
  if (env) return env; // e.g. https://api.miniglowbyshay.cloud

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.endsWith("miniglowbyshay.cloud") && !host.startsWith("api.")) {
      return "https://api.miniglowbyshay.cloud";
    }
  }
  return "http://localhost:8000";
}

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
  const { access, refresh } = storageKeys();
  localStorage.removeItem(access);
  localStorage.removeItem(refresh);
  localStorage.removeItem("access");
  localStorage.removeItem("token");
  localStorage.removeItem("refresh");
}

const api = axios.create({
  baseURL: `${chooseBaseURL()}/api`, // we always call relative paths like "/products/"
  timeout: 20000,
});

/** Attach JWT automatically if present */
api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // eslint-disable-next-line no-console
    console.error("API error:", err?.response || err.message);
    return Promise.reject(err);
  }
);

export default api;
