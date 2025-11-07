import React, { useEffect, useState } from "react";
import api from "../api";

export default function BrandMarquee() {
  const [brands, setBrands] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const { data } = await api.get("/brands/"); // public → NO auth
        if (ok) setBrands(Array.isArray(data) ? data : []);
      } catch (e) {
        if (ok) setError(e?.response?.data?.detail || e.message);
      }
    })();
    return () => { ok = false; };
  }, []);

  if (error) return null;
  if (!brands.length) return null;

  return (
    <div className="brandbar">
      <div className="brandbar-inner container">
        {brands.map((b) => (
          <span className="brand-pill" key={b}>{b}</span>
        ))}
      </div>
    </div>
  );
}
