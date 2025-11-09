import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { resolveImageURL } from "../utils/media";

function Product({ product = {} }) {
  const id = product.id ?? product._id;
  if (!id) return null;

  const img = resolveImageURL(product.image_url || product.image || product.thumbnail);

  return (
    <Card className="mb-4 rounded">
      <Link to={`/product/${id}`}>
        <Card.Img variant="top" src={img} height="162" />
      </Link>

      <Card.Body>
        <Link to={`/product/${id}`}>
          <Card.Title as="div">
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as="h3">MAD {Number(product.price || 0)}</Card.Text>
      </Card.Body>
    </Card>
  );
}

export default Product;
