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
  return (
    ua.includes("instagram") ||
    ua.includes("fbav") ||
    ua.includes("fban") ||
    ua.includes("tiktok")
  );
}

export default function ThankYouPage() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [storedWaUrl, setStoredWaUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const qid = p.get("order") || "";

    // 1) try query param
    let id = qid;

    // 2) fallback sessionStorage
    if (!id) {
      try {
        id = sessionStorage.getItem("last_order_id") || "";
      } catch {}
    }

    // 3) fallback localStorage (more reliable in some in-app browsers)
    if (!id) {
      try {
        id = localStorage.getItem("last_order_id") || "";
      } catch {}
    }

    setOrderId(id);

    // Load stored WhatsApp URL from storage (so WA button always exists)
    try {
      const wa = sessionStorage.getItem("last_wa_url") || "";
      if (wa) setStoredWaUrl(wa);
    } catch {}
    try {
      const wa2 = localStorage.getItem("last_wa_url") || "";
      if (wa2) setStoredWaUrl((prev) => prev || wa2);
    } catch {}

    if (!id) {
      setLoading(false);
      return;
    }

    // Try to fetch full order details (may fail for guests; WA link still works)
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getOrder(id);
        if (!alive) return;
        setOrder(data);
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e?.message || "Could not load the order details.");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const waUrl = useMemo(() => {
    // ✅ priority: stored WA url (works even if order fetch fails)
    if (storedWaUrl) return storedWaUrl;

    // fallback: rebuild from fetched order (if available)
    if (!order) return "";

    const to = normalizePhone(SHOP.WHATSAPP);
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
    lines.push("Please confirm my order 🙏");

    const msg = encodeURIComponent(lines.join("\n"));
    return `https://wa.me/${to}?text=${msg}`;
  }, [order, storedWaUrl]);

  const copyMessage = async () => {
    if (!waUrl) return;

    const text = decodeURIComponent(
      (waUrl.split("text=")[1] || "").replace(/\+/g, " ")
    );

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

        {!!err && (
          <Alert variant="warning">
            {err}
            <div style={{ marginTop: 6, fontSize: 13 }}>
              No worries — your order can still be confirmed via WhatsApp below.
            </div>
          </Alert>
        )}

        {!loading && orderId && (
          <>
            <div style={{ marginBottom: 10, color: "#111827" }}>
              <div>
                <b>Order #{orderId}</b>
              </div>
              {order?.grand_total != null && (
                <div style={{ marginTop: 6 }}>
                  Total: <b>{Number(order.grand_total || 0).toFixed(2)} MAD</b>
                </div>
              )}
              {order?.created_at_local && (
                <div style={{ marginTop: 6, color: "#6b7280", fontSize: 13 }}>
                  Created at: {order.created_at_local}
                </div>
              )}
            </div>

            {order?.items?.length ? (
              <div className="pd-card" style={{ marginBottom: 12 }}>
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Items</div>
                <ul style={{ paddingLeft: 18, marginBottom: 0 }}>
                  {order.items.map((it) => (
                    <li key={it.id}>
                      {it.name}
                      {it.variant_label ? ` (${it.variant_label})` : ""} —{" "}
                      {Number(it.unit_price || 0).toFixed(2)} MAD × {it.quantity}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {waUrl ? (
              <>
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
            ) : (
              <Alert variant="danger">
                WhatsApp link is missing. Please go back to checkout and place your order again.
              </Alert>
            )}
          </>
        )}
      </div>
    </div>
  );
}
