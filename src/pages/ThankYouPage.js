// frontend/src/pages/ThankYouPage.js
import React, { useEffect, useState } from "react";
import { Alert } from "react-bootstrap";

export default function ThankYouPage() {
  const [wa, setWa] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    try {
      const w = sessionStorage.getItem("wa_url") || "";
      const o = sessionStorage.getItem("order_id") || "";
      setWa(w);
      setOrderId(o);
    } catch {}
  }, []);

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 8 }}>Merci ✅</h2>
      <p style={{ color: "#6b7280" }}>
        Votre commande {orderId ? <b>#{orderId}</b> : null} est enregistrée.
        Cliquez sur le bouton ci-dessous pour ouvrir WhatsApp et confirmer.
      </p>

      {!wa ? (
        <Alert variant="warning">
          Lien WhatsApp introuvable. Merci de revenir au checkout et réessayer.
        </Alert>
      ) : (
        <>
          <a
            href={wa}
            target="_blank"
            rel="noopener noreferrer"
            className="co-submit"
            style={{ display: "inline-block", textAlign: "center" }}
          >
            Ouvrir WhatsApp
          </a>

          <div style={{ marginTop: 12, fontSize: 13, color: "#6b7280" }}>
            Si WhatsApp ne s’ouvre pas, copiez/collez ce lien :
            <div style={{ wordBreak: "break-all", marginTop: 6 }}>{wa}</div>
          </div>
        </>
      )}
    </div>
  );
}
