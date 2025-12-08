// src/pages/ProductDetailsPage.js
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Spinner, Row, Col, Container, Button, Modal } from "react-bootstrap";
import Message from "../components/Message";
import { deleteProduct, getProductDetails } from "../actions/productActions";
import { toggleWishlist } from "../actions/wishlistActions";
import { useCart } from "../cart/CartProvider";
import {
  CREATE_PRODUCT_RESET,
  DELETE_PRODUCT_RESET,
  UPDATE_PRODUCT_RESET,
  CARD_CREATE_RESET,
} from "../constants";
import { productImage } from "../utils/media";

import "./ProductDetailsPage.css";

// ✅ Category labels mapping
const CATEGORY_LABELS = {
  face: "Visage",
  lips: "Lèvres",
  eyes: "Yeux",
  eyebrow: "Sourcils",
  hair: "Cheveux",
  body: "Corps",
  packs: "Packs",
  acne: "Acné",
  hyper_pigmentation: "Hyper pigmentation",
  brightening: "Éclaircissement",
  dry_skin: "Peau sèche",
  combination_oily: "Peau mixte/grasse",
  other: "Autres",
};

function ProductDetailsPage({ history, match }) {
  const dispatch = useDispatch();
  const cart = useCart();

  const [show, setShow] = useState(false);
  const [qty, setQty] = useState(1);
  const [variantId, setVariantId] = useState(null);

  const { loading, error, product } =
    useSelector((s) => s.productDetailsReducer) || {};
  const { userInfo } = useSelector((s) => s.userLoginReducer) || {};
  const { success: productDeletionSuccess } =
    useSelector((s) => s.deleteProductReducer) || {};
  const { items: wishlistItems = [] } = useSelector((s) => s.wishlist || {});

  const pid = product?.id;
  const inWishlist = pid
    ? wishlistItems.some((w) => (w.product?.id ?? w.id ?? w._id) === pid)
    : false;

  const variants = useMemo(
    () => (Array.isArray(product?.variants) ? product.variants : []),
    [product?.variants]
  );

  const activeVariant = useMemo(
    () => variants.find((v) => String(v.id) === String(variantId)) || null,
    [variants, variantId]
  );

  const promoVariantId = product?.promo_variant_id || null;
  const hasDiscount = !!product?.has_discount && !!promoVariantId;
  const percent = Number(product?.discount_percent || 0);

  useEffect(() => {
    if (!variants.length) return;

    // Si promo, on sélectionne la variante promo par défaut
    if (hasDiscount && promoVariantId && variantId == null) {
      const pv = variants.find((v) => String(v.id) === String(promoVariantId));
      if (pv) {
        setVariantId(pv.id);
        return;
      }
    }

    // Sinon première variante en stock
    if (variantId == null) {
      const firstOk = variants.find((v) => v.in_stock) || variants[0];
      setVariantId(firstOk?.id ?? null);
    }
  }, [variants, hasDiscount, promoVariantId, variantId]);

  const unitPrice = (() => {
    if (activeVariant) {
      if (hasDiscount && String(activeVariant.id) === String(promoVariantId)) {
        return Number(product?.promo_variant_new_price || activeVariant.price);
      }
      return Number(activeVariant.price || 0);
    }
    if (hasDiscount) return Number(product?.new_price || product?.price || 0);
    return Number(product?.price || 0);
  })();

  const total = unitPrice * qty;

  const fmtMAD = (v) =>
    new Intl.NumberFormat("fr-MA", {
      style: "currency",
      currency: "MAD",
    }).format(Number(v || 0));

  const plus = () => setQty((q) => Math.min(99, q + 1));
  const minus = () => setQty((q) => Math.max(1, q - 1));

  const handleToggleWishlist = () => pid && dispatch(toggleWishlist(pid));

  const addToCart = () => {
    if (!pid) return;
    cart.addItem(
      {
        id: pid,
        name: product?.name,
        price: unitPrice,
        image: productImage(product),
        variantId: activeVariant ? activeVariant.id : null,
        variantLabel: activeVariant ? activeVariant.label : "",
      },
      qty
    );
    cart.setOpen(true);
  };

  useEffect(() => {
    dispatch(getProductDetails(match.params.id));
    dispatch({ type: UPDATE_PRODUCT_RESET });
    dispatch({ type: CREATE_PRODUCT_RESET });
    dispatch({ type: CARD_CREATE_RESET });
  }, [dispatch, match.params.id]);

  if (productDeletionSuccess) {
    alert("Product successfully deleted.");
    history.push("/");
    dispatch({ type: DELETE_PRODUCT_RESET });
  }

  // Build full category list
  const rawCats =
    Array.isArray(product?.categories) && product.categories.length
      ? product.categories
      : product?.category
      ? [product.category]
      : [];

  const prettyCats = rawCats
    .map((slug) => {
      const key = String(slug || "").toLowerCase();
      return CATEGORY_LABELS[key] || slug;
    })
    .filter(Boolean);

  return (
    <div>
      {/* Modal delete admin */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Confirmation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete <em>"{product?.name}"</em>?
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="danger"
            onClick={() => {
              dispatch(deleteProduct(match.params.id));
              setShow(false);
            }}
          >
            Confirm Delete
          </Button>
          <Button variant="primary" onClick={() => setShow(false)}>
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      {loading && (
        <span style={{ display: "flex" }}>
          <h5>Getting Product Details</h5>
          <span className="ml-2">
            <Spinner animation="border" />
          </span>
        </span>
      )}

      {error ? (
        <Message variant="danger">{error}</Message>
      ) : (
        <Container className="pd">
          <Row className="gy-4">
            {/* Col image */}
            <Col lg={6}>
              <div className="pd-media">
                <div className="pd-media-frame">
                  <img src={productImage(product)} alt={product?.name} />
                  {hasDiscount &&
                    String(variantId) === String(promoVariantId) && (
                      <span className="pd-sale-badge pd-sale-badge--media">
                        -{percent}%
                      </span>
                    )}
                </div>
              </div>
            </Col>

            {/* Col infos / actions */}
            <Col lg={6}>
              <div className="pd-card mb-3">
                <h2 className="pd-title">{product?.name}</h2>

                {/* Catégories */}
                <div className="pd-subtle mb-3">
                  Catégorie(s)&nbsp;:
                  {prettyCats.length ? (
                    <span>
                      {" "}
                      {prettyCats.map((label, i) => (
                        <span key={i} className="pd-chip-small mr-2">
                          {label}
                        </span>
                      ))}
                    </span>
                  ) : (
                    <b> — </b>
                  )}
                </div>

                {/* Stock */}
                <div className="mb-3">
                  {product?.stock ? (
                    <span className="pd-chip pd-chip--ok">
                      <i className="fas fa-check-circle" /> En stock
                    </span>
                  ) : (
                    <span className="pd-chip pd-chip--ko">
                      <i className="fas fa-times-circle" /> Hors stock
                    </span>
                  )}
                </div>

                {/* Description */}
                {product?.description && (
                  <p className="pd-subtle" style={{ lineHeight: 1.7 }}>
                    {product.description}
                  </p>
                )}

                {/* Variantes */}
                {variants.length > 0 && (
                  <div className="mb-3">
                    <div className="pd-subtle mb-2">Taille / Format</div>
                    <div className="pd-variants">
                      {variants.map((v) => (
                        <button
                          key={v.id}
                          type="button"
                          className={`pd-variant-pill${
                            String(variantId) === String(v.id)
                              ? " is-active"
                              : ""
                          }`}
                          disabled={!v.in_stock}
                          onClick={() => setVariantId(v.id)}
                          title={!v.in_stock ? "Indisponible" : v.label}
                          data-price={fmtMAD(v.price)}
                        >
                          {v.label}
                          {hasDiscount &&
                            String(v.id) === String(promoVariantId) && (
                              <span className="ml-2 small text-danger font-weight-bold">
                                −{percent}%
                              </span>
                            )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Bloc prix + quantité + actions */}
              <div className="pd-card">
                {/* ==== Prix + Variante, style bandeau violet ==== */}
                <div className="pd-price mb-3">
                  <div className="pd-price-label pd-subtle">Prix</div>

                  <div className="pd-price-main">
                    {hasDiscount &&
                    activeVariant &&
                    String(activeVariant.id) === String(promoVariantId) ? (
                      <>
                        <span className="pd-price-old">
                          {fmtMAD(product.promo_variant_old_price)}
                        </span>
                        <span className="pd-sale-badge">-{percent}%</span>
                        <span className="pd-price-new pd-price-new--promo">
                          {fmtMAD(product.promo_variant_new_price)}
                        </span>
                      </>
                    ) : (
                      <span className="pd-price-new">
                        {fmtMAD(unitPrice)}
                      </span>
                    )}
                  </div>

                  <div className="pd-price-variant pd-subtle small">
                    {activeVariant
                      ? `Variante : ${activeVariant.label}`
                      : "Variante : —"}
                  </div>
                </div>

                {/* Quantité */}
                <div className="mb-3">
                  <div className="pd-subtle mb-2">Quantité</div>
                  <div className="pd-qty">
                    <button
                      type="button"
                      className="btn"
                      onClick={minus}
                      aria-label="minus"
                    >
                      &minus;
                    </button>
                    <input
                      value={qty}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (!Number.isNaN(v))
                          setQty(Math.max(1, Math.min(99, v)));
                      }}
                    />
                    <button
                      type="button"
                      className="btn"
                      onClick={plus}
                      aria-label="plus"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Actions */}
                <div className="pd-actions mb-2">
                  <button
                    className="pd-btn-primary"
                    onClick={addToCart}
                    disabled={!product?.stock}
                  >
                    <i className="fas fa-shopping-bag mr-2" /> Ajouter au panier
                  </button>
                  <button
                    onClick={handleToggleWishlist}
                    className="pd-btn-outline"
                  >
                    {inWishlist
                      ? "💔 Retirer de ma wishlist"
                      : "🤍 Ajouter à ma wishlist"}
                  </button>
                  {userInfo && userInfo.admin && (
                    <>
                      <button
                        className="pd-btn-outline"
                        onClick={() =>
                          history.push(`/product-update/${product.id}/`)
                        }
                      >
                        Edit Product
                      </button>
                      <button
                        className="pd-btn-outline"
                        onClick={() => setShow(true)}
                      >
                        Delete Product
                      </button>
                    </>
                  )}
                </div>

                {/* Total */}
                <div className="pd-total">
                  Total estimé : <b>{fmtMAD(total)}</b>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      )}
    </div>
  );
}

export default ProductDetailsPage;
