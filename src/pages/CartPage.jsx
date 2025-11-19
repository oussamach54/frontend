// src/pages/CartPage.js
//ok
import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../cart/CartProvider";
import "./cart-page.css";

export default function CartPage() {
  const { items, totals, setQty, removeItem, clear } = useCart();

  if (!items.length) {
    return (
      <div className="cp-wrap">
        <h1 className="cp-title">Votre panier</h1>
        <div className="cp-empty">
          Votre panier est vide.
          <div className="cp-actions mt-3">
            <Link to="/products" className="cp-btn primary">Découvrir nos produits</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-wrap">
      <h1 className="cp-title">Votre panier</h1>

      <div className="cp-grid">
        {/* LEFT: list */}
        <section className="cp-list">
          {items.map((it) => (
            <article key={it.key} className="cp-item">
              <div className="cp-thumb">
                <img src={it.image} alt={it.name} />
              </div>

              <div className="cp-info">
                <div className="cp-name">{it.name}</div>
                {it.variantLabel && <div className="cp-variant">{it.variantLabel}</div>}

                <div className="cp-controls">
                  <div className="cp-qty">
                    <button
                      className="cp-qtybtn"
                      onClick={() => setQty(it.key, Math.max(1, it.qty - 1))}
                      aria-label="Diminuer la quantité"
                    >
                      –
                    </button>
                    <input
                      className="cp-qtyinput"
                      value={it.qty}
                      onChange={(e) =>
                        setQty(it.key, Math.max(1, Number(e.target.value) || 1))
                      }
                      inputMode="numeric"
                      pattern="[0-9]*"
                      aria-label="Quantité"
                    />
                    <button
                      className="cp-qtybtn"
                      onClick={() => setQty(it.key, it.qty + 1)}
                      aria-label="Augmenter la quantité"
                    >
                      +
                    </button>
                  </div>

                  <button className="cp-remove" onClick={() => removeItem(it.key)}>
                    Supprimer
                  </button>
                </div>
              </div>

              <div className="cp-lineprice">
                {(Number(it.price) * Number(it.qty)).toFixed(2)} MAD
              </div>
            </article>
          ))}

          <div className="cp-list-actions">
            <button className="cp-linkdanger" onClick={clear}>Vider le panier</button>
            <Link to="/products" className="cp-link">Continuer vos achats</Link>
          </div>
        </section>

        {/* RIGHT: summary */}
        <aside className="cp-summary">
          <h3 className="cp-summary-title">Résumé</h3>

          <div className="cp-row">
            <span>Sous-total</span>
            <b>{Number(totals.subtotal).toFixed(2)} MAD</b>
          </div>

          <div className="cp-note">
            Les frais de livraison sont calculés à l’étape suivante.
          </div>

          <Link to="/checkout" className="cp-btn primary block">
            Passer à la caisse
          </Link>
        </aside>
      </div>
    </div>
  );
}
