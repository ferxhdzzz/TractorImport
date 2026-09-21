import React, { useState, useEffect } from "react";
import EditProduct from "./EditProduct";

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [editProductId, setEditProductId] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchProducts = async () => {
    try {
      const res = await fetch("http://localhost:4000/api/products", {
        credentials: "include", // ← incluye cookies de sesión
      });
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error("Error cargando productos:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const refreshProducts = async () => {
    await fetchProducts();
  };

  const handleEdit = (id) => {
    setEditProductId(id);
    setShowEditModal(true);
  };

  const closeModal = () => {
    setShowEditModal(false);
    setEditProductId(null);
  };

  return (
    <div>
      <h2>Productos</h2>
      <ul>
        {products.map(p => (
          <li key={p._id}>
            {p.name} - ${p.price}{" "}
            <button onClick={() => handleEdit(p._id)}>Editar</button>
          </li>
        ))}
      </ul>

      {showEditModal && (
        <EditProduct
          productId={editProductId}
          onClose={closeModal}
          refreshProducts={refreshProducts}
        />
      )}
    </div>
  );
};

export default ProductsManager;
