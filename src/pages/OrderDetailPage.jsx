<<<<<<< HEAD
// src/pages/OrderDetailPage.js
import React, { useEffect, useState } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import api from "../api";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/orders/${id}/`); // /api/orders/<id>/
        if (!alive) return;
        setOrder(data);
      } catch (e) {
        if (!alive) return;
        setErr(
          e?.response?.status === 404
            ? "Commande introuvable."
            : e?.response?.data?.detail || e.message
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <div className="p-4"><Spinner animation="border" /></div>;
  if (err) return (
    <Container className="py-4">
      <Alert variant="danger">{err}</Alert>
    </Container>
  );
  if (!order) return null;

  const subtotal = Number(order.items_total || 0);
  const shipping = Number(order.shipping_price || 0);
  const total = Number(order.grand_total || subtotal + shipping);

  return (
    <Container className="py-4">
      <h2>Commande #{order.id}</h2>
      <div className="text-muted mb-3">
        Statut: <b>{order.status}</b>
      </div>

      <div className="mb-3">
        <div><b>Client:</b> {order.full_name}</div>
        {order.phone && <div><b>Téléphone:</b> {order.phone}</div>}
        {order.city && <div><b>Ville:</b> {order.city}</div>}
        {order.address && <div><b>Adresse:</b> {order.address}</div>}
      </div>

      <h4>Articles</h4>
      <ul className="list-unstyled">
        {(order.items || []).map((it) => (
          <li key={it.id} className="py-2 border-top">
            {it.name}
            {it.variant_label ? ` — ${it.variant_label}` : ""} × {it.quantity} —{" "}
            {Number(it.line_total).toFixed(2)} MAD
          </li>
        ))}
      </ul>

      <h4 className="mt-4">Total</h4>
      <div>Sous-total: {subtotal.toFixed(2)} MAD</div>
      <div>Livraison: {shipping.toFixed(2)} MAD</div>
      <div>
        <b>Total: {total.toFixed(2)} MAD</b>
      </div>
    </Container>
  );
}
=======
// src/pages/OrderDetailPage.js
import React, { useEffect, useState } from "react";
import { Container, Spinner, Alert } from "react-bootstrap";
import { useParams } from "react-router-dom";
import api from "../api";

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/orders/${id}/`); // /api/orders/<id>/
        if (!alive) return;
        setOrder(data);
      } catch (e) {
        if (!alive) return;
        setErr(
          e?.response?.status === 404
            ? "Commande introuvable."
            : e?.response?.data?.detail || e.message
        );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) return <div className="p-4"><Spinner animation="border" /></div>;
  if (err) return (
    <Container className="py-4">
      <Alert variant="danger">{err}</Alert>
    </Container>
  );
  if (!order) return null;

  const subtotal = Number(order.items_total || 0);
  const shipping = Number(order.shipping_price || 0);
  const total = Number(order.grand_total || subtotal + shipping);

  return (
    <Container className="py-4">
      <h2>Commande #{order.id}</h2>
      <div className="text-muted mb-3">
        Statut: <b>{order.status}</b>
      </div>

      <div className="mb-3">
        <div><b>Client:</b> {order.full_name}</div>
        {order.phone && <div><b>Téléphone:</b> {order.phone}</div>}
        {order.city && <div><b>Ville:</b> {order.city}</div>}
        {order.address && <div><b>Adresse:</b> {order.address}</div>}
      </div>

      <h4>Articles</h4>
      <ul className="list-unstyled">
        {(order.items || []).map((it) => (
          <li key={it.id} className="py-2 border-top">
            {it.name}
            {it.variant_label ? ` — ${it.variant_label}` : ""} × {it.quantity} —{" "}
            {Number(it.line_total).toFixed(2)} MAD
          </li>
        ))}
      </ul>

      <h4 className="mt-4">Total</h4>
      <div>Sous-total: {subtotal.toFixed(2)} MAD</div>
      <div>Livraison: {shipping.toFixed(2)} MAD</div>
      <div>
        <b>Total: {total.toFixed(2)} MAD</b>
      </div>
    </Container>
  );
}
>>>>>>> feat/frontend-sync-
