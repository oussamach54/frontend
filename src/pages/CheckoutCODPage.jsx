// src/pages/CheckoutCODPage.jsx
import React, { useMemo, useState } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { getCart, cartTotal, clearCart } from "../utils/cart";
import { createOrder } from "../apiOrders";
import { SHOP } from "../config/shop";

function normalizePhone(p) {
  return String(p || "").replace(/[^\d]/g, "");
}

function buildWhatsAppUrlFromOrder(order) {
  const to = normalizePhone(SHOP.WHATSAPP);

  const lines = [];
  lines.push(`*${SHOP.BRAND}* – Order #${order?.id ?? "?"}`);
  lines.push("");
  lines.push("*Items:*");

  (order?.items || []).forEach((it) => {
    const q = Number(it.quantity || 1);
    const p = Number(it.unit_price || 0).toFixed(2);
    const label = it.variant_label ? ` (${it.variant_label})` : "";
    lines.push(`• ${it.name}${label} — ${p} MAD × ${q}`);
  });

  lines.push("");
  lines.push(`Subtotal: ${Number(order?.items_total || 0).toFixed(2)} MAD`);
  lines.push(`Shipping: ${Number(order?.shipping_price || 0).toFixed(2)} MAD`);
  lines.push(`*Total: ${Number(order?.grand_total || 0).toFixed(2)} MAD*`);
  lines.push("");
  lines.push("*Customer:*");
  lines.push(`Name: ${order?.full_name || "-"}`);
  lines.push(`Phone: ${order?.phone || "-"}`);
  lines.push(`City: ${order?.city || "-"}`);
  lines.push(`Address: ${order?.address || "-"}`);
  lines.push("");
  lines.push("Please confirm my order 🙏");

  const msg = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${to}?text=${msg}`;
}

export default function CheckoutCODPage() {
  const history = useHistory();
  const [items] = useState(getCart());
  const total = useMemo(() => Number(cartTotal(items).toFixed(2)), [items]);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    if (!items.length) {
      setErr("Your cart is empty.");
      return;
    }
    if (!phone.trim() || !address.trim()) {
      setErr("Phone and address are required.");
      return;
    }

    try {
      setLoading(true);

      // ✅ Convert local cart format to backend /orders/ format
      // IMPORTANT: your backend OrderCreateSerializer expects:
      // items: [{ product_id, variant_id, quantity }]
      // If your local cart doesn't store variantId, send null.
      const orderPayload = {
        full_name: customerName?.trim() || "Client",
        email: "", // keep empty if you don’t ask here
        phone: phone.trim(),
        city: (city || "").trim(),
        address: address.trim(),
        notes: notes || "",
        payment_method: "cod",
        shipping_price: 0, // COD quick page: no shipping calculation here (you can improve later)
        items: items.map((it) => ({
          product_id: it.id,
          variant_id: it.variantId || null,
          quantity: Number(it.qty || 1),
        })),
      };

      // ✅ PRIORITY: save order in your real Order table (+ sheet)
      const order = await createOrder(orderPayload);

      // ✅ Build WhatsApp url from saved order (backend truth)
      const wa = buildWhatsAppUrlFromOrder(order);

      // ✅ store for thank-you page
      try {
        sessionStorage.setItem("last_order_id", String(order?.id || ""));
        sessionStorage.setItem("last_wa_url", wa);
      } catch {}
      try {
        localStorage.setItem("last_order_id", String(order?.id || ""));
        localStorage.setItem("last_wa_url", wa);
      } catch {}

      setOk(true);

      // ✅ clear cart only after order saved
      clearCart();

      // ✅ go to thank-you (user clicks WhatsApp there)
      window.location.href = `/thank-you?order=${order?.id || ""}`;
    } catch (e2) {
      const msg =
        e2?.response?.data?.detail ||
        e2?.message ||
        "An error happened while creating the order.";
      setErr(typeof msg === "string" ? msg : "Unknown error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Cash on Delivery Checkout</h1>

      {err && <Alert variant="danger">{err}</Alert>}
      {ok && <Alert variant="success">Order saved. Redirecting to confirmation page…</Alert>}

      <div className="row">
        {/* Cart Summary */}
        <div className="col-lg-5 mb-4">
          <Card>
            <Card.Header>
              <strong>Your cart</strong>
            </Card.Header>
            <Card.Body>
              {!items.length && <p>Cart is empty.</p>}
              {!!items.length && (
                <ul className="list-unstyled">
                  {items.map((it, idx) => (
                    <li
                      key={idx}
                      className="d-flex justify-content-between align-items-center mb-2"
                    >
                      <div>
                        <div className="small text-muted">#{it.id}</div>
                        <div>{it.name}</div>
                        <div className="small">Qty: {it.qty}</div>
                      </div>
                      <div>{Number(it.price).toFixed(2)} MAD</div>
                    </li>
                  ))}
                </ul>
              )}
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total</strong>
                <strong>{total.toFixed(2)} MAD</strong>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Shipping Form */}
        <div className="col-lg-7">
          <Card>
            <Card.Header>
              <strong>Delivery information</strong>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={submit}>
                <Form.Group controlId="customerName" className="mb-3">
                  <Form.Label>Full name</Form.Label>
                  <Form.Control
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ex. John Doe"
                  />
                </Form.Group>

                <Form.Group controlId="phone" className="mb-3">
                  <Form.Label>Phone *</Form.Label>
                  <Form.Control
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06XXXXXXXX"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="address" className="mb-3">
                  <Form.Label>Full address *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Street, neighborhood, etc."
                    required
                  />
                </Form.Group>

                <Form.Group controlId="city" className="mb-3">
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Casablanca"
                  />
                </Form.Group>

                <Form.Group controlId="notes" className="mb-3">
                  <Form.Label>Notes (optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Example: deliver after 18:00"
                  />
                </Form.Group>

                <Button type="submit" variant="dark" disabled={loading || !items.length}>
                  {loading ? "Saving…" : "Valider la commande"}
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  className="ml-2"
                  onClick={() => history.push("/cart")}
                  disabled={loading}
                >
                  Back to cart
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
