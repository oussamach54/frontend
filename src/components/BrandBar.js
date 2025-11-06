// src/components/BrandBar.js
import React, { useEffect, useState } from "react";
import { Container, Dropdown, Form, InputGroup, Button } from "react-bootstrap";
import { Link, useHistory } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../actions/userActions";
import "./brandbar.css";

function BrandSearch() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const history = useHistory();

  const submit = (e) => {
    e.preventDefault();
    const needle = q.trim();
    if (!needle) return;
    history.push(`/products?search=${encodeURIComponent(needle.toLowerCase())}`);
    setOpen(false);
  };

  return (
    <div className="brand-search">
      {!open ? (
        <Button variant="link" className="icon-link p-0" onClick={() => setOpen(true)} aria-label="Open search" title="Recherche">
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
            <Button type="submit" variant="dark" className="brand-search-btn">
              <i className="fas fa-search" />
            </Button>
            <Button variant="link" className="brand-search-close" onClick={() => setOpen(false)} aria-label="Close search">
              <i className="fas fa-times" />
            </Button>
          </InputGroup>
        </Form>
      )}
    </div>
  );
}

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
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className={`brandbar ${scrolled ? "scrolled" : ""}`}>
      <Container className="brandbar-inner">
        <div className="brandbar-left" />

        <div className="brandbar-logo logo-center">
          <Link to="/" className="brand-logo-link" aria-label="Home">
            <img src="/brand/logop.png" alt="Beauty Shop" className="brand-logo-img" />
          </Link>
        </div>

        <div className="brandbar-icons">
          <BrandSearch />

          <Link to="/wishlist" title="Wishlist" className="icon-link" style={{ position: "relative" }}>
            <i className="fas fa-heart" />
            {wishCount > 0 && <span className="icon-badge">{wishCount}</span>}
          </Link>

          <Link to="/cart" title="Panier" className="icon-link" style={{ position: "relative" }}>
            <i className="fas fa-shopping-bag" />
            {cartCount > 0 && <span className="icon-badge">{cartCount}</span>}
          </Link>

          {userInfo ? (
            <Dropdown align="end">
              <Dropdown.Toggle as="button" className="icon-link btn btn-link p-0 brand-user-toggle" aria-label="User menu">
                <i className="fas fa-user" />
              </Dropdown.Toggle>

              {/* No menuVariant prop here (RB v1) */}
              <Dropdown.Menu className="brand-user-menu">
                <Dropdown.Header className="text-capitalize">
                  {userInfo.username}
                </Dropdown.Header>

                <Dropdown.Item as={Link} to="/account">Account Settings</Dropdown.Item>
                <Dropdown.Item as={Link} to="/all-orders/">All Orders</Dropdown.Item>

                {userInfo.admin && (
                  <>
                    <Dropdown.Divider />
                    <Dropdown.Item as={Link} to="/new-product/">Add Product</Dropdown.Item>
                  </>
                )}

                <Dropdown.Divider />
                <Dropdown.Item onClick={logoutHandler}>Logout</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          ) : (
            <Link to="/login" title="Login" className="icon-link">
              <i className="fas fa-user" />
            </Link>
          )}
        </div>
      </Container>
    </div>
  );
}
