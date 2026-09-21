// hooks/UseFetchProduct.jsx
import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:4000/api/products";

const useFetchProduct = () => {
  const [products, setProducts] = useState([]);

  const getProducts = async () => {
    try {
      const { data } = await axios.get(API_URL, {
        withCredentials: true, // ← incluye cookies de sesión
      });
      setProducts(data);
    } catch (error) {
      console.error("Error al obtener productos:", error.message);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return { products, getProducts };
};

export default useFetchProduct;
