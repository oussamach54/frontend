/**
 * Build an absolute media URL that works locally and on production.
 * - Absolute URLs are returned unchanged.
 * - Relative paths are prefixed with the API origin.
 */
export function resolveMedia(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;

  const isProdApp =
    typeof window !== "undefined" &&
    window.location.hostname.endsWith("miniglowbyshay.cloud") &&
    !window.location.hostname.startsWith("api.");

  const apiRoot = isProdApp
    ? "https://api.miniglowbyshay.cloud"
    : "http://localhost:8000";

  return url.startsWith("/") ? `${apiRoot}${url}` : `${apiRoot}/${url}`;
}

/**
 * Safe, zero-request placeholder (1×1 transparent GIF) to avoid 404 spam.
 * You can replace this with a real image if you want.
 */
export const FALLBACK_PRODUCT_IMG =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/** Convenience: pick image_url over image, then resolve (with fallback). */
export function productImage(product) {
  const raw = product?.image_url || product?.image || "";
  const abs = resolveMedia(raw);
  return raw ? abs : FALLBACK_PRODUCT_IMG;
}

/** Legacy alias used in older imports */
export const resolveImageURL = resolveMedia;


