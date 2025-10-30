import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Form, Button, InputGroup } from "react-bootstrap";
import { register } from "../actions/userActions";
import Message from "../components/Message";
import "./login-register.css";

export default function RegisterPage({ history }) {
  const [username, setUsername]       = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [confirm, setConfirm]         = useState("");
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage]         = useState("");

  const dispatch = useDispatch();
  const { loading, error, success } = useSelector(
    (s) => s.userRegisterReducer || {}
  );

  useEffect(() => {
    if (success) history.push("/login");
  }, [success, history]);

  const submit = (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setMessage("Passwords do not match!");
      return;
    }
    setMessage("");
    dispatch(register(username, email, password));
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* LEFT: brand/visual — identical style to Login */}
        <div className="auth-side">
          <div className="auth-brand">
            <img src="/brand/logop.png" alt="Beauty Shop" />
          </div>
          <h2 className="auth-headline">Créez votre compte ✨</h2>
          <p className="auth-blurb">
            Rejoignez la communauté, suivez vos commandes et
            enregistrez vos coups de cœur.
          </p>
          <ul className="auth-bullets">
            <li>Wishlist synchronisée</li>
            <li>Historique de commandes</li>
            <li>Offres et nouveautés en avant-première</li>
          </ul>
        </div>

        {/* RIGHT: form — same spacing/typography as Login */}
        <div className="auth-form">
          <h1 className="auth-title">Créer un compte</h1>
          <p className="auth-sub">Quelques infos et c’est parti.</p>

          {message && <Message variant="danger">{message}</Message>}
          {error && <Message variant="danger">{error}</Message>}

          <Form onSubmit={submit} className="auth-form-inner">
            {/* Username */}
            <Form.Group controlId="username" className="mb-3">
              <Form.Label>Nom d’utilisateur</Form.Label>
              <Form.Control
                size="lg"
                type="text"
                placeholder="Votre nom d’utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </Form.Group>

            {/* Email */}
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Adresse e-mail</Form.Label>
              <Form.Control
                size="lg"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            {/* Password */}
            <Form.Group controlId="password" className="mb-3">
              <Form.Label>Mot de passe</Form.Label>
              <InputGroup size="lg">
                <Form.Control
                  type={showPwd ? "text" : "password"}
                  placeholder="Créez un mot de passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPwd((v) => !v)}
                  className="auth-eye"
                  aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  <i className={`fas fa-eye${showPwd ? "-slash" : ""}`} />
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Confirm Password */}
            <Form.Group controlId="passwordConfirm" className="mb-3">
              <Form.Label>Confirmez le mot de passe</Form.Label>
              <InputGroup size="lg">
                <Form.Control
                  type={showConfirm ? "text" : "password"}
                  placeholder="Ressaisissez le mot de passe"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="auth-eye"
                  aria-label={showConfirm ? "Masquer" : "Afficher"}
                >
                  <i className={`fas fa-eye${showConfirm ? "-slash" : ""}`} />
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Terms */}
            <Form.Check
              className="mb-4"
              label={
                <span>
                  J’accepte la{" "}
                  <Link className="auth-link" to="/privacy">Politique de confidentialité</Link>{" "}
                  et les{" "}
                  <Link className="auth-link" to="/cgv">Conditions générales</Link>.
                </span>
              }
              required
            />

            {/* Submit */}
            <Button type="submit" variant="dark" className="auth-btn-primary" disabled={loading}>
              {loading ? "Création…" : "Créer le compte"}
            </Button>

            <div className="auth-switch">
              Déjà inscrit ? <Link to="/login">Se connecter</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
