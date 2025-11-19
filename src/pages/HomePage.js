// src/pages/HomePage.js
//ok
import React, { useEffect, useMemo, useState } from "react";
import { Container, Row, Col, Button, Spinner, Alert, Nav } from "react-bootstrap";
import api from "../api";

import "../components/HomeProducts.css";
import HomeProductCard from "../components/HomeProductCard";
import WhatsAppFloat from "../components/WhatsAppFloat";
import BrandMarquee from "../components/BrandMarquee";
import SiteFooter from "../components/SiteFooter";
import HScrollButtons from "../components/HScrollButtons";

const CATS = [
  { key: "face",    label: "VISAGE"   },
  { key: "lips",    label: "LÈVRES"   },
  { key: "eyes",    label: "YEUX"     },
  { key: "eyebrow", label: "SOURCILS" },
  { key: "hair",    label: "CHEVEUX"  },
];

export default function HomePage() {
  const [tab, setTab]           = useState("face");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [products, setProducts] = useState([]);

  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [errorFeatured, setErrorFeatured]     = useState(null);

  // ⭐ favoris
  const [favorites, setFavorites]   = useState([]);
  const [loadingFav, setLoadingFav] = useState(true);
  const [errorFav, setErrorFav]     = useState(null);

  const banners = useMemo(
    () => [
      "/hero/banner1.jpg",
      "/hero/banner2.jpg",
      "/hero/banner3.jpg",
      "/hero/banner4.jpg",
      "/hero/banner5.jpg",
    ],
    []
  );

  // Produits mis en avant
  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const { data } = await api.get("/products/");
        if (ok) setFeatured((data || []).slice(0, 12));
      } catch (e) {
        if (ok) setErrorFeatured(e?.response?.data?.detail || e.message);
      } finally {
        if (ok) setLoadingFeatured(false);
      }
    })();
    return () => {
      ok = false;
    };
  }, []);

  // ⭐ Produits favoris
  useEffect(() => {
    let alive = true;
    setLoadingFav(true);
    setErrorFav(null);
    (async () => {
      try {
        const { data } = await api.get("/products/", { params: { favorite: 1 } });
        if (!alive) return;
        setFavorites(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!alive) return;
        setErrorFav(e?.response?.data?.detail || e.message);
      } finally {
        if (alive) setLoadingFav(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Produits par catégorie (onglets)
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    setProducts([]);
    (async () => {
      try {
        const { data } = await api.get("/products/", { params: { type: tab } });
        if (!alive) return;
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setError(e?.response?.data?.detail || e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [tab]);

  return (
    <>
      {/* ===== Bandeau d’accueil ===== */}
      <section className="hero-strip">
        <div className="hero-overlay text-center text-white">
          <h1 className="display-hero font-display mb-3">
            Bienvenue sur Miniglow by Shay
          </h1>
          <p className="display-sub lead-tight font-sans mb-4">
            Des routines sûres et efficaces pour hydrater, illuminer et réparer la barrière de votre peau — livrées rapidement partout au Maroc.
          </p>
          <Button size="lg" variant="light" href="/products">
            Découvrir nos produits
          </Button>
        </div>

        <div className="hero-track">
          {banners.map((src, i) => (
            <img key={`a-${i}`} className="hero-tile" src={src} alt={`bannière ${i + 1}`} />
          ))}
          {banners.map((src, i) => (
            <img key={`b-${i}`} className="hero-tile" src={src} alt={`bannière copie ${i + 1}`} />
          ))}
        </div>
      </section>

      {/* ===== Produits mis en avant ===== */}
      <Container className="py-5">
        <Row className="align-items-center mb-3">
          <Col>
            <h2 className="m-0 font-display fw-700">Produits mis en avant cette semaine</h2>
          </Col>
          <Col className="text-right">
            <Button variant="outline-secondary" size="sm" href="/products">
              Voir tous les produits
            </Button>
          </Col>
        </Row>

        {loadingFeatured && (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" />
          </div>
        )}
        {errorFeatured && <Alert variant="danger">{errorFeatured}</Alert>}

        {!loadingFeatured && !errorFeatured && (
          featured.length ? (
            <HScrollButtons step={340}>
              {featured.map((p) => (
                <HomeProductCard key={p.id} product={p} />
              ))}
            </HScrollButtons>
          ) : (
            <div className="text-center text-muted py-5 font-sans">
              Aucun produit mis en avant pour le moment.
            </div>
          )
        )}
      </Container>

      {/* ⭐ ===== Produits favoris ===== */}
      <Container className="pb-4">
        <Row className="align-items-center mb-3">
          <Col>
            <h2 className="m-0 font-display fw-700">Nos produits favoris</h2>
          </Col>
        </Row>

        {loadingFav && (
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" />
          </div>
        )}
        {errorFav && <Alert variant="danger">{errorFav}</Alert>}

        {!loadingFav && !errorFav && (
          favorites.length ? (
            <HScrollButtons step={340}>
              {favorites.map((p) => (
                <HomeProductCard key={p.id} product={p} />
              ))}
            </HScrollButtons>
          ) : (
            <div className="text-center text-muted py-4 font-sans">
              Aucun produit favori sélectionné pour le moment.
            </div>
          )
        )}
      </Container>

      {/* ===== Rayons par catégorie (onglets) ===== */}
      <Container className="py-4">
        <div className="hp-tabs">
          <Nav
            variant="tabs"
            activeKey={tab}
            onSelect={(k) => setTab(k || "face")}
            className="justify-content-center"
          >
            {CATS.map(({ key, label }) => (
              <Nav.Item key={key}>
                <Nav.Link
                  eventKey={key}
                  className={`hp-tab ${tab === key ? "is-active" : ""} font-sans`}
                >
                  {label}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </div>

        <div className="mt-4">
          {loading && (
            <div className="d-flex justify-content-center py-5">
              <Spinner animation="border" />
            </div>
          )}
          {error && <Alert variant="danger">{error}</Alert>}

          {!loading && !error && (
            products.length ? (
              <HScrollButtons step={340}>
                {products.map((p) => (
                  <HomeProductCard key={p.id} product={p} />
                ))}
              </HScrollButtons>
            ) : (
              <div className="text-center text-muted py-5 font-sans">
                Aucun produit dans cette catégorie.
              </div>
            )
          )}
        </div>
      </Container>

      <BrandMarquee />

      {/* ===== Mise en avant vidéo soins de la peau ===== */}
      <section className="video-section">
        <Container>
          <Row className="align-items-center">
            <Col md={5} className="video-text mb-4 mb-md-0">
              <h2 className="video-title font-display">Découvrez la beauté au naturel 🌿</h2>
              <p className="video-desc font-sans">
                Prenez un moment pour vous. Découvrez notre gamme de soins inspirée par la nature
                et conçue pour sublimer votre peau. Des gestes simples, des résultats visibles — votre
                rituel beauté commence ici.
              </p>
              <Button variant="dark" size="lg" href="/products">
                Explorer les soins
              </Button>
            </Col>
            <Col md={7} className="video-col">
              <div className="video-wrapper">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="skincare-video"
                  poster="/video/preview.jpg"
                >
                  <source src="/video/skincare.mp4" type="video/mp4" />
                  Votre navigateur ne supporte pas la lecture vidéo.
                </video>
              </div>
            </Col>
          </Row>
        </Container>
      </section>

      <WhatsAppFloat
        phone="212689398538"
        label="WhatsApp"
        message="Salut ! J’aimerais des conseils sur vos produits 😊"
        position="left"
      />

      <SiteFooter />
    </>
  );
}

