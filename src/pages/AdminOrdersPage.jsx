// src/pages/AdminOrdersPage.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import { Table, Alert, Form } from "react-bootstrap";

const STATUSES = ["PENDING", "CONFIRMED", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");

  const load = async () => {
    try {
      const { data } = await api.get("/account/orders/");
      setOrders(data || []);
    } catch (e) {
      setErr(e?.response?.data?.detail || "Erreur de chargement.");
    }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/account/orders/${id}/status/`, { status });
      await load();
    } catch (e) {
      alert(e?.response?.data?.detail || "Erreur de mise à jour du statut.");
    }
  };

  return (
    <div className="container py-4">
      <h1 className="mb-4">Commandes (Admin)</h1>
      {err && <Alert variant="danger">{err}</Alert>}

      <Table striped hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Client</th>
            <th>Téléphone</th>
            <th>Adresse</th>
            <th>Total</th>
            <th>Statut</th>
            <th>Créée</th>
          </tr>
        </thead>
        <tbody>
          {(orders || []).map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customer_name || o.name}</td>
              <td>{o.phone}</td>
              <td>{o.address} {o.city ? `(${o.city})` : ""}</td>
              <td>{Number(o.total_price || 0).toFixed(2)} MAD</td>
              <td style={{ minWidth: 180 }}>
                <Form.Control
                  as="select"
                  value={o.status}
                  onChange={(e) => updateStatus(o.id, e.target.value)}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Form.Control>
              </td>
              <td>{new Date(o.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
