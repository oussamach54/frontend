// src/utils/cart.js
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  } catch {
    return [];
  }
}

export function saveCart(items) {
  localStorage.setItem("cart", JSON.stringify(items || []));
}

export function cartTotal(items) {
  return (items || []).reduce((sum, it) => sum + Number(it.price || 0) * Number(it.qty || 1), 0);
}

export function clearCart() {
  localStorage.removeItem("cart");
}
