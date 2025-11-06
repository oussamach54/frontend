import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import { imgUrl } from "../utils/media";

function Product({ product }) {
  const imageSrc = imgUrl(product?.image_url || product?.image);

  return (
    <Card className="mb-4 rounded">
      <Link to={`/product/${product.id}/`}>
        <Card.Img variant="top" src={imageSrc} alt={product?.name || "product"} />
      </Link>

      <Card.Body>
        <Link to={`/product/${product.id}/`}>
          <Card.Title as="div">
            <strong>{product.name}</strong>
          </Card.Title>
        </Link>

        <Card.Text as="h3">MAD {Number(product.price || 0).toFixed(2)}</Card.Text>
      </Card.Body>
    </Card>
  );
}

export default Product;
