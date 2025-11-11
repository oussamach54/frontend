import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button } from "react-bootstrap";
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
  { value: "hair", label: "Hair" },
  { value: "body", label: "Corps" },
  { value: "packs", label: "Packs" },
  { value: "acne", label: "Acné" },
  { value: "hyper_pigmentation", label: "Hyper pigmentation" },
  { value: "brightening", label: "Éclaircissement" },
  { value: "dry_skin", label: "Peau sèche" },
  { value: "combination_oily", label: "Peau mixte/grasse" },
  { value: "other", label: "Other" },
];

export default function ProductCreatePage() {
  const history = useHistory();
  const dispatch = useDispatch();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState(false);
  const [image, setImage] = useState(null);

  const [brand, setBrand] = useState("");
  const [categories, setCategories] = useState(["other"]); // multi

  const [variants, setVariants] = useState([
    { label: "", size_ml: "", price: "", in_stock: true, sku: "" },
  ]);

  const addVariantRow = () =>
    setVariants((v) => [...v, { label: "", size_ml: "", price: "", in_stock: true, sku: "" }]);
  const removeVariantRow = (idx) => setVariants((v) => v.filter((_, i) => i !== idx));
  const changeVariant = (idx, field, value) =>
    setVariants((v) => v.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));

  const { userInfo } = useSelector((s) => s.userLoginReducer || {});
  const { product, success, error } = useSelector((s) => s.createProductReducer || {});
  const { error: tokenError } = useSelector((s) => s.checkTokenValidationReducer || {});

  useEffect(() => {
    if (!userInfo) { history.push("/login"); return; }
    dispatch(checkTokenValidation());
  }, [dispatch, userInfo, history]);

  const onSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description);
    fd.append("price", price);
    fd.append("stock", stock ? "true" : "false");
    if (image) fd.append("image", image);
    fd.append("brand", brand);
    // send both for compatibility
    fd.append("category", categories[0] || "other");
    fd.append("categories", JSON.stringify(categories));

    const clean = variants
      .filter((v) => v.label && String(v.price) !== "")
      .map((v) => ({
        label: v.label,
        size_ml: v.size_ml === "" ? null : Number(v.size_ml),
        price: Number(v.price),
        in_stock: !!v.in_stock,
        sku: v.sku || "",
      }));
    if (clean.length) fd.append("variants", JSON.stringify(clean));

    dispatch(createProduct(fd));
  };

  useEffect(() => {
    if (!success) return;
    const newId = product?.id ?? product?.product?.id ?? product?.product_id ?? null;
    if (newId) history.replace(`/product/${newId}/`);
    else history.replace("/products");
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

  const onChangeCategories = (e) => {
    const values = Array.from(e.target.selectedOptions).map((o) => o.value);
    setCategories(values.length ? values : ["other"]);
  };

  return (
    <div>
      {error && <Message variant="danger">{error.image ? error.image[0] : String(error)}</Message>}

      <span className="d-flex justify-content-center text-info"><em>New Product</em></span>

      <Form onSubmit={onSubmit}>
        <Form.Group controlId="name">
          <Form.Label><b>Product Name</b></Form.Label>
          <Form.Control required autoFocus value={name} placeholder="product name" onChange={(e) => setName(e.target.value)} />
        </Form.Group>

        <Form.Group controlId="description">
          <Form.Label><b>Product Description</b></Form.Label>
          <Form.Control required value={description} placeholder="product description" onChange={(e) => setDescription(e.target.value)} />
        </Form.Group>

        <Form.Group controlId="brand">
          <Form.Label><b>Brand (Marque)</b></Form.Label>
          <Form.Control value={brand} placeholder="Ex. The Ordinary" onChange={(e) => setBrand(e.target.value)} />
        </Form.Group>

        {/* MULTI CATEGORIES */}
        <Form.Group controlId="categories">
          <Form.Label><b>Categories (select one or more)</b></Form.Label>
          <Form.Control as="select" multiple value={categories} onChange={onChangeCategories} style={{ minHeight: 160 }}>
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Form.Control>
          <small className="text-muted">The first selection will be used as the primary category.</small>
        </Form.Group>

        <Form.Group controlId="price">
          <Form.Label><b>Price (base)</b></Form.Label>
          <Form.Control required type="number" step="0.01" maxLength="8" value={price} placeholder="199.99" onChange={(e) => setPrice(e.target.value)} />
        </Form.Group>

        <div className="d-flex align-items-center mb-3">
          <Form.Label className="mb-0">In Stock</Form.Label>
          <Form.Check className="ml-2" type="checkbox" checked={stock} onChange={() => setStock(!stock)} />
        </div>

        <Form.Group controlId="image">
          <Form.Label><b>Product Image</b></Form.Label>
          <Form.Control type="file" onChange={(e) => setImage(e.target.files[0])} />
        </Form.Group>

        <Form.Group>
          <Form.Label><b>Sizes / Variants (optional)</b></Form.Label>
          {variants.map((row, i) => (
            <div key={i} className="d-flex align-items-center mb-2" style={{ gap: 8 }}>
              <Form.Control style={{ maxWidth: 240 }} placeholder="Label (e.g. 500 ml)" value={row.label} onChange={(e) => changeVariant(i, "label", e.target.value)} />
              <Form.Control type="number" style={{ maxWidth: 120 }} placeholder="Size ml (opt.)" value={row.size_ml} onChange={(e) => changeVariant(i, "size_ml", e.target.value)} />
              <Form.Control type="number" step="0.01" style={{ maxWidth: 140 }} placeholder="Price" value={row.price} onChange={(e) => changeVariant(i, "price", e.target.value)} />
              <Form.Check className="ml-2" label="In stock" checked={row.in_stock} onChange={(e) => changeVariant(i, "in_stock", e.target.checked)} />
              <Form.Control style={{ maxWidth: 140 }} placeholder="SKU (opt.)" value={row.sku} onChange={(e) => changeVariant(i, "sku", e.target.value)} />
              <Button variant="outline-danger" size="sm" className="ml-2" onClick={() => removeVariantRow(i)}>Remove</Button>
            </div>
          ))}
          <Button variant="outline-secondary" size="sm" className="mt-2" onClick={addVariantRow}>+ Add size</Button>
        </Form.Group>

        <Button type="submit" variant="success" className="btn-sm button-focus-css">Save Product</Button>
        <Button type="button" variant="primary" className="btn-sm ml-2 button-focus-css" onClick={() => history.push("/")}>Cancel</Button>
      </Form>
    </div>
  );
}
