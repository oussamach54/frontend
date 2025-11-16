// src/apiOrders.js
import api from "./api";

export async function createOrder(payload) {
  const { data } = await api.post("/orders/", payload); // => /api/orders/
  return data;
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
