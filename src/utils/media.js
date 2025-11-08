/**
 * Turn a possibly-relative media path into an absolute URL that works
 * both locally and on production.
 *
 * Examples:
 *   "https://cdn.example.com/x.png"  -> stays the same
 *   "/images/p/1.png"                -> http://localhost:8000/images/p/1.png (local)
 *   "/images/p/1.png"                -> https://api.miniglowbyshay.cloud/images/p/1.png (prod)
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

/** Convenience: pick image_url over image, then resolve */
export function productImage(product) {
  return resolveMedia(product?.image_url || product?.image || "");
}

/** Alias to satisfy older imports */
export const resolveImageURL = resolveMedia;



