
import React from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toggleWishlist } from "../actions/wishlistActions";
import { useCart } from "../cart/CartProvider";
import "./HomeProducts.css";

export default function HomeProductCard({ product }) {
  const id = product.id ?? product._id;
  const dispatch = useDispatch();
  const cart = useCart();

  const img = product.image_url || product.image || "";

  // promo only on biggest variant
  const promoVariantId = product.promo_variant_id;
  const hasDiscount = !!product?.has_discount && !!promoVariantId;
  const promoVariant = (product.variants || []).find(v => String(v.id) === String(promoVariantId));

  const oldDisplay = hasDiscount
    ? Number(product.promo_variant_old_price || 0)
    : Number(product.price || 0);

  const newDisplay = hasDiscount
    ? Number(product.promo_variant_new_price || 0)
    : Number(product.price || 0);

  const percent = Number(product?.discount_percent || 0);

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

  const addToWishlist = (e) => { e.preventDefault(); dispatch(toggleWishlist(id)); };

  return (
    <article className="hp-card">
      {!product.stock && <span className="hp-badge hp-badge--ko">Out of stock</span>}
      {hasDiscount && <span className="hp-badge hp-badge--sale">-{percent}%</span>}

      <Link to={`/product/${id}/`} className="hp-media" aria-label={product.name}>
        <img src={img} alt={product.name} />
      </Link>

      <div className="hp-actions-row">
        <button type="button" className="hp-action-square" title="Ajouter à la wishlist" onClick={addToWishlist}>
          <i className="fas fa-heart" />
        </button>
        <Link className="hp-action-square" to={`/product/${id}/`} title="Voir le produit">
          <i className="fas fa-eye" />
        </Link>
      </div>

      <button type="button" className="hp-addbar" onClick={addToCart}>
        <i className="fas fa-shopping-bag mr-2" /> AJOUTER AU PANIER
      </button>

      <div className="hp-body">
        <Link to={`/product/${id}/`} className="hp-title">
          {product.name}{hasDiscount && promoVariant ? ` — ${promoVariant.label}` : ""}
        </Link>

        <div className="hp-price-wrap">
          {hasDiscount && <span className="hp-price-old">{oldDisplay.toFixed(2)} MAD</span>}
          <span className="hp-price-new">{newDisplay.toFixed(2)} MAD</span>
        </div>
      </div>
    </article>
  );
}
