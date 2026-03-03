import React, { useEffect, useRef, useState } from "react";
import { Container, Dropdown, Form, InputGroup, Button } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../actions/userActions";
import api from "../api";
import "./brandbar.css";

/* =========================
   SEARCH COMPONENT (IMPROVED)
========================= */
function BrandSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const history = useHistory();
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const delay = setTimeout(async () => {
      const term = q.trim();
      if (term.length < 2) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        const { data } = await api.get("/products/", {
          params: { search: term },
        });

        const filtered = (data || []).filter((p) =>
          p.name?.toLowerCase().includes(term.toLowerCase())
        );

        setResults(filtered.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [q]);

  const submit = (e) => {
    e.preventDefault();
    const needle = q.trim();
    if (!needle) return;
    history.push(`/products?search=${encodeURIComponent(needle)}`);
    setOpen(false);
    setResults([]);
  };

  const goToProduct = (id) => {
    history.push(`/product/${id}`);
    setOpen(false);
    setQ("");
    setResults([]);
  };

  return (
    <div className="brand-search" ref={wrapperRef}>
      {!open ? (
        <Button variant="link" className="icon-link p-0" onClick={() => setOpen(true)}>
          <i className="fas fa-search" />
        </Button>
      ) : (
        <Form onSubmit={submit} className="brand-search-form">
          <InputGroup size="sm">
            <Form.Control
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Rechercher un produit…"
              className="brand-search-input"
            />
            <Button type="submit" variant="dark">
              <i className="fas fa-search" />
            </Button>
            <Button
              variant="link"
              onClick={() => {
                setOpen(false);
                setResults([]);
              }}
            >
              <i className="fas fa-times" />
            </Button>
          </InputGroup>

          {q.length >= 2 && (
            <div className="brand-search-dropdown">
              {loading && <div className="brand-search-loading">Recherche...</div>}
              {!loading && results.length === 0 && (
                <div className="brand-search-empty">Aucun résultat</div>
              )}
              {results.map((p) => (
                <div
                  key={p.id}
                  className="brand-search-item"
                  onClick={() => goToProduct(p.id)}
                >
                  <img src={p.image} alt={p.name} />
                  <div>
                    <div>{p.name}</div>
                    <div>{p.price} dh</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Form>
      )}
    </div>
  );
}

/* =========================
   MAIN BAR (RESTORED)
========================= */

export default function BrandBar() {
  const dispatch = useDispatch();
  const history = useHistory();

  const { userInfo } = useSelector((s) => s.userLoginReducer || {});
  const { items: wishlistItems = [] } = useSelector((s) => s.wishlist || {});
  const wishCount = wishlistItems.length || 0;

  const cartItems = useSelector((s) => (s.cart && s.cart.items) || []);
  const cartCount =
    cartItems?.reduce?.((sum, it) => sum + (Number(it.qty) || 1), 0) ||
    cartItems?.length ||
    0;

  const logoutHandler = () => {
    dispatch(logout());
    history.push("/login");
    window.location.reload();
  };

  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 🔔 ADMIN PENDING ORDERS
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!userInfo?.admin) {
      setPendingCount(0);
      return;
    }

    let alive = true;

    const loadPending = async () => {
      try {
        const { data } = await api.get("/orders/admin/", {
          params: { status: "pending" },
        });
        if (!alive) return;
        setPendingCount(Array.isArray(data) ? data.length : 0);
      } catch (e) {
        console.warn("Failed to load pending orders", e);
      }
    };

    loadPending();
    const interval = setInterval(loadPending, 15000);

    return () => {
      alive = false;
      clearInterval(interval);
    };
  }, [userInfo]);

  return (
    <div className={`brandbar ${scrolled ? "scrolled" : ""}`}>
      <Container className="brandbar-inner">
        <div className="brandbar-left" />

        <div className="brandbar-logo logo-center">
          <Link to="/" className="brand-logo-link">
            <img
  src="/brand/logov.png"
  alt="MiniGlowByshay"
  className="brand-logo-img"
/>
          </Link>
        </div>

        <div className="brandbar-icons">
          <BrandSearch />

          <Link to="/wishlist" className="icon-link" style={{ position: "relative" }}>
            <i className="fas fa-heart" />
            {wishCount > 0 && <span className="icon-badge">{wishCount}</span>}
          </Link>

          <Link to="/cart" className="icon-link" style={{ position: "relative" }}>
            <i className="fas fa-shopping-bag" />
            {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
          </Link>

          {/* 🔔 ADMIN BELL */}
          {userInfo?.admin && (
            <Link
              to="/admin/orders"
              className="icon-link"
              style={{ position: "relative" }}
            >
              <i className="fas fa-bell" />
              {pendingCount > 0 && (
                <span className="icon-badge">{pendingCount}</span>
              )}
            </Link>
          )}

          {userInfo ? (
            <Dropdown align="end">
              <Dropdown.Toggle as="button" className="icon-link btn btn-link p-0">
                <i className="fas fa-user" />
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Header className="text-capitalize">
                  {userInfo.username}
                </Dropdown.Header>

                <Dropdown.Item as={Link} to="/account">
                  Paramètres du compte
                </Dropdown.Item>

                <Dropdown.Item as={Link} to="/orders">
                  Mes commandes
                </Dropdown.Item>

                {userInfo.admin && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to="/admin/orders">
                      Commandes (Admin)
                    </Dropdown.Item>
                    <Dropdown.Item as={Link} to="/new-product/">
                      Ajouter un produit
                    </Dropdown.Item>
                  </>
                )}

                <Dropdown.Divider />
                <Dropdown.Item onClick={logoutHandler}>
                  Se déconnecter
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Link to="/login" className="icon-link">
              <i className="fas fa-user" />
            </Link>
          )}
        </div>
      </Container>
    </div>
  );
}