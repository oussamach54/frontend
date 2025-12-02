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

  // Promo / variants
  const promoVariantId = product.promo_variant_id;
  const hasDiscount = !!product?.has_discount && !!promoVariantId;
  const promoVariant = (product.variants || []).find(
    (v) => String(v.id) === String(promoVariantId)
  );

  const oldDisplay = hasDiscount
    ? Number(product.promo_variant_old_price || 0)
    : Number(product.price || 0);

  const newDisplay = hasDiscount
    ? Number(product.promo_variant_new_price || 0)
    : Number(product.price || 0);

  const percent = Number(product?.discount_percent || 0);

  const isOutOfStock = !product.stock;

  const addToCart = () =>
    cart.addItem(
      {
        id,
        name: product.name + (promoVariant ? ` (${promoVariant.label})` : ""),
        price: newDisplay,
        image: img,
        variantId: promoVariant ? promoVariant.id : null,
        variantLabel: promoVariant ? promoVariant.label : "",
      },
      1
    );

  const addToWishlist = (e) => {
    e.preventDefault();
    dispatch(toggleWishlist(id));
  };

  // catégories
  const primary = (product.category || "").trim();
  const extrasRaw = Array.isArray(product.categories)
    ? product.categories
    : [];
  const extras = extrasRaw.filter(
    (c) => c && String(c).trim().toLowerCase() !== primary.toLowerCase()
  );
  const chips = primary ? [primary, ...extras] : extras;

  return (
    <article className="hp-card">
      {/* Badges en haut à gauche */}
      {!product.stock && (
        <span className="hp-badge hp-badge--ko">Out of stock</span>
      )}
      {hasDiscount && (
        <span className="hp-badge hp-badge--sale">-{percent}%</span>
      )}

      {/* Image + actions hover + bouton panier hover */}
      <div className="hp-media-wrap">
        <Link
          to={`/product/${id}/`}
          className="hp-media"
          aria-label={product.name}
        >
          <img src={img} alt={product.name} />
        </Link>

        {/* Icônes cœur / œil – visibles seulement au survol de la carte */}
        <div className="hp-actions-row">
          <button
            type="button"
            className="hp-action-square"
            title="Ajouter à la wishlist"
            onClick={addToWishlist}
          >
            <i className="fas fa-heart" />
          </button>
          <Link
            className="hp-action-square"
            to={`/product/${id}/`}
            title="Voir le produit"
          >
            <i className="fas fa-eye" />
          </Link>
        </div>

        {/* Bouton AJOUTER AU PANIER – collé en bas de l’image, seulement au hover */}
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

      {/* Contenu texte sous l’image : titre, tags, prix */}
      <div className="hp-body">
        <Link to={`/product/${id}/`} className="hp-title">
          {product.name}
          {hasDiscount && promoVariant ? ` — ${promoVariant.label}` : ""}
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
    <span className="hp-price-old">
      {oldDisplay.toFixed(2)} MAD
    </span>
  )}
  <span
    className={
      hasDiscount
        ? "hp-price-new hp-price-new--promo" // promo → rose
        : "hp-price-new"                      // normal → noir
    }
  >
    {newDisplay.toFixed(2)} MAD
  </span>
</div>

      </div>
    </article>
  );
}
