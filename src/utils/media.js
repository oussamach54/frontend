/**
 * Media URL utilities
 *
 * - Build an absolute URL that works locally (localhost:8000) and on prod (api.miniglowbyshay.cloud)
 * - Prefer product.image_url over product.image when present
 */

const PROD_HOST = "miniglowbyshay.cloud";
const PROD_API  = "https://api.miniglowbyshay.cloud";
const DEV_API   = "http://localhost:8000";

/** Decide API root by environment (works in local dev and on your Coolify domain) */
function apiRoot() {
  // If a build-time URL is provided, prefer it.
  const env = (process.env.REACT_APP_API_URL || "").trim();
  if (env) return env.replace(/\/+$/,"");

  if (typeof window !== "undefined") {
    const { hostname, protocol } = window.location;
    // When we are browsing on *.miniglowbyshay.cloud (the React app),
    // our API lives on api.miniglowbyshay.cloud
    if (hostname.endsWith(PROD_HOST) && !hostname.startsWith("api.")) {
      return PROD_API;
    }
    // in case you open the app directly on the API host:
    if (hostname.startsWith("api.") && hostname.endsWith(PROD_HOST)) {
      return `${protocol}//${hostname}`;
    }
  }
  // default to local dev
  return DEV_API;
}

/**
 * Turn a possibly-relative media path into an absolute URL.
 * - Keeps http(s) URLs as-is
 * - Resolves "/images/..." to the proper API server
 */
export function resolveMedia(url) {
  if (!url) return "";
  // absolute http(s)
  if (/^https?:\/\//i.test(url)) return url;
  // protocol-relative //host/path
  if (/^\/\//.test(url)) return `${window?.location?.protocol || "https:"}${url}`;

  const base = apiRoot();
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
}

/** Convenience: choose image_url over image, then resolve */
export function productImage(product) {
  return resolveMedia(product?.image_url || product?.image || "");
}

/** Backward-compat alias (old imports used resolveImageURL) */
export const resolveImageURL = resolveMedia;


