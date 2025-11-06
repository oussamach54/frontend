// src/pages/ProductCreatePage.js
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Form, Button } from "react-bootstrap";
import { useHistory } from "react-router";
import { createProduct } from "../actions/productActions";
import { checkTokenValidation, logout } from "../actions/userActions";
import { CREATE_PRODUCT_RESET } from "../constants";
import Message from "../components/Message";

export default function ProductCreatePage() {
  const history = useHistory();
  const dispatch = useDispatch();

  // Base fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState(false);
  const [image, setImage] = useState(null);

  // Extra
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState("other");

  // Variants
  const [variants, setVariants] = useState([
    { label: "", size_ml: "", price: "", in_stock: true, sku: "" },
  ]);

  const addVariantRow = () =>
    setVariants((v) => [...v, { label: "", size_ml: "", price: "", in_stock: true, sku: "" }]);

  const removeVariantRow = (idx) =>
    setVariants((v) => v.filter((_, i) => i !== idx));

  const changeVariant = (idx, field, value) =>
    setVariants((v) => v.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));

  // store
  const { userInfo } = useSelector((s) => s.userLoginReducer || {});
  const { product, error } = useSelector((s) => s.createProductReducer || {});
  const { error: tokenError } = useSelector((s) => s.checkTokenValidationReducer || {});

  useEffect(() => {
    if (!userInfo) {
      history.push("/login");
      return;
    }
    dispatch(checkTokenValidation());
  }, [dispatch, userInfo, history]);

  const onSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", name);
    fd.append("description", description);
    fd.append("price", String(price).replace(",", "."));
    fd.append("stock", stock);
    if (image) fd.append("image", image);
    fd.append("brand", brand);
    fd.append("category", category);

    const clean = variants
      .filter((v) => v.label && String(v.price) !== "")
      .map((v) => ({
        label: v.label,
        size_ml: v.size_ml === "" ? null : Number(String(v.size_ml).replace(",", ".")),
        price: Number(String(v.price).replace(",", ".")),
        in_stock: !!v.in_stock,
        sku: v.sku || "",
      }));

    if (clean.length) fd.append("variants", JSON.stringify(clean));

    try {
      const created = await dispatch(createProduct(fd));
      alert("Product successfully created.");
      const id = created?.id || product?.id;
      if (id) history.push(`/product/${id}/`);
      dispatch({ type: CREATE_PRODUCT_RESET });
    } catch (e2) {
      console.error(e2);
    }
  };

  if (userInfo && tokenError === "Unauthorized") {
    alert("Session expired, please login again.");
    dispatch(logout());
    history.push("/login");
    window.location.reload();
  }

  return (
    <div className="container py-4">
      {error && (
        <Message variant="danger">
          {error.image ? error.image[0] : String(error)}
        </Message>
      )}

      <span className="d-flex justify-content-center text-info mb-3">
        <em>New Product</em>
      </span>

      <Form onSubmit={onSubmit}>
        <Form.Group controlId="name">
          <Form.Label><b>Product Name</b></Form.Label>
          <Form.Control
            required
            autoFocus
            value={name}
            placeholder="product name"
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="description">
          <Form.Label><b>Product Description</b></Form.Label>
          <Form.Control
            required
            value={description}
            placeholder="product description"
            onChange={(e) => setDescription(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="brand">
          <Form.Label><b>Brand (Marque)</b></Form.Label>
          <Form.Control
            value={brand}
            placeholder="Ex. The Ordinary"
            onChange={(e) => setBrand(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="category">
          <Form.Label><b>Category</b></Form.Label>
          <Form.Control
            as="select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="face">Face</option>
            <option value="lips">Lips</option>
            <option value="eyes">Eyes</option>
            <option value="eyebrow">Eyebrow</option>
            <option value="hair">Hair</option>
            <option value="other">Other</option>
          </Form.Control>
        </Form.Group>

        <Form.Group controlId="price">
          <Form.Label><b>Price (base)</b></Form.Label>
          <Form.Control
            required
            type="number"
            step="0.01"
            value={price}
            placeholder="199.99"
            onChange={(e) => setPrice(e.target.value)}
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

        <Form.Group controlId="image">
          <Form.Label><b>Product Image</b></Form.Label>
          <Form.Control type="file" onChange={(e) => setImage(e.target.files[0])} />
        </Form.Group>

        <Form.Group>
          <Form.Label><b>Sizes / Variants (optional)</b></Form.Label>

          {variants.map((row, i) => (
            <div key={i} className="d-flex align-items-center mb-2" style={{ gap: 8 }}>
              <Form.Control
                style={{ maxWidth: 240 }}
                placeholder="Label (e.g. 500 ml)"
                value={row.label}
                onChange={(e) => changeVariant(i, "label", e.target.value)}
              />
              <Form.Control
                type="number"
                style={{ maxWidth: 120 }}
                placeholder="Size ml (opt.)"
                value={row.size_ml}
                onChange={(e) => changeVariant(i, "size_ml", e.target.value)}
              />
              <Form.Control
                type="number"
                step="0.01"
                style={{ maxWidth: 140 }}
                placeholder="Price"
                value={row.price}
                onChange={(e) => changeVariant(i, "price", e.target.value)}
              />
              <Form.Check
                className="ml-2"
                label="In stock"
                checked={row.in_stock}
                onChange={(e) => changeVariant(i, "in_stock", e.target.checked)}
              />
              <Form.Control
                style={{ maxWidth: 140 }}
                placeholder="SKU (opt.)"
                value={row.sku}
                onChange={(e) => changeVariant(i, "sku", e.target.value)}
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

          <Button variant="outline-secondary" size="sm" className="mt-2" onClick={addVariantRow}>
            + Add size
          </Button>
        </Form.Group>

        <Button type="submit" variant="success" className="btn-sm button-focus-css">
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
