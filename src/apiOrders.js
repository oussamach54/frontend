// src/apiOrders.js
import api from "./api";

function stripTrailingSlash(s) {
  return String(s || "").replace(/\/$/, "");
}

function getBaseCandidates() {
  const axiosBase = stripTrailingSlash(api?.defaults?.baseURL); // e.g. https://api.domain.com/api
  const envBase = stripTrailingSlash(process.env.REACT_APP_API_URL); // should be https://api.domain.com (NO /api)
  const hardBase = "https://api.miniglowbyshay.cloud";
  return Array.from(new Set([axiosBase, envBase, hardBase].filter(Boolean)));
}

function buildOrderUrlsFromBase(base) {
  const b = stripTrailingSlash(base);
  if (b.endsWith("/api")) return [`${b}/orders/`];
  return [`${b}/api/orders/`, `${b}/orders/`];
}

function buildPublicOrderUrlsFromBase(base, id, token) {
  const b = stripTrailingSlash(base);
  if (b.endsWith("/api")) return [`${b}/orders/public/${id}/${token}/`];
  return [
    `${b}/api/orders/public/${id}/${token}/`,
    `${b}/orders/public/${id}/${token}/`,
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
  try {
    const { data } = await api.post("/orders/", payload);
    return data;
  } catch (err) {
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

export async function getPublicOrder(id, token) {
  if (!id || !token) throw new Error("Missing order id or token");

  // axios first
  try {
    const { data } = await api.get(`/orders/public/${id}/${token}/`);
    return data;
  } catch (err) {
    const bases = getBaseCandidates();
    let lastErr = err;

    for (const base of bases) {
      const urls = buildPublicOrderUrlsFromBase(base, id, token);
      for (const url of urls) {
        try {
          const res = await fetch(url, { method: "GET", credentials: "omit" });
          if (!res.ok) {
            const txt = await res.text().catch(() => "");
            throw new Error(`getPublicOrder failed (${res.status}): ${txt}`);
          }
          return await res.json();
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
