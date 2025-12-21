// src/apiOrders.js
import api, { API_ORIGIN } from "./api";

/**
 * One safe absolute base.
 * This avoids random 404s caused by wrong "/api/api" or wrong host.
 */
const ABS_ORDERS_URL = `${API_ORIGIN}/api/orders/`;
const absPublicOrderUrl = (id, token) =>
  `${API_ORIGIN}/api/orders/public/${id}/${token}/`;

async function postJson(url, payload) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true, // ✅ helps some mobile/in-app browsers
    credentials: "omit",
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`createOrder failed (${res.status}): ${txt}`);
  }

  return await res.json();
}

async function getJson(url) {
  const res = await fetch(url, { method: "GET", credentials: "omit" });
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`GET failed (${res.status}): ${txt}`);
  }
  return await res.json();
}

export async function createOrder(payload) {
  // 1) Normal axios call first (fast + consistent)
  try {
    const { data } = await api.post("/orders/", payload);
    return data;
  } catch (err) {
    // 2) Absolute fetch fallback (prevents wrong URL / in-app issues)
    return await postJson(ABS_ORDERS_URL, payload);
  }
}

export async function getPublicOrder(id, token) {
  if (!id || !token) throw new Error("Missing order id or token");

  // axios first
  try {
    const { data } = await api.get(`/orders/public/${id}/${token}/`);
    return data;
  } catch (err) {
    // absolute fallback
    return await getJson(absPublicOrderUrl(id, token));
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
