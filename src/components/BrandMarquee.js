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
      } catch {
        /* silent – not critical UI */
      }
    })();
    return () => { alive = false; };
  }, []);

  // Duplicate items so the track loops seamlessly
  const looped = useMemo(() => {
    const safe = brands.filter(Boolean);
    // Fall back to a few names if API returns empty (so section still has shape)
    const base = safe.length ? safe : ["The Ordinary", "CeraVe", "Nuxe", "La Roche-Posay", "COSRX"];
    return [...base, ...base, ...base];
  }, [brands]);

  return (
    <section className="bm-wrap" aria-label="Brands">
      <div className="bm-mask">
        <ul className="bm-track">
          {looped.map((name, i) => (
            <li key={`${name}-${i}`} className="bm-chip" title={name}>
              {name}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
