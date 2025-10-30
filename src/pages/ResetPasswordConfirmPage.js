// src/pages/ResetPasswordPage.jsx
import React, { useState } from "react";
import axios from "axios";
import { useParams, Link, useHistory } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";
import "./login-register.css";

export default function ResetPasswordPage() {
  const { uid, token } = useParams();
  const history = useHistory();
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!p1 || p1 !== p2) {
      setErr("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      setLoading(true);
      await axios.post("/account/password-reset/confirm/", {
        uid, token, password: p1,
      });
      setOk(true);
      setTimeout(() => history.push("/login"), 1500);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Lien invalide ou expiré.");
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
          <h2 className="auth-headline">Réinitialiser le mot de passe</h2>
          <p className="auth-blurb">
            Choisissez un nouveau mot de passe robuste pour sécuriser votre compte.
          </p>
          <ul className="auth-bullets">
            <li>8+ caractères</li>
            <li>Lettres et chiffres</li>
            <li>Évitez les mots évidents</li>
          </ul>
        </div>

        <div className="auth-form">
          <h1 className="auth-title">Nouveau mot de passe</h1>
          <p className="auth-sub">Saisissez et confirmez votre nouveau mot de passe.</p>

          {ok && <Alert variant="success">Mot de passe changé. Redirection vers la connexion…</Alert>}
          {err && <Alert variant="danger">{err}</Alert>}

          <Form onSubmit={submit} className="auth-form-inner">
            <Form.Group controlId="pw1" className="mb-3">
              <Form.Label>Nouveau mot de passe</Form.Label>
              <Form.Control
                type="password"
                value={p1}
                onChange={(e) => setP1(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="pw2" className="mb-4">
              <Form.Label>Confirmer le mot de passe</Form.Label>
              <Form.Control
                type="password"
                value={p2}
                onChange={(e) => setP2(e.target.value)}
                required
              />
            </Form.Group>

            <Button type="submit" variant="dark" className="auth-btn-primary" disabled={loading}>
              {loading ? "Validation…" : "Valider"}
            </Button>

            <div className="auth-switch mt-3">
              <Link to="/login">Retour à la connexion</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
