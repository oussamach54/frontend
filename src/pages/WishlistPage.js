// src/pages/WishlistPage.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';

import { fetchWishlist, toggleWishlist } from '../actions/wishlistActions';

const currency = (v) =>
  new Intl.NumberFormat('fr-MA', { style: 'currency', currency: 'MAD' }).format(Number(v || 0));

/**
 * Normalize an item so the UI doesn't care if your API returns:
 *   { id, name, price, image }  OR  { product: { id, name, price, image } }
 */
function normalizeItem(raw) {
  const p = raw?.product || raw || {};
  return {
    id: p.id ?? p._id ?? raw?.product_id ?? raw?.id,
    name: p.name || '—',
    price: p.price ?? 0,
    image: p.image || '', // can be relative or absolute
  };
}

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items = [], loading, error } = useSelector((s) => s.wishlist || {});

  useEffect(() => {
    dispatch(fetchWishlist());
  }, [dispatch]);

  if (loading) {
    return (
      <Container className="py-4">
        <h2>My Wishlist</h2>
        <p className="text-muted">Loading…</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <h2>My Wishlist</h2>
        <div className="alert alert-danger mb-0">{String(error)}</div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h2 className="mb-4">My Wishlist</h2>

      {(!items || items.length === 0) ? (
        <div className="text-muted">Your wishlist is empty.</div>
      ) : (
        <Row>
          {items.map((raw) => {
            const it = normalizeItem(raw);
            return (
              <Col key={it.id} xs={12} sm={6} md={4} lg={3} className="mb-4">
                <Card className="h-100 shadow-sm">
                  <div
                    style={{
                      height: 180,
                      background: '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      borderBottom: '1px solid rgba(0,0,0,.05)',
                    }}
                  >
                    {it.image ? (
                      <img
                        src={it.image}
                        alt={it.name}
                        style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <div className="text-muted small">No image</div>
                    )}
                  </div>

                  <Card.Body className="d-flex flex-column">
                    <Card.Title className="h6 mb-2" title={it.name} style={{ minHeight: 40 }}>
                      {it.name}
                    </Card.Title>

                    <div className="mb-3 font-weight-bold">{currency(it.price)}</div>

                    <div className="mt-auto d-flex gap-2">
                      <Link to={`/product/${it.id}`} className="btn btn-sm btn-primary mr-2">
                        View
                      </Link>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => dispatch(toggleWishlist(it.id))}
                      >
                        Remove
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
    </Container>
  );
}
