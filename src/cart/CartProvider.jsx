// frontend/src/cart/CartProvider.js
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

const CartCtx = createContext(null);
export const useCart = () => useContext(CartCtx);

// Helpers LS
function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}
function save(key, items) {
  try {
    localStorage.setItem(key, JSON.stringify(items));
  } catch {}
}
function removeKey(key) {
  try {
    localStorage.removeItem(key);
  } catch {}
}

export default function CartProvider({ children }) {
  // 1) user
  const { userInfo } = useSelector((s) => s.userLoginReducer || {});
  const userId = userInfo?.id || userInfo?._id;

  // 2) key
  const cartKey = userId ? `cart:u:${userId}` : "cart:guest";

  // 3) state
  const [items, setItems] = useState(() => load(cartKey));
  const [isOpen, setOpen] = useState(false);

  // reload when user changes
  useEffect(() => {
    setItems(load(cartKey));
  }, [cartKey]);

  // persist
  useEffect(() => {
    save(cartKey, items);
  }, [cartKey, items]);

  // merge guest → user at login
  useEffect(() => {
    if (!userId) return;
    const guest = load("cart:guest");
    if (!guest.length) return;

    const mine = load(`cart:u:${userId}`);
    const merged = [...mine];

    for (const g of guest) {
      const i = merged.findIndex((x) => x.key === g.key);
      if (i === -1) merged.push(g);
      else
        merged[i] = {
          ...merged[i],
          qty: Math.min(99, merged[i].qty + g.qty),
        };
    }
    save(`cart:u:${userId}`, merged);
    removeKey("cart:guest");
    setItems(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ========== FIXED addItem ==========

  /**
   * p : { id, name, price, image, variantId?, variantLabel? }
   * meta : optional override { price?, variantId?, variantLabel? }
   */
  const addItem = (p, qty = 1, meta = {}) => {
    setItems((prev) => {
      // ✅ take variant info from meta OR from p (backwards compatible)
      const variantId = meta.variantId ?? p.variantId ?? null;
      const variantLabel = meta.variantLabel ?? p.variantLabel ?? null;
      const price = Number(meta.price ?? p.price ?? 0);

      const idKey = `${p.id}${variantId ? `:${variantId}` : ""}`;
      const ix = prev.findIndex((x) => x.key === idKey);

      const base = {
        key: idKey,
        id: p.id,
        name: p.name,
        price,
        image: p.image,
        variantId,
        variantLabel,
      };

      if (ix >= 0) {
        const clone = prev.slice();
        clone[ix] = {
          ...clone[ix],
          qty: Math.min(99, clone[ix].qty + qty),
        };
        return clone;
      }
      return [...prev, { ...base, qty: Math.min(99, qty) }];
    });

    setOpen(true);
  };

  const removeItem = (key) =>
    setItems((prev) => prev.filter((x) => x.key !== key));

  const setQty = (key, q) =>
    setItems((prev) =>
      prev.map((x) =>
        x.key === key
          ? { ...x, qty: Math.max(1, Math.min(99, q)) }
          : x
      )
    );

  const clear = () => setItems([]);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (s, x) => s + x.qty * Number(x.price || 0),
      0
    );
    return { subtotal };
  }, [items]);

  const value = {
    items,
    addItem,
    removeItem,
    setQty,
    clear,
    totals,
    isOpen,
    setOpen,
  };

  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
