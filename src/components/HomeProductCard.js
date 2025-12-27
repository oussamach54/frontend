// src/components/HomeProductCard.js
import React from "react";
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

export default function HomeProductCard({ product }) {
  const id = product.id ?? product._id;
  const dispatch = useDispatch();
  const cart = useCart();

  const img = productImage(product);

  // ✅ BASE PRODUCT PRICE ONLY (ignore variants)
  const basePrice = Number(product?.price || 0);
  const baseNewPrice = Number(product?.new_price || 0);

  const hasDiscount =
    baseNewPrice > 0 && basePrice > 0 && baseNewPrice < basePrice;

  const oldDisplay = hasDiscount ? basePrice : basePrice;
  const newDisplay = hasDiscount ? baseNewPrice : basePrice;

  const percent = hasDiscount
    ? Math.round(((basePrice - baseNewPrice) / basePrice) * 100)
    : 0;

  const isOutOfStock = !product.stock;

  // ✅ Add to cart using base price (no variant)
  const addToCart = () =>
    cart.addItem(
      {
        id,
        name: product.name,
        price: newDisplay,
        image: img,
        variantId: null,
        variantLabel: "",
      },
      1
    );

  const addToWishlist = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist(id));
  };

  // categories
  const primary = (product.category || "").trim();
  const extrasRaw = Array.isArray(product.categories) ? product.categories : [];
  const extras = extrasRaw.filter(
    (c) => c && String(c).trim().toLowerCase() !== primary.toLowerCase()
  );
  const chips = primary ? [primary, ...extras] : extras;

  return (
    <article className="hp-card">
      {!product.stock && (
        <span className="hp-badge hp-badge--ko">Out of stock</span>
      )}
      {hasDiscount && (
        <span className="hp-badge hp-badge--sale">-{percent}%</span>
      )}

      <div className="hp-media-wrap">
        <Link to={`/product/${id}/`} className="hp-media" aria-label={product.name}>
          <img src={img} alt={product.name} />
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
          {product.name}
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

        <div className="hp-price-wrap">
          {hasDiscount && (
            <span className="hp-price-old">{oldDisplay.toFixed(2)} MAD</span>
          )}
          <span className={hasDiscount ? "hp-price-new hp-price-new--promo" : "hp-price-new"}>
            {newDisplay.toFixed(2)} MAD
          </span>
        </div>
      </div>
    </article>
  );
}
