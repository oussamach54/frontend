// frontend/src/pages/CheckoutPage.js
import React, { useEffect, useMemo, useState } from "react";
import { Alert } from "react-bootstrap";
import api from "../api";
import { useCart } from "../cart/CartProvider";
import { SHOP } from "../config/shop";
import { createOrder } from "../apiOrders";
import { useHistory } from "react-router-dom";
import "./checkout.css";

/** Fallback if API is unreachable */
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

async function tryUrls(calls) {
  let lastErr;
  for (const call of calls) {
    try {
      return await call();
    } catch (e) {
      const code = e?.response?.status;
      if (code !== 404 && code !== 405) throw e;
      lastErr = e;
    }
  }
  throw lastErr || new Error("All endpoint candidates failed");
}

export default function CheckoutPage() {
  const history = useHistory();
  const { items, totals, clear } = useCart();

  // contact + adresse
  const [email, setEmail] = useState("");
  const [first, setFirst] = useState("");
  const [last, setLast] = useState("");
  const [addr, setAddr] = useState("");
  const [apt, setApt] = useState("");
  const [zip, setZip] = useState("");
  const [city, setCity] = useState("");
  const [phone, setPhone] = useState("");

  // expédition
  const [rates, setRates] = useState(FALLBACK_RATES);
  const [shippingPrice, setShippingPrice] = useState(0);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // load shipping rates
  useEffect(() => {
    let alive = true;
    const isProdApp =
      typeof window !== "undefined" &&
      window.location.hostname.endsWith("miniglowbyshay.cloud") &&
      !window.location.hostname.startsWith("api.");
    const ABS_API = "https://api.miniglowbyshay.cloud";

    (async () => {
      try {
        const { data, hit } = await tryUrls([
          async () => {
            const res = await api.get("/payments/shipping-rates/");
            return { data: res.data, hit: "api:/payments/shipping-rates/" };
          },
          async () => {
            const res = await api.get("/api/payments/shipping-rates/");
            return { data: res.data, hit: "api:/api/payments/shipping-rates/" };
          },
          ...(isProdApp
            ? [
                async () => {
                  const res = await fetch(
                    `${ABS_API}/api/payments/shipping-rates/`,
                    { credentials: "omit" }
                  );
                  if (!res.ok)
                    throw Object.assign(
                      new Error(`HTTP ${res.status}`),
                      { response: { status: res.status } }
                    );
                  const json = await res.json();
                  return {
                    data: json,
                    hit: `abs:${ABS_API}/api/payments/shipping-rates/`,
                  };
                },
              ]
            : []),
        ]);

        if (!alive) return;
        if (Array.isArray(data) && data.length) {
          const normalized = data
            .filter((r) => r.active !== false)
            .map((r) => ({
              city: r.city || r.ville || "",
              price: Number(r.price ?? r.tarif ?? 0),
            }))
            .filter((r) => r.city)
            .sort((a, b) => a.city.localeCompare(b.city, "fr"));
          if (normalized.length) {
            console.log("[Checkout] Shipping rates loaded from:", hit);
            setRates(normalized);
            return;
          }
        }
        console.warn("[Checkout] API returned empty list; using fallback.");
      } catch (e) {
        console.warn(
          "[Checkout] Failed to load API shipping rates; using fallback.",
          e?.message || e
        );
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!rates.length) return;
    const def =
      rates.find((r) => r.city.toLowerCase() === "casablanca") || rates[0];
    setCity(def.city);
    setShippingPrice(Number(def.price || 0));
  }, [rates]);

  const total = useMemo(
    () => (Number(totals.subtotal) || 0) + Number(shippingPrice || 0),
    [totals.subtotal, shippingPrice]
  );

  const buildWhatsAppUrl = (createdOrder) => {
    const lines = [];
    lines.push(
      `*${SHOP.BRAND}* – Nouvelle commande #${createdOrder?.id ?? "?"}`
    );
    lines.push("");
    lines.push("*Articles :*");
    items.forEach((it) => {
      const q = Number(it.qty || 1);
      const p = Number(it.price).toFixed(2);
      lines.push(
        `• ${it.name}${
          it.variantLabel ? " (" + it.variantLabel + ")" : ""
        } — ${p} MAD × ${q}`
      );
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
    lines.push(
      `Nom : ${(first || "").trim()} ${(last || "").trim()}`.trim()
    );
    lines.push(`Téléphone : ${phone || "-"}`);
    lines.push(
      `Adresse : ${addr}${apt ? ", " + apt : ""}${
        zip ? ", " + zip : ""
      }${city ? " – " + city : ""}`.trim()
    );
    lines.push("");
    lines.push("Merci de confirmer ma commande 🙏");
    const msg = encodeURIComponent(lines.join("\n"));
    return `https://wa.me/${SHOP.WHATSAPP}?text=${msg}`;
  };

  const submit = async () => {
    setErr("");
    if (!items.length) {
      setErr("Votre panier est vide.");
      return;
    }
    if (!addr || !city || !phone) {
      setErr("Adresse, ville et téléphone sont obligatoires.");
      return;
    }

    try {
      setLoading(true);

      const full_name =
        `${(first || "").trim()} ${(last || "").trim()}`.trim() ||
        last ||
        first ||
        "Client";

      const payload = {
        full_name,
        email,
        phone,
        city,
        address: `${addr}${apt ? ", " + apt : ""}${
          zip ? ", " + zip : ""
        }`.trim(),
        notes: "",
        payment_method: "cod",
        shipping_price: Number(shippingPrice || 0), // ✅ send shipping price
        items: items.map((it) => ({
          product_id: it.id,
          variant_id: it.variantId || null,
          quantity: Number(it.qty || 1),
        })),
      };

      // 1) Save order to backend
      const order = await createOrder(payload);

      // 2) Open WhatsApp
      const wa = buildWhatsAppUrl(order);
      window.open(wa, "_blank", "noopener,noreferrer");

      // 3) Clear cart + redirect to order page
      clear();
      history.replace(`/order/${order.id}/`);
    } catch (e) {
      setErr(
        e?.response?.data?.detail ||
          e.message ||
          "Impossible d’enregistrer la commande."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="co-wrap">
      <div className="co-left">
        <h2 className="co-title">Contact</h2>
        <div className="co-field">
          <label>E-mail ou numéro de portable</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <h2 className="co-title">Livraison</h2>
        <div className="co-grid-2">
          <div className="co-field">
            <label>Prénom (optionnel)</label>
            <input
              value={first}
              onChange={(e) => setFirst(e.target.value)}
            />
          </div>
          <div className="co-field">
            <label>Nom</label>
            <input
              value={last}
              onChange={(e) => setLast(e.target.value)}
            />
          </div>
        </div>

        <div className="co-field">
          <label>Adresse</label>
          <input
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
          />
        </div>

        <div className="co-grid-2">
          <div className="co-field">
            <label>Appartement, suite, etc. (optionnel)</label>
            <input
              value={apt}
              onChange={(e) => setApt(e.target.value)}
            />
          </div>
          <div className="co-field">
            <label>Ville</label>
            <input value={city} readOnly />
          </div>
        </div>

        <div className="co-grid-2">
          <div className="co-field">
            <label>Code postal (facultatif)</label>
            <input
              value={zip}
              onChange={(e) => setZip(e.target.value)}
            />
          </div>
          <div className="co-field">
            <label>Téléphone</label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div className="co-block">
          <div className="co-block-title">Mode d’expédition</div>
          <div className="co-ship-list">
            {rates.map((r) => {
              const checked = r.city === city;
              return (
                <label
                  key={r.city}
                  className={`co-ship-row ${
                    checked ? "is-active" : ""
                  }`}
                >
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
                  <span className="co-ship-price">
                    {Number(r.price).toFixed(2)} MAD
                  </span>
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
              <div className="co-pay-title">
                Paiement à la livraison
              </div>
              <div className="co-pay-help">
                Paiement à la livraison disponible dans toutes les
                villes du Maroc. Pas besoin de payer en ligne. La
                confirmation se fait sur WhatsApp.
              </div>
            </div>
          </div>
        </div>

        {err && (
          <Alert variant="danger" className="mt-2">
            {err}
          </Alert>
        )}

        <button
          className="co-submit"
          onClick={submit}
          disabled={loading}
        >
          {loading
            ? "Redirection vers WhatsApp…"
            : "Valider la commande"}
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
                      {i.variantLabel && (
                        <div className="co-item-variant">
                          {i.variantLabel}
                        </div>
                      )}
                      <div className="co-item-qty">
                        × {i.qty || 1}
                      </div>
                    </div>
                    <div className="co-item-price">
                      {(
                        Number(i.price) * Number(i.qty || 1)
                      ).toFixed(2)}{" "}
                      MAD
                    </div>
                  </li>
                ))}
              </ul>

              <div className="co-line">
                <span>Sous-total</span>
                <b>
                  {Number(totals.subtotal || 0).toFixed(2)} MAD
                </b>
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
