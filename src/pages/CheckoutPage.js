// src/pages/CheckoutPage.js
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios"; // on le garde juste pour charger les tarifs publics
import { Alert } from "react-bootstrap";

import { useCart } from "../cart/CartProvider";
import { SHOP } from "../config/shop";
import "./checkout.css";

const FALLBACK_RATES = [
  { city: "Casablanca", price: 20 },
  { city: "Ain Harouda", price: 30 },
  { city: "Bouskoura", price: 30 },
  { city: "Dar Bouazza", price: 30 },
  { city: "Errahma ville", price: 30 },
  { city: "Tamaris", price: 30 },
  { city: "Tit Mellil", price: 30 },
  { city: "Agadir", price: 35 },
  { city: "Ait Melloul", price: 35 },
  { city: "Berrechid", price: 35 },
  { city: "Marrakech : Tamansourt", price: 45 },
  { city: "Mohammedia : Mimosa", price: 45 },
  { city: "Livraison pour toutes les autres villes", price: 45 },
];

export default function CheckoutPage() {
  const { items, totals } = useCart();

  // contact + adresse
  const [email, setEmail]   = useState("");
  const [first, setFirst]   = useState("");
  const [last, setLast]     = useState("");
  const [addr, setAddr]     = useState("");
  const [apt, setApt]       = useState("");
  const [zip, setZip]       = useState("");
  const [city, setCity]     = useState("");
  const [phone, setPhone]   = useState("");

  // expédition
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [shippingPrice, setShippingPrice] = useState(0);

  // ui
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Charger les tarifs publics si ton endpoint existe
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await axios.get("/api/shipping-rates/");
        if (!alive) return;
        if (Array.isArray(data) && data.length) {
          const normalized = data
            .filter((r) => r.active !== false)
            .map((r) => ({ city: r.city, price: Number(r.price) }))
            .sort((a, b) => a.city.localeCompare(b.city, "fr"));
          setRates(normalized);
        }
      } catch {
        // fallback ok
      }
    })();
    return () => { alive = false; };
  }, []);

  // Pré-sélection
  useEffect(() => {
    if (!rates.length) return;
    const def = rates.find((r) => r.city === "Casablanca") || rates[0];
    setCity(def.city);
    setShippingPrice(Number(def.price));
  }, [rates]);

  const total = useMemo(
    () => (Number(totals.subtotal) || 0) + Number(shippingPrice || 0),
    [totals.subtotal, shippingPrice]
  );

  /** Construit l'URL wa.me avec un message complet */
  const buildWhatsAppUrl = () => {
    const lines = [];

    lines.push(`*${SHOP.BRAND}* – Nouvelle commande`);
    lines.push("");
    lines.push("*Articles :*");
    items.forEach((it) => {
      const q = Number(it.qty || 1);
      const p = Number(it.price).toFixed(2);
      lines.push(`• ${it.name}${it.variantLabel ? " (" + it.variantLabel + ")" : ""} — ${p} MAD × ${q}`);
    });
    lines.push("");

    const ss = Number(totals.subtotal || 0).toFixed(2);
    const sp = Number(shippingPrice || 0).toFixed(2);
    const tt = Number(total).toFixed(2);

    lines.push(`Sous-total : ${ss} MAD`);
    lines.push(`Livraison : ${sp} MAD`);
    lines.push(`*Total : ${tt} MAD*`);
    lines.push("");

    lines.push("*Coordonnées :*");
    if (email) lines.push(`Email : ${email}`);
    lines.push(`Nom : ${(first || "").trim()} ${(last || "").trim()}`.trim());
    lines.push(`Téléphone : ${phone || "-"}`);
    lines.push(
      `Adresse : ${addr}${apt ? ", " + apt : ""}${zip ? ", " + zip : ""}${
        city ? " – " + city : ""
      }`.trim()
    );
    lines.push("");
    lines.push("Merci de confirmer ma commande 🙏");

    const msg = encodeURIComponent(lines.join("\n"));
    return `https://wa.me/${SHOP.WHATSAPP}?text=${msg}`;
  };

  const submit = () => {
    setErr("");
    if (!items.length) {
      setErr("Votre panier est vide.");
      return;
    }
    if (!addr || !city || !phone) {
      setErr("Adresse, ville et téléphone sont obligatoires.");
      return;
    }
    setLoading(true);
    // Redirection WhatsApp
    window.location.href = buildWhatsAppUrl();
    // pas de setLoading(false) : on quitte la page
  };

  return (
    <div className="co-wrap">
      <div className="co-left">
        <h2 className="co-title">Contact</h2>
        <div className="co-field">
          <label>E-mail ou numéro de portable</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <h2 className="co-title">Livraison</h2>
        <div className="co-grid-2">
          <div className="co-field">
            <label>Prénom (optionnel)</label>
            <input value={first} onChange={(e) => setFirst(e.target.value)} />
          </div>
          <div className="co-field">
            <label>Nom</label>
            <input value={last} onChange={(e) => setLast(e.target.value)} />
          </div>
        </div>

        <div className="co-field">
          <label>Adresse</label>
          <input value={addr} onChange={(e) => setAddr(e.target.value)} />
        </div>

        <div className="co-grid-2">
          <div className="co-field">
            <label>Appartement, suite, etc. (optionnel)</label>
            <input value={apt} onChange={(e) => setApt(e.target.value)} />
          </div>
          <div className="co-field">
            <label>Ville</label>
            <input value={city} readOnly />
          </div>
        </div>

        <div className="co-grid-2">
          <div className="co-field">
            <label>Code postal (facultatif)</label>
            <input value={zip} onChange={(e) => setZip(e.target.value)} />
          </div>
          <div className="co-field">
            <label>Téléphone</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        <div className="co-block">
          <div className="co-block-title">Mode d’expédition</div>
          <div className="co-ship-list">
            {rates.map((r) => {
              const checked = r.city === city;
              return (
                <label key={r.city} className={`co-ship-row ${checked ? "is-active" : ""}`}>
                  <input
                    type="radio"
                    name="ship"
                    checked={checked}
                    onChange={() => {
                      setCity(r.city);
                      setShippingPrice(Number(r.price));
                    }}
                  />
                  <span className="co-ship-city">{r.city}</span>
                  <span className="co-ship-price">{Number(r.price).toFixed(2)} MAD</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="co-block">
          <div className="co-block-title">Paiement</div>
          <div className="co-pay-row">
            <input type="radio" checked readOnly />
            <div>
              <div className="co-pay-title">Paiement à la livraison</div>
              <div className="co-pay-help">
                Paiement à la livraison disponible dans toutes les villes du Maroc.
                Pas besoin de payer en ligne. La confirmation se fait sur WhatsApp.
              </div>
            </div>
          </div>
        </div>

        {err && <Alert variant="danger" className="mt-2">{err}</Alert>}

        <button className="co-submit" onClick={submit} disabled={loading}>
          {loading ? "Redirection vers WhatsApp…" : "Valider le paiement"}
        </button>
        
      </div>

      <aside className="co-right">
        <div className="co-summary">
          {items.length === 0 ? (
            <div className="co-empty">Votre panier est vide.</div>
          ) : (
            <>
              <ul className="co-items">
                {items.map((i) => (
                  <li key={i.key} className="co-item">
                    <img src={i.image} alt={i.name} />
                    <div className="co-item-info">
                      <div className="co-item-name">{i.name}</div>
                      {i.variantLabel && <div className="co-item-variant">{i.variantLabel}</div>}
                      <div className="co-item-qty">× {i.qty || 1}</div>
                    </div>
                    <div className="co-item-price">
                      {(Number(i.price) * Number(i.qty || 1)).toFixed(2)} MAD
                    </div>
                  </li>
                ))}
              </ul>

              <div className="co-line">
                <span>Sous-total</span>
                <b>{Number(totals.subtotal || 0).toFixed(2)} MAD</b>
              </div>
              <div className="co-line">
                <span>Expédition</span>
                <b>{Number(shippingPrice).toFixed(2)} MAD</b>
              </div>
              <div className="co-total">
                <span>Total</span>
                <b>{Number(total).toFixed(2)} MAD</b>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
