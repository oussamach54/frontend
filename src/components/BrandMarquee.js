import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./brand-marquee.css";

const LOGOS = {
  "beauty of joseon": "/brands/boj.svg",
  "axis-y": "/brands/axisy.svg",
  "cosrx": "/brands/cosrx.svg",
  "skin1004": "/brands/skin1004.svg",
  "dr. althea": "/brands/dralthea.svg",
  "i'm from": "/brands/imfrom.svg",
  anua: "/brands/anua.svg",
};

export default function BrandMarquee() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const { data } = await axios.get("/api/brands/");
        if (alive) setBrands((Array.isArray(data) ? data : []).filter(Boolean));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const display = useMemo(
    () => (brands.length ? [...brands, ...brands] : []),
    [brands]
  );

  if (loading || !display.length) return null;

  return (
    <section className="bm-wrap">
      <h2 className="bm-title">Toutes nos marques</h2>

      <div className="bm-rail">
        <div className="bm-track">
          {display.map((raw, i) => {
            const label = String(raw || "").trim();
            const key = label.toLowerCase();
            const src = LOGOS[key];
            return (
              <div className="bm-card" key={`${key}-${i}`}>
                {src ? <img src={src} alt={label} /> : <span className="bm-text">{label}</span>}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
