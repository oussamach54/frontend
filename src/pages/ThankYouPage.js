import React, { useEffect, useMemo, useState } from "react";
import { Alert, Spinner } from "react-bootstrap";
import { getPublicOrder } from "../apiOrders";
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
  const [token, setToken] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const qOrder = p.get("order") || "";
    const qToken = p.get("token") || "";

    let sid = qOrder;
    let stok = qToken;

    try {
      if (!sid) sid = sessionStorage.getItem("last_order_id") || "";
      if (!stok) stok = sessionStorage.getItem("last_order_token") || "";
    } catch {}

    setOrderId(sid);
    setToken(stok);

    if (!sid || !stok) {
      setLoading(false);
      return;
    }

    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const data = await getPublicOrder(sid, stok);
        if (!alive) return;
        setOrder(data);
      } catch (e) {
        if (!alive) return;
        setErr(
          e?.response?.data?.detail ||
            e?.message ||
            "Impossible de charger la commande."
        );
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
    lines.push(`*${SHOP.BRAND}* – Commande #${order.id}`);
    lines.push("");
    lines.push("*Articles :*");

    (order.items || []).forEach((it) => {
      const q = Number(it.quantity || 1);
      const p = Number(it.unit_price || 0).toFixed(2);
      const label = it.variant_label ? ` (${it.variant_label})` : "";
      lines.push(`• ${it.name}${label} — ${p} MAD × ${q}`);
    });

    lines.push("");
    lines.push(
      `Sous-total : ${Number(order.items_total || 0).toFixed(2)} MAD`
    );
    lines.push(
      `Livraison : ${Number(order.shipping_price || 0).toFixed(2)} MAD`
    );
    lines.push(
      `*Total : ${Number(order.grand_total || 0).toFixed(2)} MAD*`
    );
    lines.push("");
    lines.push("*Client :*");
    lines.push(`Nom : ${order.full_name || "-"}`);
    lines.push(`Téléphone : ${order.phone || "-"}`);
    lines.push(`Ville : ${order.city || "-"}`);
    lines.push(`Adresse : ${order.address || "-"}`);
    lines.push("");
    lines.push("Merci de confirmer ma commande 🙏");

    const msg = encodeURIComponent(lines.join("\n"));
    const to = normalizePhone(SHOP.WHATSAPP);
    return `https://wa.me/${to}?text=${msg}`;
  }, [order]);

  return (
    <div className="co-wrap" style={{ justifyContent: "center" }}>
      <div className="co-left" style={{ maxWidth: 720 }}>
        <h2 className="co-title">Merci pour votre commande ✅</h2>

        {isInAppBrowser() && (
          <Alert variant="warning">
            Vous utilisez un navigateur intégré (Instagram / Facebook / TikTok).
            Si WhatsApp ne s’ouvre pas, appuyez sur le menu (⋮) puis choisissez{" "}
            <b>Ouvrir dans le navigateur</b>.
          </Alert>
        )}

        {loading && (
          <div className="d-flex align-items-center" style={{ gap: 10 }}>
            <Spinner animation="border" size="sm" />
            <div>Chargement de votre commande…</div>
          </div>
        )}

        {!loading && (!orderId || !token) && (
          <Alert variant="danger">
            Aucune commande trouvée. Veuillez repasser votre commande.
          </Alert>
        )}

        {err && <Alert variant="danger">{err}</Alert>}

        {!loading && order && (
          <>
            <div style={{ marginBottom: 10, color: "#111827" }}>
              Votre commande a été enregistrée avec succès.
              <div style={{ marginTop: 6 }}>
                <b>Commande #{order.id}</b> — Total :{" "}
                <b>{Number(order.grand_total || 0).toFixed(2)} MAD</b>
              </div>
              <div style={{ marginTop: 6, color: "#6b7280", fontSize: 13 }}>
                Date : {order.created_at_local || order.created_at}
              </div>
            </div>

            <div className="pd-card" style={{ marginBottom: 12 }}>
              <div style={{ fontWeight: 700, marginBottom: 8 }}>Articles</div>
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
              Ouvrir WhatsApp pour confirmer
            </a>

            <div style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>
              Si WhatsApp ne s’ouvre pas, envoyez le message manuellement au numéro :
              <b> {SHOP.WHATSAPP}</b>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
