// Decide API origin same way as src/api.js
function chooseBaseURL() {
  const env = (process.env.REACT_APP_API_URL || "").trim();
  if (env) return env;
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host.endsWith("miniglowbyshay.cloud") && !host.startsWith("api.")) {
      return "https://api.miniglowbyshay.cloud";
    }
  }
  return "http://localhost:8000";
}

const API_ORIGIN = chooseBaseURL();

/**
 * Make any image path usable in the browser:
 * - absolute http(s): keep
 * - protocol-relative (//...): add https:
 * - /images/... or images/... or /media/...: prefix with API origin
 * - otherwise: return as-is (public asset)
 */
export function resolveImageURL(src) {
  if (!src) return "";
  const s = String(src).trim();

  if (/^https?:\/\//i.test(s)) return s;
  if (/^\/\//.test(s)) return `https:${s}`;

  // normalize leading slash
  const rel = s.replace(/^\/+/, "");

  if (/^(images|media)\//i.test(rel)) {
    return `${API_ORIGIN}/${rel}`;
  }
  if (s.startsWith("/images/") || s.startsWith("/media/")) {
    return `${API_ORIGIN}/${s.replace(/^\/+/, "")}`;
  }
  return s;
}
