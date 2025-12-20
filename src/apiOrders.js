// src/apiOrders.js
import api from "./api";

function stripTrailingSlash(s) {
  return String(s || "").replace(/\/$/, "");
}

function getBaseCandidates() {
  const axiosBase = stripTrailingSlash(api?.defaults?.baseURL); // e.g. https://api.domain.com/api
  const envBase = stripTrailingSlash(process.env.REACT_APP_API_URL); // should be https://api.domain.com (NO /api)
  const hardBase = "https://api.miniglowbyshay.cloud"; // safe fallback

  const list = [axiosBase, envBase, hardBase].filter(Boolean);

  // Dedupe
  return Array.from(new Set(list));
}

function buildOrderUrlsFromBase(base) {
  const b = stripTrailingSlash(base);

  // If base already ends with /api, then correct endpoint is `${b}/orders/`
  if (b.endsWith("/api")) {
    return [`${b}/orders/`]; // ✅
  }

  // Otherwise try both patterns
  return [
    `${b}/api/orders/`, // ✅ common
    `${b}/orders/`,     // ✅ sometimes used
  ];
}

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
    credentials: "omit",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`createOrder failed (${res.status}): ${txt}`);
  }

  return await res.json();
}

export async function createOrder(payload) {
  // 1) Normal axios call first
  try {
    const { data } = await api.post("/orders/", payload); // baseURL already has /api
    return data;
  } catch (err) {
    // 2) Fallback absolute fetch (for in-app browsers)
    const bases = getBaseCandidates();
    let lastErr = err;

    for (const base of bases) {
      const urls = buildOrderUrlsFromBase(base);

      for (const url of urls) {
        try {
          return await postJson(url, payload);
        } catch (e) {
          lastErr = e;
        }
      }
    }

    throw lastErr;
  }
}

export async function getMyOrders() {
  const { data } = await api.get("/orders/my/");
  return data;
}

export async function getOrder(id) {
  const { data } = await api.get(`/orders/${id}/`);
  return data;
}

export async function adminUpdateStatus(id, status) {
  const { data } = await api.patch(`/orders/${id}/status/`, { status });
  return data;
}
