// src/pages/AdminOrdersPage.js
import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  Spinner,
  Alert,
  Form,
  Button,
} from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import api from "../api";
import { useSelector } from "react-redux";

// ✅ Utilitaire pour afficher la date en heure du Maroc
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

function AdminOrderRow({ order, onSaved }) {
  const [status, setStatus] = useState(order.status || "pending");
  const [saving, setSaving] = useState(false);

  const saveStatus = async () => {
    try {
      setSaving(true);
      await api.patch(`/orders/${order.id}/status/`, { status });
      if (onSaved) onSaved();
    } catch (e) {
      alert(
        e?.response?.data?.detail ||
          e.message ||
          "Impossible de mettre à jour le statut."
      );
    } finally {
      setSaving(false);
    }
  };

  const isoDate = order.created_at_local || order.created_at;

  return (
    <tr>
      <td>#{order.id}</td>
      {/* ✅ Utilisation de created_at_local si dispo */}
      <td>{formatOrderDate(isoDate)}</td>
      <td>{order.full_name}</td>
      <td>{order.city}</td>
      <td>{order.phone}</td>
      <td>{Number(order.grand_total).toFixed(2)} MAD</td>
      <td>
        <Form.Control
          as="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          size="sm"
        >
          <option value="pending">En attente</option>
          <option value="paid">Payée</option>
          <option value="shipped">Expédiée</option>
          <option value="delivered">Livrée</option>
          <option value="canceled">Annulée</option>
        </Form.Control>
      </td>
      <td style={{ whiteSpace: "nowrap" }}>
        <Button
          size="sm"
          variant="primary"
          className="mr-2"
          onClick={saveStatus}
          disabled={saving}
        >
          {saving ? "..." : "Sauver"}
        </Button>
        <Link to={`/admin/orders/${order.id}/`}>Détail</Link>
      </td>
    </tr>
  );
}

export default function AdminOrdersPage() {
  const { userInfo } = useSelector((s) => s.userLoginReducer || {});
  const history = useHistory();
  const [items, setItems] = useState([]);
  const [filterStatus, setFilterStatus] = useState("");
  const [refresh, setRefresh] = useState(0);
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
        setErr("");
        const params = {};
        if (filterStatus) params.status = filterStatus;
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
  }, [filterStatus, refresh]);

  const reload = () => setRefresh((x) => x + 1);

  return (
    <Container className="py-4">
      <h3>Commandes — Admin</h3>
      <div className="mb-2">
        <Form inline="true">
          <Form.Label className="mr-2">Filtrer par statut</Form.Label>
          <Form.Control
            as="select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
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
      {err && (
        <Alert variant="danger" className="mt-2">
          {err}
        </Alert>
      )}

      {!loading && !err && (
        items.length ? (
          <Table size="sm" responsive hover className="mt-3">
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Client</th>
                <th>Ville</th>
                <th>Téléphone</th>
                <th>Total</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((o) => (
                <AdminOrderRow key={o.id} order={o} onSaved={reload} />
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
