// src/pages/ProductsListPage.js
import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Spinner, Alert, Form } from "react-bootstrap";
import api from "../api";
import HomeProductCard from "../components/HomeProductCard";
import "../components/HomeProducts.css";

const CATS = [
  { key: "face",              label: "VISAGE" },
  { key: "lips",              label: "LÈVRES" },
  { key: "eyes",              label: "YEUX" },
  { key: "eyebrow",           label: "SOURCILS" },
  { key: "hair",              label: "CHEVEUX" },
  { key: "body",              label: "CORPS" },
  { key: "packs",             label: "PACKS" },
  { key: "acne",              label: "ACNÉ" },
  { key: "hyper_pigmentation",label: "HYPER PIGMENTATION" },
  { key: "brightening",       label: "ÉCLAIRCISSEMENT" },
  { key: "dry_skin",          label: "PEAU SÈCHE" },
  { key: "combination_oily",  label: "PEAU MIXTE/GRASSE" },
  { key: "other",             label: "AUTRES" },
];

export default function ProductsListPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [items, setItems]     = useState([]);

  const [q, setQ]         = useState("");
  const [cat, setCat]     = useState("");
  const [brand, setBrand] = useState("");

  // -------- Read query string (brand, category/type, search or searchTerm) ------
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const b = p.get("brand") || "";
    const c = (p.get("category") || p.get("type") || "").toLowerCase();
    const s = p.get("search") || p.get("searchTerm") || "";
    setBrand(b);
    setCat(c);
    setQ(s);
  }, []);
  // ---------------------------------------------------------------------------

  // Garder l’URL synchronisée quand l’utilisateur tape / change les filtres
  useEffect(() => {
    const p = new URLSearchParams();
    if (brand) p.set("brand", brand);
    if (cat)   p.set("type", cat); // on garde ?type= pour la catégorie
    if (q)     p.set("search", q);
    const qs = p.toString();
    const url = qs ? `/products?${qs}` : "/products";
    window.history.replaceState(null, "", url);
  }, [brand, cat, q]);

  // Fetch serveur – on ne filtre par marque que côté backend
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    (async () => {
      try {
        const params = {};
        if (brand) params.brand = brand;

        const { data } = await api.get("/products/", { params });
        if (!alive) return;
        setItems(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setError(e?.response?.data?.detail || e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [brand]); // pas de filtre cat/q côté API

  // Filtre final côté client (catégorie + recherche texte)
  const filtered = useMemo(() => {
    const s = (q || "").trim().toLowerCase();
    const selected = (cat || "").toLowerCase();

    return items.filter((p) => {
      const primary = (p.category || "").toLowerCase();
      const extra = Array.isArray(p.categories)
        ? p.categories.map((c) => (c || "").toLowerCase())
        : [];

      const allCats = primary ? [primary, ...extra] : extra;
      const okCat = !selected || allCats.includes(selected);

      if (!s) return okCat;

      const name = (p.name || "").toLowerCase();
      return okCat && name.includes(s);
    });
  }, [items, q, cat]);

  return (
    <Container className="py-4 products-page">
      <Row className="align-items-center mb-3 products-header">
        <Col>
          <h2 className="m-0 products-title">Tous les produits</h2>
        </Col>
        <Col md="6">
          <Form.Control
            className="products-search"
            placeholder="Rechercher un produit (par nom)…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </Col>
      </Row>

      <div className="mb-2">
        {brand ? (
          <small className="text-muted">
            Marque sélectionnée : <b>{brand}</b>
          </small>
        ) : null}
      </div>

      <div className="mb-3 d-flex flex-wrap gap-2">
        <button
          type="button"
          className={`hp-tab ${cat === "" ? "is-active" : ""}`}
          onClick={() => setCat("")}
        >
          Tous
        </button>
        {CATS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`hp-tab ${cat === key ? "is-active" : ""}`}
            onClick={() => setCat(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" />
        </div>
      )}
      {error && <Alert variant="danger">{error}</Alert>}

      {!loading && !error && (
        filtered.length ? (
          <div className="hp-grid">
            {filtered.map((p) => (
              <HomeProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted py-5 font-sans">
            Aucun produit à afficher.
          </div>
        )
      )}
    </Container>
  );
}
