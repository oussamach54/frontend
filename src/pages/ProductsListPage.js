// src/pages/ProductsListPage.js
import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import { Container, Spinner, Alert } from "react-bootstrap";
import { useLocation } from "react-router-dom";

import "../components/HomeProducts.css";
import HomeProductCard from "../components/HomeProductCard";

function useQS() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

export default function ProductsListPage() {
  const qs = useQS();
  const typeFromURL  = (qs.get("type")  || "").toLowerCase();
  const brandFromURL = qs.get("brand") || "";

  const [products, setProducts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [q, setQ] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    api
      .get("/api/products/", {
        params: {
          type:  typeFromURL  || undefined,
          brand: brandFromURL || undefined,
        },
      })
      .then(({ data }) => alive && setProducts(Array.isArray(data) ? data : []))
      .catch((e) => alive && setError(e?.response?.data?.detail || e.message))
      .finally(() => alive && setLoading(false));

    return () => { alive = false; };
  }, [typeFromURL, brandFromURL]);

  const byType = useMemo(() => {
    if (!typeFromURL) return products;
    return products.filter((p) => {
      const t1 = (p.type || "").toLowerCase();
      const t2 = (p.category || "").toLowerCase();
      return t1 === typeFromURL || t2 === typeFromURL;
    });
  }, [products, typeFromURL]);

  const byBrand = useMemo(() => {
    if (!brandFromURL) return byType;
    const needle = brandFromURL.toLowerCase();
    return byType.filter((p) => (p.brand || "").toLowerCase() === needle);
  }, [byType, brandFromURL]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return byBrand;
    return byBrand.filter((p) =>
      (p.name || "").toLowerCase().includes(needle) ||
      (p.description || "").toLowerCase().includes(needle)
    );
  }, [byBrand, q]);

  const title = brandFromURL
    ? `Produits — ${brandFromURL}`
    : typeFromURL
    ? `Produits — ${typeFromURL}`
    : "Tous les produits";

  return (
    <Container className="py-5">
      <div className="d-flex flex-wrap align-items-center justify-content-between mb-3">
        <h2 className="m-0 font-display fw-700">{title}</h2>

        <input
          type="search"
          className="form-control"
          placeholder="Rechercher un produit…"
          style={{ minWidth: 280, maxWidth: 420 }}
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
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
            {filtered.map((p) => <HomeProductCard key={p.id} product={p} />)}
          </div>
        ) : (
          <div className="text-center text-muted py-5">Aucun produit trouvé.</div>
        )
      )}
    </Container>
  );
}
