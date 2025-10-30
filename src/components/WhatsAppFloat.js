import React from "react";
import "./WhatsAppFloat.css";

/**
 * WhatsApp floating pill.
 * Props :
 *  - phone: "212689398538"   (sans +)
 *  - label: texte du bouton
 *  - message: message par défaut (facultatif)
 *  - position: "left" | "right"  (défaut: "left")
 */
export default function WhatsAppFloat({
  phone = "212689398538",
  label = "WhatsApp",
  message = "Bonjour ! J’aimerais avoir des recommandations produits 🙂",
  position = "left",
}) {
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`wa-float wa-${position}`}
      aria-label="Contacter via WhatsApp"
    >
      <span className="wa-icon" aria-hidden="true">
        {/* SVG WhatsApp */}
        <svg viewBox="0 0 32 32" width="20" height="20">
          <path
            d="M19.1 17.2c-.3-.2-.7-.4-1.1-.2-.3.1-.6.5-.8.8-.1.2-.3.3-.5.2-1.1-.4-2-1-2.8-1.9-.2-.2-.4-.5-.2-.8.2-.2.4-.5.5-.8.1-.3 0-.7-.1-1l-.5-1.2c-.1-.3-.3-.6-.6-.7-.3-.2-.7-.1-1 .1-.5.3-.9.8-1.1 1.3-.2.6-.2 1.2 0 1.8.3 1 .9 2 1.7 2.8 1.2 1.3 2.8 2.2 4.6 2.6.6.1 1.3.1 1.9-.1.6-.2 1.1-.6 1.4-1.2.2-.4.2-.8 0-1.1-.1-.4-.4-.6-.8-.8z"
            fill="#fff"
          />
          <path
            d="M27.6 4.4C24.7 1.6 20.9 0 16.9 0 7.8 0 .6 7.2.6 16.2c0 2.8.7 5.5 2 7.9L0 32l8.2-2.5c2.3 1.2 4.9 1.8 7.6 1.8h0c9.1 0 16.3-7.2 16.3-16.2 0-3.9-1.6-7.7-4.5-10.6zM16 29.2c-2.4 0-4.7-.6-6.8-1.7l-.5-.3-4.9 1.5 1.6-4.7-.3-.5c-1.2-2-1.8-4.3-1.8-6.6C3.3 8.3 9 2.6 16 2.6c3.3 0 6.4 1.3 8.8 3.6 2.3 2.3 3.6 5.5 3.6 8.8 0 6.9-5.7 13.6-12.4 14.2H16z"
            fill="#fff"
          />
        </svg>
      </span>
      <span className="wa-label">{label}</span>
    </a>
  );
}
