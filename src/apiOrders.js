// src/apiOrders.js
import api from "./api";

function getApiBase() {
  const base =
    api?.defaults?.baseURL ||
    process.env.REACT_APP_API_URL ||
    "https://api.miniglowbyshay.cloud";
  return String(base).replace(/\/$/, "");
}

export async function createOrder(payload) {
  try {
    const { data } = await api.post("/orders/", payload);
    return data;
  } catch (err) {
    const base = getApiBase();
    const urlCandidates = [`${base}/orders/`, `${base}/api/orders/`];

    let lastError = err;

    for (const url of urlCandidates) {
      try {
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
      } catch (e) {
        lastError = e;
      }
    }

    throw lastError;
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

// ✅ NEW: guest-friendly fetch
export async function getPublicOrder(id, token) {
  const { data } = await api.get(`/orders/public/${id}/${token}/`);
  return data;
}

export async function adminUpdateStatus(id, status) {
  const { data } = await api.patch(`/orders/${id}/status/`, { status });
  return data;
}
