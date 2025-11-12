import React, { useState } from "react";
import { useHistory } from "react-router-dom";

function SearchBarForProducts() {
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    const s = searchTerm.trim();
    if (s) {
      // send user to the products page with ?search=
      history.push(`/products?search=${encodeURIComponent(s)}`);
    } else {
      history.push(`/products`);
    }
  };

  return (
    <div>
      <form onSubmit={onSubmit}>
        <span style={{ display: "flex" }}>
          <input
            type="text"
            value={searchTerm}
            placeholder="Rechercher par nom…"
            className="form-control"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="btn btn-primary ml-2 button-focus-css">
            <i className="fas fa-search" />
          </button>
        </span>
      </form>
    </div>
  );
}

export default SearchBarForProducts;

