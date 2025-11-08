import React, { useState } from "react";
import "./contact.css";

/**
 * Edit these 4 values and you're done.
 * phone must be international format without "+" for wa.me
 */
const ADMIN_CONTACT = {
  whatsappIntl: "212689398538",            // e.g. 212612345678
  whatsappPretty: "+212 6 89 39 85 38",    // how you want to display it
  email: "labshaay@gmail.com",
  instagram: "https://instagram.com/@miniglowbyshay",
  tiktok: "https://www.tiktok.com/@miniglowby_shay",
};

export default function ContactPage() {
  const [copied, setCopied] = useState("");

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied(""), 1200);
    } catch {
      // do nothing if permission denied
    }
  };

  const openWhatsApp = () => {
    const url = `https://wa.me/${ADMIN_CONTACT.whatsappIntl}?text=${encodeURIComponent(
      "Bonjour 👋, j’aimerais avoir des informations."
    )}`;
    window.open(url, "_blank", "noopener");
  };

  return (
    <div className="cc-wrap">
      <div className="cc-hero">
        <h1>Contacter nous</h1>
        <p>Nous répondons vite sur WhatsApp et Instagram 💬</p>
      </div>

      <div className="cc-card">
        {/* Corner shimmer */}
        <span className="cc-shimmer" aria-hidden />

        <header className="cc-head">
          <div className="cc-avatar">
            {/* Your logo — or keep initials */}
            <img src="/brand/logop.png" alt="MiniGlow by Shay" />
          </div>
          <div className="cc-title">
            <h2>Service Client</h2>
            <p>Casablanca, Maroc</p>
          </div>
        </header>

        <div className="cc-grid">
          {/* WhatsApp */}
          <div className="cc-item">
            <div className="cc-icon is-wa">
              <i className="fab fa-whatsapp" />
            </div>
            <div className="cc-info">
              <div className="cc-label">WhatsApp</div>
              <div className="cc-value">{ADMIN_CONTACT.whatsappPretty}</div>
            </div>
            <div className="cc-actions">
              <button className="cc-btn primary" onClick={openWhatsApp}>
                Ouvrir le chat
              </button>
              <button
                className="cc-btn ghost"
                onClick={() => copy(ADMIN_CONTACT.whatsappIntl, "wa")}
                title="Copier le numéro"
              >
                {copied === "wa" ? "Copié" : "Copier"}
              </button>
            </div>
          </div>

          {/* Email */}
          <div className="cc-item">
            <div className="cc-icon is-mail">
              <i className="fas fa-envelope" />
            </div>
            <div className="cc-info">
              <div className="cc-label">E-mail</div>
              <div className="cc-value">{ADMIN_CONTACT.email}</div>
            </div>
            <div className="cc-actions">
              <a
                className="cc-btn"
                href={`mailto:${ADMIN_CONTACT.email}`}
                rel="noopener"
              >
                Écrire
              </a>
              <button
                className="cc-btn ghost"
                onClick={() => copy(ADMIN_CONTACT.email, "mail")}
              >
                {copied === "mail" ? "Copié" : "Copier"}
              </button>
            </div>
          </div>

          {/* Instagram */}
          <div className="cc-item">
            <div className="cc-icon is-ig">
              <i className="fab fa-instagram" />
            </div>
            <div className="cc-info">
              <div className="cc-label">Instagram</div>
              <div className="cc-value">@miniglowbyshay</div>
            </div>
            <div className="cc-actions">
              <a
                className="cc-btn"
                href={ADMIN_CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ouvrir
              </a>
              <button
                className="cc-btn ghost"
                onClick={() => copy(ADMIN_CONTACT.instagram, "ig")}
              >
                {copied === "ig" ? "Copié" : "Copier"}
              </button>
            </div>
          </div>

          {/* TikTok */}
          <div className="cc-item">
            <div className="cc-icon is-tt">
              <i className="fab fa-tiktok" />
            </div>
            <div className="cc-info">
              <div className="cc-label">TikTok</div>
              <div className="cc-value">@miniglowby_shay</div>
            </div>
            <div className="cc-actions">
              <a
                className="cc-btn"
                href={ADMIN_CONTACT.tiktok}
                target="_blank"
                rel="noopener noreferrer"
              >
                Ouvrir
              </a>
              <button
                className="cc-btn ghost"
                onClick={() => copy(ADMIN_CONTACT.tiktok, "tt")}
              >
                {copied === "tt" ? "Copié" : "Copier"}
              </button>
            </div>
          </div>
        </div>

        <footer className="cc-foot">
          <button className="cc-cta" onClick={openWhatsApp}>
            <i className="fab fa-whatsapp" /> Discuter maintenant
          </button>
          <p className="cc-help">
            Astuce : les réponses sont plus rapides sur WhatsApp 💚
          </p>
        </footer>
      </div>
    </div>
  );
}
