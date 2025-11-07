import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";
import api from "../api";                // ✅ utilise le client qui a déjà /api
import "./login-register.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk(false);
    try {
      setLoading(true);

      // endpoint principal (fonctionne en local & prod via api baseURL)
      await api.post("/account/password-reset/", { email }, {
        headers: { "Content-Type": "application/json" },
      });

      setOk(true);
    } catch (e) {
      // message clair si backend renvoie 405/404
      const msg =
        e?.response?.data?.detail ||
        e?.response?.data?.message ||
        (e?.response?.status === 405 ? "Méthode non autorisée (405)." : null) ||
        "Une erreur est survenue.";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-side">
          <div className="auth-brand">
            <img src="/brand/logop.png" alt="MiniGlow" />
          </div>
          <h2 className="auth-headline">Mot de passe oublié</h2>
          <p className="auth-blurb">
            Entrez votre email. Nous vous enverrons un lien sécurisé pour
            réinitialiser votre mot de passe.
          </p>
          <ul className="auth-bullets">
            <li>Processus sécurisé</li>
            <li>Valable quelques heures</li>
            <li>Ne partagez pas ce lien</li>
          </ul>
        </div>

        <div className="auth-form">
          <h1 className="auth-title">Mot de passe oublié</h1>
          <p className="auth-sub">Entrez votre email pour recevoir le lien.</p>

          {ok && (
            <Alert variant="success">
              Si un compte existe pour cet email, un lien de réinitialisation a
              été envoyé.
            </Alert>
          )}
          {err && <Alert variant="danger">{err}</Alert>}

          <Form onSubmit={submit} className="auth-form-inner">
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" variant="dark" className="auth-btn-primary" disabled={loading}>
              {loading ? "Envoi…" : "Envoyer le lien"}
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
