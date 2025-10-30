// src/pages/CheckoutCODPage.jsx
import React, { useMemo, useState } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import api from "../api";
import { getCart, cartTotal, clearCart } from "../utils/cart";

export default function CheckoutCODPage() {
  const history = useHistory();
  const [items] = useState(getCart());
  const total = useMemo(() => Number(cartTotal(items).toFixed(2)), [items]);

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!items.length) {
      setErr("Votre panier est vide.");
      return;
    }
    if (!phone.trim() || !address.trim()) {
      setErr("Téléphone et Adresse sont requis.");
      return;
    }
    try {
      setLoading(true);
      const payload = {
        items: items.map(({ id, name, price, qty, image }) => ({ id, name, price, qty, image })),
        total_price: total,
        customer_name: customerName,
        phone,
        address,
        city,
        notes,
      };
      const { data } = await api.post("/account/orders/cod/", payload);
      setOk(true);

      // Optionnel: vider le panier local si on part sur WhatsApp
      clearCart();

      // Redirection WhatsApp (lien renvoyé par l’API)
      if (data?.whatsapp_url) {
        window.location.href = data.whatsapp_url;
      } else {
        // fallback: aller à la page des commandes
        history.push("/mes-commandes");
      }
    } catch (e) {
      const msg = e?.response?.data?.detail || e?.response?.data || "Une erreur est survenue.";
      setErr(typeof msg === "string" ? msg : "Erreur inconnue.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Commander (Paiement à la livraison)</h1>

      {err && <Alert variant="danger">{err}</Alert>}
      {ok && <Alert variant="success">Commande enregistrée. Redirection vers WhatsApp…</Alert>}

      <div className="row">
        {/* Récap Panier */}
        <div className="col-lg-5 mb-4">
          <Card>
            <Card.Header><strong>Votre panier</strong></Card.Header>
            <Card.Body>
              {!items.length && <p>Panier vide.</p>}
              {!!items.length && (
                <ul className="list-unstyled">
                  {items.map((it, idx) => (
                    <li key={idx} className="d-flex justify-content-between align-items-center mb-2">
                      <div>
                        <div className="small text-muted">#{it.id}</div>
                        <div>{it.name}</div>
                        <div className="small">Qté: {it.qty}</div>
                      </div>
                      <div>{Number(it.price).toFixed(2)} MAD</div>
                    </li>
                  ))}
                </ul>
              )}
              <hr />
              <div className="d-flex justify-content-between">
                <strong>Total</strong>
                <strong>{total.toFixed(2)} MAD</strong>
              </div>
            </Card.Body>
          </Card>
        </div>

        {/* Formulaire Livraison */}
        <div className="col-lg-7">
          <Card>
            <Card.Header><strong>Informations de livraison</strong></Card.Header>
            <Card.Body>
              <Form onSubmit={submit}>
                <Form.Group controlId="customerName" className="mb-3">
                  <Form.Label>Nom & Prénom</Form.Label>
                  <Form.Control
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="ex. Amar NOUREDDINE"
                  />
                </Form.Group>

                <Form.Group controlId="phone" className="mb-3">
                  <Form.Label>Téléphone *</Form.Label>
                  <Form.Control
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="06XXXXXXXX"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="address" className="mb-3">
                  <Form.Label>Adresse complète *</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="N°, Rue, Quartier…"
                    required
                  />
                </Form.Group>

                <Form.Group controlId="city" className="mb-3">
                  <Form.Label>Ville</Form.Label>
                  <Form.Control
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Casablanca"
                  />
                </Form.Group>

                <Form.Group controlId="notes" className="mb-3">
                  <Form.Label>Notes (optionnel)</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Ex: Livrer après 18h"
                  />
                </Form.Group>

                <Button type="submit" variant="dark" disabled={loading || !items.length}>
                  {loading ? "Envoi…" : "Valider et envoyer sur WhatsApp"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}
