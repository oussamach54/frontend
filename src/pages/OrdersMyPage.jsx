// src/pages/OrdersMyPage.js
import React, { useEffect, useState } from "react";
import { Container, Table, Spinner, Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import api from "../api";

// ✅ util pour afficher la date Maroc
const formatOrderDate = (iso) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      timeZone: "Africa/Casablanca",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (e) {
    return new Date(iso).toLocaleString();
  }
};

export default function OrdersMyPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/orders/my/");   // ✅ correct endpoint
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
              {items.map((o) => {
                const iso = o.created_at_local || o.created_at;
                return (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{formatOrderDate(iso)}</td>
                    <td>{o.city}</td>
                    <td>{Number(o.grand_total).toFixed(2)} MAD</td>
                    <td>{o.status}</td>
                    <td>
                      <Link to={`/order/${o.id}/`}>Voir</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        ) : (
          <div className="text-muted">Aucune commande.</div>
        )
      )}
    </Container>
  );
}
