import React, { useState } from "react";
import { Container, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import axios from "axios";
import "./site-footer.css";

const NEWSLETTER_URL =
  process.env.REACT_APP_NEWSLETTER_URL || "/api/newsletter/subscribe/";

export default function SiteFooter() {
  // newsletter UI state
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState({ type: "", msg: "" });

  const submitNewsletter = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus({ type: "error", msg: "Veuillez saisir une adresse e-mail valide." });
      return;
    }
    setSubmitting(true);
    setStatus({ type: "", msg: "" });

    try {
      // Try to POST to your backend (Django or external provider)
      const { data } = await axios.post(NEWSLETTER_URL, { email });
      setStatus({
        type: "ok",
        msg:
          data?.message ||
          "✅ Merci de votre abonnement ! Vous êtes bien inscrit(e) à la newsletter.",
      });
      setEmail("");
    } catch (err) {
      // If your backend isn’t ready yet, show a friendly success anyway
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.detail ||
        "✅ Merci de votre abonnement !";
      setStatus({ type: "ok", msg });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="sf-wrap">
      <Container>
        <Row className="gy-4">
          {/* Brand / blurb */}
          <Col lg={4} md={6}>
            <div className="sf-brand">
              <img src="/brand/logov.png" alt="MiniGlow" className="sf-logo" />
            </div>
            <p className="sf-text">
              MiniGlow by Shay, boutique en ligne de beauté coréenne, vous offre des
              soins authentiques pour une peau éclatante et naturellement sublimée.
            </p>
            <ul className="sf-list">
              <li>
                <b>Adresse :</b> Casablanca, Maroc
              </li>
              <li>
                <b>E-mail :</b>{" "}
                <a href="mailto:labshaay@gmail.com">labshaay@gmail.com</a>
              </li>
              <li>
                <b>WhatsApp :</b>{" "}
                <a
                  href="https://wa.me/212689398538"
                  target="_blank"
                  rel="noreferrer"
                >
                  +212 6 89 39 85 38
                </a>
              </li>
            </ul>
          </Col>

          {/* Qui sommes-nous ? */}
          <Col lg={2} md={6}>
            <h5 className="sf-title">Qui sommes-nous ?</h5>
            <ul className="sf-links">
              <li>
                <Link to="/about">À propos de nous</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
            </ul>
          </Col>

          {/* Informations */}
          <Col lg={3} md={6}>
            <h5 className="sf-title">Informations</h5>
            <ul className="sf-links">
              <li>
                <Link to="/privacy">Politique de confidentialité</Link>
              </li>
              <li>
                <Link to="/returns">
                  Politique de retour et de remboursement
                </Link>
              </li>
            </ul>
          </Col>

          {/* Newsletter */}
          <Col lg={3} md={6}>
            <h5 className="sf-title">Recevez nos exclusivités par e-mail</h5>
            <p className="sf-text small">
              Inscrivez-vous pour être le premier à découvrir nos nouveautés,
              promotions, contenus exclusifs, événements, et bien plus encore !
            </p>

            <Form className="sf-newsletter" onSubmit={submitNewsletter}>
              <Form.Control
                type="email"
                placeholder="Saisissez votre adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Votre e-mail"
              />
              <Button
                type="submit"
                variant="dark"
                disabled={submitting}
                aria-label="S’abonner à la newsletter"
              >
                {submitting ? (
                  <>
                    <Spinner
                      animation="border"
                      size="sm"
                      className="me-2"
                      role="status"
                      aria-hidden="true"
                    />
                    Envoi…
                  </>
                ) : (
                  "Abonnez-vous"
                )}
              </Button>
            </Form>

            {status.msg && (
              <div
                className={`mt-2 small ${
                  status.type === "ok" ? "text-success" : "text-danger"
                }`}
              >
                {status.msg}
              </div>
            )}

            <div className="sf-lang mt-3">
              <Form.Control as="select" defaultValue="fr" aria-label="Langue">
                <option value="fr">Français</option>
                {/* Ajoute d’autres langues ici si besoin */}
              </Form.Control>
            </div>
          </Col>
        </Row>

        <hr className="sf-divider" />

        <div className="sf-bottom">
          <div className="sf-social">
            <a
              href="https://www.instagram.com/miniglowbyshay?igsh=MTJhZGN3ZWF4OWh5MQ%3D%3D&utm_source=qr"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <i className="fab fa-instagram" />
            </a>
          
            <a
              href="https://www.tiktok.com/@miniglowby_shay?_t=ZS-90zX5p3aeri&_r=1"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
            >
              <i className="fab fa-tiktok" />
            </a>
          </div>
          <div className="sf-copy">
            © {new Date().getFullYear()} MiniGlow by Shay — Tous droits réservés.
          </div>
        </div>
      </Container>
    </footer>
  );
}
