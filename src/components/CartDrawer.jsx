import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../cart/CartProvider";
import "./cart-drawer.css";

export default function CartDrawer() {
  const { items, removeItem, setQty, totals, isOpen, setOpen } = useCart();

  return (
    <>
      <div className={`cd-backdrop ${isOpen ? "is-open" : ""}`} onClick={() => setOpen(false)} />
      <aside className={`cd-drawer ${isOpen ? "is-open" : ""}`} aria-hidden={!isOpen}>
        <header className="cd-head">
          <strong>Panier d'achats</strong>
          <button className="cd-close" onClick={() => setOpen(false)} aria-label="Fermer">✕</button>
        </header>

        <div className="cd-body">
          {items.length === 0 ? (
            <div className="cd-empty">Votre panier est vide.</div>
          ) : (
            items.map(it => (
              <div key={it.key} className="cd-row">
                <img src={it.image} alt={it.name} />
                <div className="cd-info">
                  <div className="cd-title">{it.name}</div>
                  {it.variantLabel && <div className="cd-variant">{it.variantLabel}</div>}
                  <div className="cd-qty">
                    <button onClick={() => setQty(it.key, it.qty - 1)} aria-label="minus">−</button>
                    <input value={it.qty} onChange={(e)=>setQty(it.key, Number(e.target.value)||1)} />
                    <button onClick={() => setQty(it.key, it.qty + 1)} aria-label="plus">+</button>
                  </div>
                </div>
                <div className="cd-right">
                  <div className="cd-price">{Number(it.price).toFixed(2)} MAD</div>
                  <button className="cd-remove" onClick={() => removeItem(it.key)}>Supprimer</button>
                </div>
              </div>
            ))
          )}
        </div>

        <footer className="cd-foot">
          <div className="cd-subtotal">
            <span>Sous-total</span>
            <b>{totals.subtotal.toFixed(2)} MAD</b>
          </div>
          <div className="cd-actions">
            <Link to="/cart" className="cd-btn outline" onClick={() => setOpen(false)}>Voir le panier</Link>
            <Link to="/checkout" className="cd-btn primary" onClick={() => setOpen(false)}>Passer à la caisse</Link>
          </div>
        </footer>
      </aside>
    </>
  );
}
