// frontend/src/pages/ThankYouPage.js
import React, { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";
import "./checkout.css";

export default function ThankYouPage() {
  const [waUrl, setWaUrl] = useState("");
  const [orderId, setOrderId] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    try {
      const url = sessionStorage.getItem("wa_url") || "";
      const oid = sessionStorage.getItem("order_id") || "";
      setWaUrl(url);
      setOrderId(oid);

      if (!url) setErr("Lien WhatsApp introuvable. Revenez au panier et réessayez.");
    } catch {
      setErr("Impossible de récupérer le lien WhatsApp. Revenez au panier et réessayez.");
    }
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(waUrl);
      alert("Lien copié ✅");
    } catch {
      alert("Impossible de copier automatiquement. Copiez le lien manuellement.");
    }
  };

  return (
    <div className="co-wrap" style={{ justifyContent: "center" }}>
      <div className="co-left" style={{ maxWidth: 620 }}>
        <h2 className="co-title">Commande enregistrée ✅</h2>

        <p style={{ color: "#6b7280", marginBottom: 16 }}>
          {orderId ? (
            <>
              Votre commande <b>#{orderId}</b> est bien enregistrée.
            </>
          ) : (
            <>Votre commande est bien enregistrée.</>
          )}{" "}
          Cliquez sur le bouton ci-dessous pour ouvrir WhatsApp et confirmer.
        </p>

        {err && (
          <Alert variant="danger" className="mt-2">
            {err}
          </Alert>
        )}

        {waUrl && (
          <>
            {/* ✅ important: bouton = user gesture => pas de page blanche */}
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="co-submit"
              style={{ display: "inline-block", textAlign: "center" }}
            >
              Ouvrir WhatsApp
            </a>

            <div
              style={{
                marginTop: 14,
                fontSize: 13,
                color: "#6b7280",
                lineHeight: 1.5,
              }}
            >
              Si WhatsApp ne s’ouvre pas, copiez/collez ce lien dans votre navigateur :
              <div
                style={{
                  marginTop: 8,
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: 12,
                  padding: 12,
                  wordBreak: "break-all",
                }}
              >
                {waUrl}
              </div>

              <button
                type="button"
                onClick={copy}
                className="co-submit"
                style={{
                  marginTop: 10,
                  display: "inline-block",
                  width: "auto",
                  padding: "10px 18px",
                }}
              >
                Copier le lien
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
