// src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { Form, Button, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./login-register.css"; // reuse your auth styles

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk(false);
    if (!email.trim()) {
      setErr("Veuillez saisir votre adresse email.");
      return;
    }
    try {
      setLoading(true);
      await axios.post("/account/password-reset/", { email });
      setOk(true);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* LEFT side visuals (like your login) */}
        <div className="auth-side">
          <div className="auth-brand">
            <img src="/brand/logop.png" alt="MiniGlow" />
          </div>
          <h2 className="auth-headline">Mot de passe oublié</h2>
          <p className="auth-blurb">
            Entrez votre email, nous vous enverrons un lien sécurisé pour le réinitialiser.
          </p>
          <ul className="auth-bullets">
            <li>Processus sécurisé</li>
            <li>Valable quelques heures</li>
            <li>Ne partagez pas ce lien</li>
          </ul>
        </div>

        {/* RIGHT: form */}
        <div className="auth-form">
          <h1 className="auth-title">Mot de passe oublié</h1>
          <p className="auth-sub">Entrez votre email pour recevoir le lien.</p>

          {ok && <Alert variant="success">Si un compte existe, un email a été envoyé.</Alert>}
          {err && <Alert variant="danger">{err}</Alert>}

          <Form onSubmit={submit} className="auth-form-inner">
            <Form.Group controlId="email" className="mb-4">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="ex. vous@domaine.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" variant="dark" className="auth-btn-primary" disabled={loading}>
              {loading ? "Envoi..." : "Envoyer le lien"}
            </Button>

            <div className="auth-switch mt-3">
              Revenir à la connexion ? <Link to="/login">Se connecter</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
