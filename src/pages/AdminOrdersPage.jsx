// src/pages/AdminOrdersPage.js
import React, { useEffect, useState } from "react";
import { Container, Table, Spinner, Alert, Form } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import api from "../api";
import { useSelector } from "react-redux";

export default function AdminOrdersPage() {
  const { userInfo } = useSelector((s) => s.userLoginReducer || {});
  const history = useHistory();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!userInfo?.admin) {
      history.push("/login");
      return;
    }
  }, [userInfo, history]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const params = {};
        if (status) params.status = status;
        const { data } = await api.get("/orders/admin/", { params }); // ✅
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
  }, [status]);

  return (
    <Container className="py-4">
      <h3>Commandes — Admin</h3>
      <div className="mb-2">
        <Form inline="true">
          <Form.Label className="mr-2">Filtrer par statut</Form.Label>
          <Form.Control
            as="select"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            style={{ maxWidth: 220 }}
          >
            <option value="">Tous</option>
            <option value="pending">En attente</option>
            <option value="paid">Payée</option>
            <option value="shipped">Expédiée</option>
            <option value="delivered">Livrée</option>
            <option value="canceled">Annulée</option>
          </Form.Control>
        </Form>
      </div>

      {loading && <Spinner animation="border" />}
      {err && <Alert variant="danger">{err}</Alert>}

      {!loading && !err && (
        items.length ? (
          <Table size="sm" responsive hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Client</th>
                <th>Ville</th>
                <th>Téléphone</th>
                <th>Total</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{new Date(o.created_at).toLocaleString()}</td>
                  <td>{o.full_name}</td>
                  <td>{o.city}</td>
                  <td>{o.phone}</td>
                  <td>{Number(o.grand_total).toFixed(2)} MAD</td> {/* ✅ */}
                  <td>{o.status}</td>
                  <td>
                    <Link to={`/admin/orders/${o.id}/`}>Détail</Link>
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
