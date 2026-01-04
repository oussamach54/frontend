// src/components/HomeProductCard.js
import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toggleWishlist } from "../actions/wishlistActions";
import { useCart } from "../cart/CartProvider";
import { productImage } from "../utils/media";
import "./HomeProducts.css";

const CAT_LABELS = {
  face: "VISAGE",
  lips: "LÈVRES",
  eyes: "YEUX",
  eyebrow: "SOURCILS",
  hair: "CHEVEUX",
  body: "CORPS",
  packs: "PACKS",
  acne: "ACNÉ",
  hyper_pigmentation: "HYPER PIGMENTATION",
  brightening: "ÉCLAIRCISSEMENT",
  dry_skin: "PEAU SÈCHE",
  combination_oily: "PEAU MIXTE/GRASSE",
  other: "AUTRES",
};

function toNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function pickBaseVariant(variants) {
  const vs = Array.isArray(variants) ? variants.filter(Boolean) : [];
  if (!vs.length) return null;

  // Prefer smallest size_ml if available
  const withSize = vs.filter(
    (v) => v.size_ml !== null && v.size_ml !== undefined && toNum(v.size_ml) > 0
  );
  if (withSize.length) {
    withSize.sort((a, b) => toNum(a.size_ml) - toNum(b.size_ml));
    return withSize[0];
  }

  // Fallback: cheapest price
  vs.sort((a, b) => toNum(a.price) - toNum(b.price));
  return vs[0];
}

function variantHasDiscount(v) {
  const price = toNum(v?.price);
  const newPrice = toNum(v?.new_price);
  return newPrice > 0 && price > 0 && newPrice < price;
}

function variantFinalPrice(v) {
  const price = toNum(v?.price);
  const newPrice = toNum(v?.new_price);
  if (newPrice > 0 && price > 0 && newPrice < price) return newPrice;
  return price;
}

export default function HomeProductCard({ product }) {
  const dispatch = useDispatch();
  const cart = useCart();

  const id = product?.id ?? product?._id;
  const img = productImage(product);

  const baseVariant = useMemo(
    () => pickBaseVariant(product?.variants),
    [product?.variants]
  );

  // ✅ Base size label (ex: "10 ml")
  const baseLabel = baseVariant?.label ? String(baseVariant.label) : "";

  // ✅ Base price logic:
  // - if variants exist -> use baseVariant price/new_price
  // - else -> use product.price/product.new_price
  const basePrice = baseVariant ? toNum(baseVariant.price) : toNum(product?.price);
  const baseNewPrice = baseVariant
    ? toNum(baseVariant.new_price)
    : toNum(product?.new_price);

  const hasDiscount = baseVariant
    ? variantHasDiscount(baseVariant)
    : (baseNewPrice > 0 && basePrice > 0 && baseNewPrice < basePrice);

  const newDisplay = baseVariant
    ? variantFinalPrice(baseVariant)
    : (hasDiscount ? baseNewPrice : basePrice);

  const oldDisplay = basePrice;

  const percent =
    hasDiscount && oldDisplay > 0
      ? Math.round(((oldDisplay - newDisplay) / oldDisplay) * 100)
      : 0;

  const isOutOfStock =
    !product?.stock || (baseVariant ? baseVariant.in_stock === false : false);

  const addToCart = () => {
    const vId = baseVariant ? baseVariant.id : null;
    const vLabel = baseVariant ? baseVariant.label : "";

    cart.addItem(
      {
        id,
        name: product?.name + (vLabel ? ` (${vLabel})` : ""),
        price: newDisplay,
        image: img,
        variantId: vId,
        variantLabel: vLabel,
      },
      1
    );
  };

  const addToWishlist = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist(id));
  };

  // categories chips
  const primary = (product?.category || "").trim();
  const extrasRaw = Array.isArray(product?.categories) ? product.categories : [];
  const extras = extrasRaw.filter(
    (c) => c && String(c).trim().toLowerCase() !== primary.toLowerCase()
  );
  const chips = primary ? [primary, ...extras] : extras;

  return (
    <article className="hp-card">
      {!product?.stock && (
        <span className="hp-badge hp-badge--ko">Out of stock</span>
      )}
      {hasDiscount && (
        <span className="hp-badge hp-badge--sale">-{percent}%</span>
      )}

      <div className="hp-media-wrap">
        <Link to={`/product/${id}/`} className="hp-media" aria-label={product?.name}>
          <img src={img} alt={product?.name} />
        </Link>

        <div className="hp-actions-row">
          <button
            type="button"
            className="hp-action-square"
            title="Ajouter à la wishlist"
            onClick={addToWishlist}
          >
            <i className="fas fa-heart" />
          </button>

          <Link className="hp-action-square" to={`/product/${id}/`} title="Voir le produit">
            <i className="fas fa-eye" />
          </Link>
        </div>

        <button
          type="button"
          className={`hp-addbar ${isOutOfStock ? "is-disabled" : ""}`}
          onClick={isOutOfStock ? undefined : addToCart}
          disabled={isOutOfStock}
        >
          <i className="fas fa-shopping-bag mr-2" />
          {isOutOfStock ? "RUPTURE DE STOCK" : "AJOUTER AU PANIER"}
        </button>
      </div>

      <div className="hp-body">
        <Link to={`/product/${id}/`} className="hp-title">
          {product?.name}
        </Link>

        {chips.length > 0 && (
          <div className="mt-1 d-flex flex-wrap" style={{ gap: 6 }}>
            {chips.map((c) => {
              const key = String(c);
              const slug = key.toLowerCase();
              const label = CAT_LABELS[slug] || key;
              return (
                <span
                  key={key}
                  className="badge badge-light"
                  style={{ border: "1px solid #eee", fontWeight: 500 }}
                  title={label}
                >
                  {label}
                </span>
              );
            })}
          </div>
        )}

        {/* ✅ PRICE + BASE SIZE beside price */}
        <div
          className="hp-price-wrap"
          style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 6 }}
        >
          {hasDiscount && (
            <span className="hp-price-old">{oldDisplay.toFixed(2)} MAD</span>
          )}

          <span className={hasDiscount ? "hp-price-new hp-price-new--promo" : "hp-price-new"}>
            {newDisplay.toFixed(2)} MAD
          </span>

          {baseLabel && (
            <span
              className="hp-price-variant"
              style={{
                fontSize: 13,
                color: "#6b7280",
                whiteSpace: "nowrap",
              }}
            >
              · {baseLabel}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
