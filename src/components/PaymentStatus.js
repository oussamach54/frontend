// src/components/PaymentStatus.js
import { useEffect, useState } from "react";
import axios from "axios";

export default function PaymentStatus() {
  const [s, setS] = useState("checking");

  const orderId =
    new URLSearchParams(window.location.search).get("order") ||
    localStorage.getItem("lastOrderId");

  useEffect(() => {
    let ok = true;
    if (!orderId) { setS("unknown"); return; }

    (async () => {
      for (let i = 0; i < 6; i++) {
        try {
          const { data } = await axios.get(`/api/payments/order/${orderId}/status/`);
          if (!ok) return;
          if (["paid", "failed", "canceled"].includes(data.status)) {
            setS(data.status);
            return;
          }
        } catch {
          // ignore one-off errors
        }
        await new Promise(r => setTimeout(r, 1500));
      }
      setS("pending");
    })();

    return () => { ok = false; };
  }, [orderId]);

  if (s === "paid")      return <div className="container py-5"><div className="alert alert-success">Paiement confirmé ✅</div></div>;
  if (s === "failed")    return <div className="container py-5"><div className="alert alert-danger">Paiement refusé ❌</div></div>;
  if (s === "canceled")  return <div className="container py-5"><div className="alert alert-warning">Paiement annulé ⚠️</div></div>;
  if (s === "pending")   return <div className="container py-5"><div className="alert alert-info">En attente de confirmation…</div></div>;
  if (s === "unknown")   return <div className="container py-5"><div className="alert alert-secondary">Commande introuvable</div></div>;
  return                      <div className="container py-5"><div className="alert alert-light">Vérification du paiement…</div></div>;
}
