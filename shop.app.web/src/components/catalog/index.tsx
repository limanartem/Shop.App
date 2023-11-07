import React from 'react';
import { useLocation } from 'react-router-dom';

function Catalog() {
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const category = params.get('category');

  return (
    <div>
      <h2>Products Page</h2>
      {category && <p>Category: {category}</p>}
      {/* Your product list rendering logic goes here */}
    </div>
  );
}

export default Catalog;
