// src/apiOrders.js
import api from "./api";

// حاول تجيب base api من axios instance (إلا موجود)
// وإلا fallback لـ env أو api.miniglowbyshay.cloud
function getApiBase() {
  // axios instance غالباً فيه baseURL
  const base =
    api?.defaults?.baseURL ||
    process.env.REACT_APP_API_URL ||
    "https://api.miniglowbyshay.cloud";
  return String(base).replace(/\/$/, "");
}

export async function createOrder(payload) {
  // 1) Primary: axios (normal)
  try {
    const { data } = await api.post("/orders/", payload); // => /api/orders/
    return data;
  } catch (err) {
    // 2) Fallback: fetch keepalive (important for some mobile/in-app browsers)
    const base = getApiBase();

    // IMPORTANT:
    // If your API is behind /api prefix already in baseURL, keep path /orders/
    // Otherwise use /api/orders/
    const urlCandidates = [
      `${base}/orders/`,
      `${base}/api/orders/`,
    ];

    let lastError = err;

    for (const url of urlCandidates) {
      try {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          keepalive: true, // ✅ key fix
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

export async function adminUpdateStatus(id, status) {
  const { data } = await api.patch(`/orders/${id}/status/`, { status });
  return data;
}
