// frontend/src/cart/CartProvider.js
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
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
  // 1) Utilisateur connecté (ou invité)
  const { userInfo } = useSelector((s) => s.userLoginReducer || {});
  const userId = userInfo?.id || userInfo?._id;

  // 2) Clé de stockage dépend de l’utilisateur
  const cartKey = userId ? `cart:u:${userId}` : "cart:guest";

  // 3) État local du panier
  const [items, setItems] = useState(() => load(cartKey));
  const [isOpen, setOpen] = useState(false);

  // 4) Quand l’utilisateur change (login/logout), on recharge le panier
  useEffect(() => {
    setItems(load(cartKey));
  }, [cartKey]);

  // 5) Persistance
  useEffect(() => {
    save(cartKey, items);
  }, [cartKey, items]);

  // 6) Fusion “guest → user” au login
  useEffect(() => {
    if (!userId) return; // rien à faire si invité

    const guest = load("cart:guest");
    if (!guest.length) return;

    const mine = load(`cart:u:${userId}`);
    const merged = [...mine];

    for (const g of guest) {
      const i = merged.findIndex((x) => x.key === g.key);
      if (i === -1) {
        merged.push(g);
      } else {
        merged[i] = {
          ...merged[i],
          qty: Math.min(99, merged[i].qty + g.qty),
        };
      }
    }

    save(`cart:u:${userId}`, merged);
    removeKey("cart:guest");
    setItems(merged); // rehydrate UI
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // ========== API DU PANIER ==========

  const addItem = (p, qty = 1, meta = {}) => {
    setItems((prev) => {
      // 🔹 On récupère d’abord dans meta, sinon dans p
      const variantId = meta.variantId ?? p.variantId ?? null;
      const variantLabel = meta.variantLabel ?? p.variantLabel ?? null;
      const unitPrice = Number(
        meta.price ?? p.price ?? 0 // p.price = unitPrice dans tes appels
      );

      const idKey = `${p.id}${variantId ? `:${variantId}` : ""}`;

      const ix = prev.findIndex((x) => x.key === idKey);

      const base = {
        key: idKey,
        id: p.id,
        name: p.name,
        price: unitPrice,
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
