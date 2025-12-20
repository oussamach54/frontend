// frontend/src/pages/ThankYouPage.js
import React, { useEffect, useMemo, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { getOrder } from "../apiOrders";
import { SHOP } from "../config/shop";

function normalizePhone(p) {
  return String(p || "").replace(/[^\d]/g, "");
}

function isInAppBrowser() {
  const ua = (navigator.userAgent || "").toLowerCase();
  return ua.includes("instagram") || ua.includes("fbav") || ua.includes("fban") || ua.includes("tiktok");
}

export default function ThankYouPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let id = "";
    try {
      id = sessionStorage.getItem("last_order_id") || "";
    } catch {}
    setOrderId(id);

    if (!id) {
      setLoading(false);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getOrder(id);
        if (!alive) return;
        setOrder(data);
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Could not load the order.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const waUrl = useMemo(() => {
    if (!order) return "";
    const lines = [];
    lines.push(`*${SHOP.BRAND}* – Order #${order.id}`);
    lines.push("");
    lines.push("*Items:*");

    (order.items || []).forEach((it) => {
      const q = Number(it.quantity || 1);
      const p = Number(it.unit_price || 0).toFixed(2);
      const label = it.variant_label ? ` (${it.variant_label})` : "";
      lines.push(`• ${it.name}${label} — ${p} MAD × ${q}`);
    });

    lines.push("");
    lines.push(`Subtotal: ${Number(order.items_total || 0).toFixed(2)} MAD`);
    lines.push(`Shipping: ${Number(order.shipping_price || 0).toFixed(2)} MAD`);
    lines.push(`*Total: ${Number(order.grand_total || 0).toFixed(2)} MAD*`);
    lines.push("");
    lines.push("*Customer:*");
    lines.push(`Name: ${order.full_name || "-"}`);
    lines.push(`Phone: ${order.phone || "-"}`);
    lines.push(`City: ${order.city || "-"}`);
    lines.push(`Address: ${order.address || "-"}`);
    lines.push("");
    lines.push("Please confirm my order 🙏");

    const msg = encodeURIComponent(lines.join("\n"));
    const to = normalizePhone(SHOP.WHATSAPP);
    return `https://wa.me/${to}?text=${msg}`;
  }, [order]);

  const copyMessage = async () => {
    if (!waUrl) return;
    // extract decoded message from url
    const text = decodeURIComponent((waUrl.split("text=")[1] || "").replace(/\+/g, " "));
    try {
      await navigator.clipboard.writeText(text);
      alert("Message copied. Open WhatsApp and paste it.");
    } catch {
      alert("Copy failed. Please manually copy the message shown.");
    }
  };

  return (
    <div className="co-wrap" style={{ justifyContent: "center" }}>
      <div className="co-left" style={{ maxWidth: 720 }}>
        <h2 className="co-title">Thank you ✅</h2>

        {isInAppBrowser() && (
          <Alert variant="warning">
            You are using an in-app browser (Instagram/Facebook/TikTok). If WhatsApp doesn’t open,
            tap the menu (⋮) and choose <b>Open in Browser</b>.
          </Alert>
        )}

        {loading && (
          <div className="d-flex align-items-center" style={{ gap: 10 }}>
            <Spinner animation="border" size="sm" />
            <div>Loading your order…</div>
          </div>
        )}

        {!loading && !orderId && (
          <Alert variant="danger">
            No order found. Please go back to checkout and place your order again.
          </Alert>
        )}

        {err && <Alert variant="danger">{err}</Alert>}

        {!loading && order && (
          <>
            <div style={{ marginBottom: 10, color: "#111827" }}>
              Your order is saved successfully.
              <div style={{ marginTop: 6 }}>
                <b>Order #{order.id}</b> — Total:{" "}
                <b>{Number(order.grand_total || 0).toFixed(2)} MAD</b>
              </div>
              <div style={{ marginTop: 6, color: "#6b7280", fontSize: 13 }}>
                Created at: {order.created_at_local || order.created_at}
              </div>
            </div>

            <div className="pd-card" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Items</div>
              <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
                {(order.items || []).map((it) => (
                  <li key={it.id}>
                    {it.name}
                    {it.variant_label ? ` (${it.variant_label})` : ""} —{" "}
                    {Number(it.unit_price || 0).toFixed(2)} MAD × {it.quantity}
                  </li>
                ))}
              </ul>
            </div>

            <a
              className="co-submit"
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", textAlign: "center" }}
            >
              Open WhatsApp to confirm
            </a>

            <button
              className="pd-btn-outline"
              onClick={copyMessage}
              style={{ marginLeft: 10 }}
              type="button"
            >
              Copy message
            </button>

            <div style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>
              If WhatsApp still doesn’t open, copy the message and send it to:
              <b> {SHOP.WHATSAPP}</b>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
