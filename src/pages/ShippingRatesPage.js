// src/pages/ShippingRatesPage.js
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import "./shipping-rates.css";

/* ✅ Use the payments app routes */
const API_BASE   = "/payments";
const LIST_URL   = `${API_BASE}/shipping-rates/`;            // GET (public), POST (admin)
const ADMIN_URL  = `${API_BASE}/admin/shipping-rates/`;      // PUT/DELETE (admin)

/* fallback shown if API is down */
const FALLBACK_RATES = [
  { id: 1, city: "Agadir", price: 35 },
  { id: 2, city: "AFRA-nador", price: 45 },
  { id: 3, city: "Afourar - Beni-Mellal", price: 45 },
  { id: 4, city: "aazayeb-chefchaouen", price: 45 },
  { id: 5, city: "Nowasser-chichaoua", price: 45 },
  { id: 6, city: "MEHDIA", price: 45 },
  { id: 7, city: "Lalla Fatna", price: 45 },
  { id: 8, city: "Kasbah El Taher", price: 45 },
  { id: 9, city: "jamaat fdala", price: 40 },
  { id: 10, city: "ighram laalam-beni mellal", price: 45 },
];

export default function ShippingRatesPage() {
  const { userInfo } = useSelector((s) => s.userLoginReducer || {});
  const isAdmin = !!(userInfo && userInfo.admin);
  const authCfg = isAdmin && userInfo?.token
    ? { headers: { Authorization: `Bearer ${userInfo.token}` } }
    : undefined;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState(null);

  const [pageSize, setPageSize] = useState(10);
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [newCity, setNewCity] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [apiReady, setApiReady] = useState(true);

  // Load list
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await axios.get(LIST_URL);
        if (!alive) return;
        const normalized = (Array.isArray(data) ? data : []).map((r, i) => ({
          id: r.id ?? i + 1,
          city: r.city || r.ville || "",
          price: Number(r.price ?? r.tarif ?? 0),
        }));
        setRows(normalized);
        setApiReady(true);
      } catch {
        // backend not reachable -> show fallback but keep page usable
        setApiReady(false);
        setRows(FALLBACK_RATES);
        setError(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const arr = needle
      ? rows.filter((r) => (r.city || "").toLowerCase().includes(needle))
      : rows.slice();
    arr.sort((a, b) => (a.city || "").localeCompare(b.city || "", "fr"));
    return arr;
  }, [rows, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);
  const goto = (p) => setPage(Math.min(Math.max(1, p), totalPages));

  // Create
  const addRate = async () => {
    const city = newCity.trim();
    const price = Number(newPrice);
    if (!city || Number.isNaN(price)) return;

    try {
      if (apiReady) {
        if (!isAdmin) throw new Error("Vous devez être admin pour ajouter un tarif.");
        setSavingId("new");
        const { data } = await axios.post(LIST_URL, { city, price, active: true }, authCfg);
        const created = { id: data.id, city: data.city || city, price: Number(data.price ?? price) };
        setRows((prev) => [...prev, created]);
      } else {
        // local-only (no backend)
        setRows((prev) => [...prev, { id: Date.now(), city, price }]);
      }
      setNewCity("");
      setNewPrice("");
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || "Erreur lors de l’ajout");
    } finally {
      setSavingId(null);
    }
  };

  // Update
  const updateRate = async (id, patch) => {
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return;

    const next = { ...rows[idx], ...patch };
    if (!next.city || Number.isNaN(Number(next.price))) return;

    try {
      if (apiReady) {
        if (!isAdmin) throw new Error("Vous devez être admin pour modifier.");
        setSavingId(id);
        await axios.put(`${ADMIN_URL}${id}/`, { city: next.city, price: Number(next.price) }, authCfg);
      }
      setRows((prev) => {
        const clone = prev.slice();
        clone[idx] = next;
        return clone;
      });
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || "Erreur lors de la mise à jour");
    } finally {
      setSavingId(null);
    }
  };

  // Delete
  const deleteRate = async (id) => {
    const idx = rows.findIndex((r) => r.id === id);
    if (idx === -1) return;
    if (!window.confirm("Supprimer ce tarif ?")) return;

    try {
      if (apiReady) {
        if (!isAdmin) throw new Error("Vous devez être admin pour supprimer.");
        setSavingId(id);
        await axios.delete(`${ADMIN_URL}${id}/`, authCfg);
      }
      setRows((prev) => prev.filter((r) => r.id !== id));
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || "Erreur lors de la suppression");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="sr-wrap">
      <h1 className="sr-title">Tarifs de Livraison</h1>

      <div className="sr-toolbar">
        <label className="sr-rows">
          Afficher{" "}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
          >
            {[10, 25, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>{" "}
          entrées
        </label>

        <label className="sr-search">
          Rechercher :{" "}
          <input
            type="search"
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Ville…"
          />
        </label>
      </div>

      <div className="sr-card">
        {loading ? (
          <div className="sr-empty">Chargement…</div>
        ) : error && apiReady ? (
          <div className="sr-error">Erreur : {error}</div>
        ) : (
          <div className="sr-table-wrap">
            <table className="sr-table">
              <thead>
                <tr>
                  <th className="sr-th-city">Ville</th>
                  <th>Tarif Livraison (DH)</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="sr-empty">Aucune entrée.</td>
                  </tr>
                ) : (
                  pageRows.map((r) => (
                    <tr key={r.id}>
                      <td>{r.city}</td>
                      <td className="fw-bold">{Number(r.price).toFixed(0)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && (!error || !apiReady) && (
        <div className="sr-footer">
          <div className="sr-count">
            Affichage de {pageRows.length ? start + 1 : 0} à {Math.min(start + pageSize, filtered.length)} sur {filtered.length} entrées
          </div>
          <div className="sr-pager">
            <button onClick={() => goto(currentPage - 1)} disabled={currentPage === 1}>Précédente</button>
            {Array.from({ length: Math.min(totalPages, 7) }).map((_, i) => {
              const p = i + 1;
              return (
                <button key={p} onClick={() => goto(p)} className={p === currentPage ? "is-active" : ""}>
                  {p}
                </button>
              );
            })}
            {totalPages > 7 && <span className="sr-dots">…</span>}
            {totalPages > 7 && (
              <button onClick={() => goto(totalPages)} className={currentPage === totalPages ? "is-active" : ""}>
                {totalPages}
              </button>
            )}
            <button onClick={() => goto(currentPage + 1)} disabled={currentPage === totalPages}>Suivante</button>
          </div>
        </div>
      )}

      {isAdmin && (
        <div className="sr-admin">
          <h2 className="sr-admin-title">Administration des tarifs</h2>

          {!apiReady && (
            <div className="sr-warning">
              L’API n’est pas joignable — édition locale seulement (non sauvegardée).
            </div>
          )}

          <div className="sr-admin-add">
            <input className="sr-input" placeholder="Ville" value={newCity} onChange={(e) => setNewCity(e.target.value)} />
            <input className="sr-input" placeholder="Tarif (DH)" inputMode="numeric" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
            <button className="sr-btn sr-btn-primary" onClick={addRate} disabled={savingId === "new"}>
              {savingId === "new" ? "…" : "Ajouter"}
            </button>
          </div>

          <div className="sr-card sr-admin-table">
            <div className="sr-table-wrap">
              <table className="sr-table">
                <thead>
                  <tr>
                    <th className="sr-th-city">Ville</th>
                    <th style={{ width: 180 }}>Tarif (DH)</th>
                    <th style={{ width: 220 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <AdminRow
                      key={r.id}
                      row={r}
                      onSave={(patch) => updateRate(r.id, patch)}
                      onDelete={() => deleteRate(r.id)}
                      saving={savingId === r.id}
                    />
                  ))}
                  {rows.length === 0 && (
                    <tr><td colSpan={3} className="sr-empty">Aucun tarif.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AdminRow({ row, onSave, onDelete, saving }) {
  const [edit, setEdit] = useState(false);
  const [city, setCity] = useState(row.city);
  const [price, setPrice] = useState(row.price);

  useEffect(() => { setCity(row.city); setPrice(row.price); }, [row.id, row.city, row.price]);

  const commit = () => { onSave({ city: city.trim(), price: Number(price) }); setEdit(false); };
  const cancel = () => { setCity(row.city); setPrice(row.price); setEdit(false); };

  return (
    <tr>
      <td>
        {edit ? (
          <input className="sr-input" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Ville" />
        ) : row.city}
      </td>
      <td style={{ width: 180 }}>
        {edit ? (
          <input className="sr-input" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="numeric" placeholder="Tarif" />
        ) : Number(row.price).toFixed(0)}
      </td>
      <td style={{ width: 220 }}>
        {edit ? (
          <>
            <button className="sr-btn sr-btn-primary" onClick={commit} disabled={saving}>{saving ? "…" : "Enregistrer"}</button>
            <button className="sr-btn" onClick={cancel} disabled={saving}>Annuler</button>
          </>
        ) : (
          <>
            <button className="sr-btn" onClick={() => setEdit(true)}>Modifier</button>
            <button className="sr-btn sr-btn-danger" onClick={onDelete} disabled={saving}>Supprimer</button>
          </>
        )}
      </td>
    </tr>
  );
}
