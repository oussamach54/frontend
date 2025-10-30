// src/pages/MyOrdersPage.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import { Table, Badge, Alert } from "react-bootstrap";

const StatusBadge = ({ status }) => {
  const map = {
    PENDING: "secondary",
    CONFIRMED: "info",
    PAID: "primary",
    SHIPPED: "warning",
    DELIVERED: "success",
    CANCELLED: "dark",
  };
  return <Badge variant={map[status] || "secondary"}>{status}</Badge>;
};

export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/account/orders/");
        setOrders(data || []);
      } catch (e) {
        setErr(e?.response?.data?.detail || "Impossible de charger vos commandes.");
      }
    })();
  }, []);

  return (
    <div className="container py-4">
      <h1 className="mb-4">Mes commandes</h1>
      {err && <Alert variant="danger">{err}</Alert>}

      <Table striped hover responsive>
        <thead>
          <tr>
            <th>#</th>
            <th>Client</th>
            <th>Total</th>
            <th>Statut</th>
            <th>Payé</th>
            <th>Livré</th>
            <th>Créée</th>
          </tr>
        </thead>
        <tbody>
          {(orders || []).map((o) => (
            <tr key={o.id}>
              <td>{o.id}</td>
              <td>{o.customer_name || o.name}</td>
              <td>{Number(o.total_price || 0).toFixed(2)} MAD</td>
              <td><StatusBadge status={o.status} /></td>
              <td>{o.paid_status ? "Oui" : "Non"}</td>
              <td>{o.is_delivered ? "Oui" : "Non"}</td>
              <td>{new Date(o.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
