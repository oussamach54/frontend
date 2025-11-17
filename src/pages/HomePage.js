// src/pages/HomePage.js
import React, { useEffect, useMemo, useState } from 'react';
import { Container, Row, Col, Button, Spinner, Alert, Nav } from 'react-bootstrap';
import api from '../api';

import "../components/HomeProducts.css";
import HomeProductCard from "../components/HomeProductCard";
import WhatsAppFloat from "../components/WhatsAppFloat";
import BrandMarquee from "../components/BrandMarquee";
import SiteFooter from "../components/SiteFooter";
import HScrollButtons from "../components/HScrollButtons";

const CATS = [
  { key: "face",    label: "VISAGE"  },
  { key: "lips",    label: "LÈVRES"  },
  { key: "eyes",    label: "YEUX"    },
  { key: "eyebrow", label: "SOURCILS"},
  { key: "hair",    label: "CHEVEUX" },
  { key: "corps",    label: "CORPS" },
];

export default function HomePage() {
  const [tab, setTab]           = useState("face");
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [products, setProducts] = useState([]);

  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [errorFeatured, setErrorFeatured]     = useState(null);

  const banners = useMemo(() => ([
    '/hero/banner1.jpg',
    '/hero/banner2.jpg',
    '/hero/banner3.jpg',
    '/hero/banner4.jpg',
    '/hero/banner5.jpg',
  ]), []);

  // Featured
  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const { data } = await api.get('/products/');
        if (ok) setFeatured((data || []).slice(0, 12));
      } catch (e) {
        if (ok) setErrorFeatured(e?.response?.data?.detail || e.message);
      } finally {
        if (ok) setLoadingFeatured(false);
      }
    })();
    return () => { ok = false; };
  }, []);

  // Tabbed categories
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    setProducts([]);
    (async () => {
      try {
        const { data } = await api.get('/products/', { params: { type: tab } });
        if (!alive) return;
        setProducts(Array.isArray(data) ? data : []);
      } catch (e) {
        if (alive) setError(e?.response?.data?.detail || e.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [tab]);

  return (
    <>
      {/* ===== HERO strip ===== */}
      <section className="hero-strip">
        <div className="hero-overlay text-center text-white">
          <h1 className="display-hero font-display mb-3">
            Welcome to Your Miniglow by shay
          </h1>
          <p className="display-sub lead-tight font-sans mb-4">
            Safe, effective routines for hydration, brightening and barrier repair — shipped fast.
          </p>
          <Button size="lg" variant="light" href="/products">Discover our products</Button>
        </div>

        <div className="hero-track">
          {banners.map((src, i) => (
            <img key={`a-${i}`} className="hero-tile" src={src} alt={`banner ${i + 1}`} />
          ))}
          {banners.map((src, i) => (
            <img key={`b-${i}`} className="hero-tile" src={src} alt={`banner dup ${i + 1}`} />
          ))}
        </div>
      </section>

      {/* ===== Featured ===== */}
      <Container className="py-5">
        <Row className="align-items-center mb-3">
          <Col>
            <h2 className="m-0 font-display fw-700">Featured this week</h2>
          </Col>
          <Col className="text-right">
            <Button variant="outline-secondary" size="sm" href="/products">See all</Button>
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
              {featured.map((p) => <HomeProductCard key={p.id} product={p} />)}
            </HScrollButtons>
          ) : (
            <div className="text-center text-muted py-5 font-sans">
              No featured products yet.
            </div>
          )
        )}
      </Container>

      {/* ===== Category shelf (tabs) ===== */}
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
                <Nav.Link eventKey={key} className={`hp-tab ${tab === key ? "is-active" : ""} font-sans`}>
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
                {products.map((p) => <HomeProductCard key={p.id} product={p} />)}
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

      {/* ===== Skincare video spotlight ===== */}
      <section className="video-section">
        <Container>
          <Row className="align-items-center">
            <Col md={5} className="video-text mb-4 mb-md-0">
              <h2 className="video-title font-display">Découvrez la beauté au naturel 🌿</h2>
              <p className="video-desc font-sans">
                Prenez un moment pour vous. Découvrez notre gamme de soins inspirée par la nature
                et conçue pour sublimer votre peau. Des gestes simples, des résultats visibles — votre rituel beauté
                commence ici.
              </p>
              <Button variant="dark" size="lg" href="/products">Explorer les soins</Button>
            </Col>

            <Col md={7} className="video-col">
              <div className="video-wrapper">
                <video
                  className="skincare-video"
                  src="/video/skincare.mp4"
                  autoPlay
                  muted
                  loop
                  playsInline
                  disablePictureInPicture
                  controlsList="nodownload nofullscreen noremoteplayback"
                />
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
