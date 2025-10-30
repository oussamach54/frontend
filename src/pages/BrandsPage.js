import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./brands.css";

export default function BrandsPage() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const { data } = await axios.get("/api/brands/");
        if (ok) setBrands(Array.isArray(data) ? data : []);
      } catch (e) {
        // optional: set error UI
      } finally {
        if (ok) setLoading(false);
      }
    })();
    return () => { ok = false; };
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return needle ? brands.filter(b => (b || "").toLowerCase().includes(needle)) : brands;
  }, [brands, q]);

  const groups = useMemo(() => {
    const map = {};
    for (const b of filtered) {
      const letter = ((b || "")[0] || "#").toUpperCase();
      (map[letter] = map[letter] || []).push(b);
    }
    return Object.entries(map).sort(([a],[b]) => a.localeCompare(b));
  }, [filtered]);

  return (
    <div className="bp-wrap">
      <h1 className="bp-title">Marques</h1>

      <div className="bp-toolbar">
        <input
          className="bp-search"
          placeholder="Rechercher une marque…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div className="bp-letters">
          {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map(ch => (
            <a key={ch} href={`#${ch}`} className="bp-letter">{ch}</a>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="bp-empty">Chargement…</div>
      ) : groups.length === 0 ? (
        <div className="bp-empty">Aucune marque</div>
      ) : (
        groups.map(([letter, list]) => (
          <section key={letter} className="bp-section" id={letter}>
            <div className="bp-section-head">
              <span className="bp-letter-badge">{letter}</span>
            </div>
            <ul className="bp-grid">
              {list.map((b) => (
                <li key={b}>
                  {/* 🔴 STOP linking to /brand/:slug – use /products?brand=… */}
                  <Link
                    to={`/products?brand=${encodeURIComponent(b)}`}
                    className="bp-brand"
                  >
                    <span className="bp-brand-name">{b}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))
      )}
    </div>
  );
}
