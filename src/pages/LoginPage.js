import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import Message from "../components/Message";
import { login, googleLogin } from "../actions/userActions";
import { useGoogleLogin } from "@react-oauth/google";
import "./login-register.css";

export default function LoginPage({ history }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const { error, userInfo } = useSelector((s) => s.userLoginReducer || {});
  const { search } = useLocation();
  const redirect = new URLSearchParams(search).get("redirect") || "/";

  useEffect(() => {
    if (userInfo) history.push(redirect);
  }, [userInfo, history, redirect]);

  const submitHandler = (e) => {
    e.preventDefault();
    dispatch(login(email, password)); // <-- email first
  };

  const startGoogle = useGoogleLogin({
    flow: "implicit",
    scope: "openid email profile",
    onSuccess: async (resp) => {
      if (resp?.access_token) dispatch(googleLogin(resp.access_token));
    },
  });

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-side">
          <div className="auth-brand">
            <img src="/brand/logov.png" alt="Beauty Shop" />
          </div>
          <h2 className="auth-headline">Ravivez votre éclat ✨</h2>
          <p className="auth-blurb">Des routines simples et efficaces. Connectez-vous pour poursuivre vos coups de cœur.</p>
          <ul className="auth-bullets">
            <li>Suivi de commandes</li>
            <li>Wishlist synchronisée</li>
            <li>Offres personnalisées</li>
          </ul>
        </div>

        <div className="auth-form">
          <h1 className="auth-title">Connexion</h1>
          <p className="auth-sub">Ravi de vous revoir 👋</p>

          {error && <Message variant="danger">{error}</Message>}

          <Form onSubmit={submitHandler} className="auth-form-inner">
            <Form.Group controlId="email" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Entrez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </Form.Group>

            <Form.Group controlId="password" className="mb-2">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                placeholder="Entrez votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-4">
              <Link to="/forgot-password">Mot de passe oublié ?</Link>
              {/* <Button variant="light" onClick={() => startGoogle()}>Se connecter avec Google</Button> */}
            </div>

            <Button type="submit" variant="dark" className="auth-btn-primary">
              Se connecter
            </Button>
          </Form>

          <div className="auth-switch">
            Pas de compte ? <Link to="/register">Créer un compte</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
