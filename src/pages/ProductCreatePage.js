import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button, InputGroup } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { createProduct } from "../actions/productActions";
import { checkTokenValidation, logout } from "../actions/userActions";
import { CREATE_PRODUCT_RESET } from "../constants";
import Message from "../components/Message";

const CATEGORY_OPTIONS = [
  { value: "face", label: "Face" },
  { value: "lips", label: "Lips" },
  { value: "eyes", label: "Eyes" },
  { value: "eyebrow", label: "Eyebrow" },
  { value: "hair", label: "Cheveux" },
  { value: "body", label: "Corps" },
  { value: "packs", label: "Packs" },
  { value: "acne", label: "Acné" },
  { value: "hyper_pigmentation", label: "Hyper pigmentation" },
  { value: "brightening", label: "Éclaircissement" },
  { value: "dry_skin", label: "Peau sèche" },
  { value: "combination_oily", label: "Peau mixte / grasse" },
  { value: "other", label: "Autre" },
];

export default function ProductCreatePage() {
  const history = useHistory();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [newPrice, setNewPrice] = useState("");
  const [discountPct, setDiscountPct] = useState("");
  const [stock, setStock] = useState(false);
  const [image, setImage] = useState(null);

  const [brand, setBrand] = useState("");
  // multi categories
  const [categories, setCategories] = useState(["other"]);

  // ⭐ NEW: produit favori
  const [isFavorite, setIsFavorite] = useState(false);

  const [variants, setVariants] = useState([
    { label: "", size_ml: "", price: "", in_stock: true, sku: "" },
  ]);

  const addVariantRow = () =>
    setVariants((v) => [
      ...v,
      { label: "", size_ml: "", price: "", in_stock: true, sku: "" },
    ]);

  const removeVariantRow = (idx) =>
    setVariants((v) => v.filter((_, i) => i !== idx));

  const changeVariant = (idx, field, value) =>
    setVariants((v) =>
      v.map((row, i) => (i === idx ? { ...row, [field]: value } : row))
    );

  const { userInfo } = useSelector((s) => s.userLoginReducer || {});
  const { product, success, error } =
    useSelector((s) => s.createProductReducer || {});
  const { error: tokenError } =
    useSelector((s) => s.checkTokenValidationReducer || {});

  useEffect(() => {
    if (!userInfo) {
      history.push("/login");
      return;
    }
    dispatch(checkTokenValidation());
  }, [dispatch, userInfo, history]);

  const norm = (x) => (x == null ? "" : String(x).replace(",", "."));

  const applyPercent = () => {
    const base = parseFloat(norm(price));
    const pct = parseFloat(norm(discountPct));
    if (!isFinite(base) || !isFinite(pct) || base <= 0 || pct <= 0) return;
    setNewPrice(String(+(base * (100 - pct) / 100).toFixed(2)));
  };

  // toggle pill-style categories
  const toggleCategory = (slug) => {
    setCategories((prev) => {
      if (prev.includes(slug)) {
        // éviter 0 catégories – garder "other" en fallback
        const next = prev.filter((c) => c !== slug);
        return next.length ? next : ["other"];
      }
      // enlever "other" quand on ajoute une vraie catégorie
      const base = prev.filter((c) => c !== "other");
      return [...base, slug];
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description);
    fd.append("price", norm(price));
    fd.append("new_price", newPrice === "" ? "" : norm(newPrice));
    fd.append("stock", stock ? "true" : "false");
    if (image) fd.append("image", image);
    fd.append("brand", brand);

    const primary = (categories[0] || "other").toLowerCase();
    fd.append("category", primary);
    fd.append("categories", JSON.stringify(categories));

    // ⭐ envoyer favori au backend
    fd.append("is_favorite", isFavorite ? "true" : "false");

    const clean = variants
      .filter((v) => v.label && String(v.price) !== "")
      .map((v) => ({
        label: v.label,
        size_ml: v.size_ml === "" ? null : Number(norm(v.size_ml)),
        price: Number(norm(v.price)),
        in_stock: !!v.in_stock,
        sku: v.sku || "",
      }));
    if (clean.length) fd.append("variants", JSON.stringify(clean));

    dispatch(createProduct(fd));
  };

  useEffect(() => {
    if (!success) return;
    const newId =
      product?.id ??
      product?.product?.id ??
      product?.product_id ??
      null;
    history.replace(newId ? `/product/${newId}/` : "/products");
    dispatch({ type: CREATE_PRODUCT_RESET });
  }, [success, product, history, dispatch]);

  useEffect(() => {
    if (userInfo && tokenError === "Request failed with status code 401") {
      alert("Session expired, please login again.");
      dispatch(logout());
      history.push("/login");
      window.location.reload();
    }
  }, [userInfo, tokenError, dispatch, history]);

  return (
    <div>
      {error && (
        <Message variant="danger">
          {error.image ? error.image[0] : String(error)}
        </Message>
      )}
      <span className="d-flex justify-content-center text-info">
        <em>New Product</em>
      </span>

      <Form onSubmit={onSubmit}>
        <Form.Group controlId="name">
          <Form.Label>
            <b>Product Name</b>
          </Form.Label>
          <Form.Control
            required
            autoFocus
            value={name}
            placeholder="product name"
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="description">
          <Form.Label>
            <b>Product Description</b>
          </Form.Label>
          <Form.Control
            required
            value={description}
            placeholder="product description"
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="brand">
          <Form.Label>
            <b>Brand (Marque)</b>
          </Form.Label>
          <Form.Control
            value={brand}
            placeholder="Ex. The Ordinary"
            onChange={(e) => setBrand(e.target.value)}
          />
        </Form.Group>

        {/* Multi-catégories */}
        <Form.Group controlId="category">
          <Form.Label>
            <b>Categories</b>
          </Form.Label>
          <div className="d-flex flex-wrap" style={{ gap: "0.5rem" }}>
            {CATEGORY_OPTIONS.map((opt) => {
              const active = categories.includes(opt.value);
              return (
                <Button
                  key={opt.value}
                  type="button"
                  size="sm"
                  variant={active ? "primary" : "outline-secondary"}
                  className="mb-2"
                  onClick={() => toggleCategory(opt.value)}
                >
                  {opt.label}
                </Button>
              );
            })}
          </div>
          <small className="text-muted">
            Cliquez pour (dé)sélectionner une ou plusieurs catégories.
          </small>
        </Form.Group>

        <Form.Group controlId="price">
          <Form.Label>
            <b>Price (base)</b>
          </Form.Label>
          <Form.Control
            required
            type="text"
            value={price}
            placeholder="ex. 199,00"
            onChange={(e) => setPrice(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="discountPct">
          <Form.Label>
            <b>Discount % (helper)</b>
          </Form.Label>
          <InputGroup>
            <Form.Control
              type="number"
              step="1"
              min="1"
              max="95"
              value={discountPct}
              placeholder="ex. 22"
              onChange={(e) => setDiscountPct(e.target.value)}
            />
            <InputGroup.Append>
              <Button variant="outline-secondary" onClick={applyPercent}>
                Apply to New price
              </Button>
            </InputGroup.Append>
          </InputGroup>
          <small className="text-muted">
            Calculé à partir du <b>Base price</b>.
          </small>
        </Form.Group>

        <Form.Group controlId="new_price">
          <Form.Label>
            <b>New price (promotion)</b>
          </Form.Label>
          <Form.Control
            type="text"
            value={newPrice}
            placeholder="ex. 155,00 (vide = pas de promo)"
            onChange={(e) => setNewPrice(e.target.value)}
          />
        </Form.Group>

        <div className="d-flex align-items-center mb-3">
          <Form.Label className="mb-0">In Stock</Form.Label>
          <Form.Check
            className="ml-2"
            type="checkbox"
            checked={stock}
            onChange={() => setStock(!stock)}
          />
        </div>

        {/* ⭐ Produit favori */}
        <div className="d-flex align-items-center mb-3">
          <Form.Label className="mb-0">Produit favori (homepage)</Form.Label>
          <Form.Check
            className="ml-2"
            type="checkbox"
            checked={isFavorite}
            onChange={() => setIsFavorite(!isFavorite)}
          />
        </div>

        <Form.Group controlId="image">
          <Form.Label>
            <b>Product Image</b>
          </Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => setImage(e.target.files[0])}
          />
        </Form.Group>

        <Form.Group>
          <Form.Label>
            <b>Sizes / Variants (optional)</b>
          </Form.Label>
          {variants.map((row, i) => (
            <div
              key={i}
              className="d-flex align-items-center mb-2"
              style={{ gap: 8 }}
            >
              <Form.Control
                style={{ maxWidth: 240 }}
                placeholder="Label (e.g. 500 ml)"
                value={row.label}
                onChange={(e) =>
                  changeVariant(i, "label", e.target.value)
                }
              />
              <Form.Control
                type="text"
                style={{ maxWidth: 120 }}
                placeholder="Size ml (opt.)"
                value={row.size_ml}
                onChange={(e) =>
                  changeVariant(i, "size_ml", e.target.value)
                }
              />
              <Form.Control
                type="text"
                style={{ maxWidth: 140 }}
                placeholder="Price"
                value={row.price}
                onChange={(e) =>
                  changeVariant(i, "price", e.target.value)
                }
              />
              <Form.Check
                className="ml-2"
                label="In stock"
                checked={row.in_stock}
                onChange={(e) =>
                  changeVariant(i, "in_stock", e.target.checked)
                }
              />
              <Form.Control
                style={{ maxWidth: 140 }}
                placeholder="SKU (opt.)"
                value={row.sku}
                onChange={(e) =>
                  changeVariant(i, "sku", e.target.value)
                }
              />
              <Button
                variant="outline-danger"
                size="sm"
                className="ml-2"
                onClick={() => removeVariantRow(i)}
              >
                Remove
              </Button>
            </div>
          ))}
          <Button
            variant="outline-secondary"
            size="sm"
            className="mt-2"
            onClick={addVariantRow}
          >
            + Add size
          </Button>
        </Form.Group>

        <Button
          type="submit"
          variant="success"
          className="btn-sm button-focus-css"
        >
          Save Product
        </Button>
        <Button
          type="button"
          variant="primary"
          className="btn-sm ml-2 button-focus-css"
          onClick={() => history.push("/")}
        >
          Cancel
        </Button>
      </Form>
    </div>
  );
}
