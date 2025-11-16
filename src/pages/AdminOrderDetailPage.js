// src/pages/AdminOrderDetailPage.js
import React, { useEffect, useState } from "react";
import { Container, Spinner, Alert, Form, Button } from "react-bootstrap";
import { useParams, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../api";

export default function AdminOrderDetailPage() {
  const { userInfo } = useSelector((s) => s.userLoginReducer || {});
  const history = useHistory();
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!userInfo?.admin) {
      history.push("/login");
      return;
    }
  }, [userInfo, history]);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/orders/admin/${id}/`); // admin detail
      setOrder(data);
      setStatus(data.status || "pending");
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line
  }, [id]);

  const update = async () => {
    try {
      setSaving(true);
      await api.patch(`/orders/${id}/status/`, { status }); // update status
      await load();
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message);
    } finally {
      setSaving(false);
    }
  };

  const removeIt = async () => {
    if (!window.confirm("Supprimer définitivement cette commande ?")) return;
    try {
      setDeleting(true);
      await api.delete(`/orders/admin/${id}/`); // ✅ DELETE endpoint
      history.push("/admin/orders/");
    } catch (e) {
      setErr(e?.response?.data?.detail || e.message);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div className="p-4"><Spinner animation="border" /></div>;
  if (err)
    return (
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
      <h3>Commande #{order.id}</h3>
      <div className="text-muted mb-3">
        Créée le {new Date(order.created_at).toLocaleString()}
      </div>

      <div className="mb-3">
        <b>Client :</b> {order.full_name} — {order.phone}
        {order.email && (
          <>
            <br />
            <b>Email :</b> {order.email}
          </>
        )}
        <br />
        <b>Adresse :</b> {order.address}, {order.city}
      </div>

      <h5>Articles</h5>
      <ul className="list-unstyled">
        {(order.items || []).map((it) => (
          <li key={it.id} className="py-2 border-top">
            {it.name}
            {it.variant_label ? ` — ${it.variant_label}` : ""} × {it.quantity} —{" "}
            {Number(it.line_total).toFixed(2)} MAD
          </li>
        ))}
      </ul>

      <div className="pt-3 border-top mt-3 mb-4">
        <div>Sous-total : {subtotal.toFixed(2)} MAD</div>
        <div>Livraison : {shipping.toFixed(2)} MAD</div>
        <div>
          <b>Total : {total.toFixed(2)} MAD</b>
        </div>
      </div>

      <Form inline className="mb-3">
        <Form.Label className="mr-2">
          <b>Statut</b>
        </Form.Label>
        <Form.Control
          as="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={{ maxWidth: 240 }}
        >
          <option value="pending">En attente</option>
          <option value="paid">Payée</option>
          <option value="shipped">Expédiée</option>
          <option value="delivered">Livrée</option>
          <option value="canceled">Annulée</option>
        </Form.Control>
        <Button className="ml-2" onClick={update} disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button
          variant="outline-danger"
          className="ml-2"
          onClick={removeIt}
          disabled={deleting}
        >
          {deleting ? "Suppression…" : "Supprimer"}
        </Button>
      </Form>
    </Container>
  );
}
