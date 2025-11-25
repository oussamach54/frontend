// src/pages/OrdersMyPage.js
import React, { useEffect, useState } from "react";
import { Container, Table, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../api";
import { formatOrderDate } from "../utils/dates"; // 👈 ajout

export default function OrdersMyPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/orders/my/");
        if (!alive) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.detail || e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <Container className="py-4">
      <h3>Mes commandes</h3>
      {loading && <Spinner animation="border" />}
      {err && <Alert variant="danger">{err}</Alert>}
      {!loading && !err && (
        items.length ? (
          <Table size="sm" responsive hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Ville</th>
                <th>Total</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  {/* ✅ même format partout */}
                  <td>{formatOrderDate(o.created_at)}</td>
                  <td>{o.city}</td>
                  <td>{Number(o.grand_total).toFixed(2)} MAD</td>
                  <td>{o.status}</td>
                  <td>
                    <Link to={`/order/${o.id}/`}>Voir</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <div className="text-muted">Aucune commande.</div>
        )
      )}
    </Container>
  );
}
