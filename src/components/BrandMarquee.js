import React, { useEffect, useMemo, useState } from "react";
import api from "../api";
import "./BrandMarqueePro.css";

export default function BrandMarquee() {
  const [brands, setBrands] = useState([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await api.get("/brands/");
        if (alive) setBrands(Array.isArray(data) ? data : []);
      } catch {/* non-blocking */}
    })();
    return () => { alive = false; };
  }, []);

  // duplicate for seamless loop
  const items = useMemo(() => {
    const base = (brands || []).filter(Boolean);
    const fallback = ["The Ordinary", "CeraVe", "Nuxe", "La Roche-Posay", "COSRX"];
    const list = base.length ? base : fallback;
    return [...list, ...list];
  }, [brands]);

  return (
    <section className="bmpro-shell" aria-label="Brands">
      <div className="bmpro-gradient" />
      <div className="bmpro-inner">
        <div className="bmpro-mask">
          <ul className="bmpro-track bmpro-right">
            {items.map((name, i) => (
              <li key={`${name}-${i}`} className="bmpro-chip" title={name}>
                <span className="bmpro-name">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
