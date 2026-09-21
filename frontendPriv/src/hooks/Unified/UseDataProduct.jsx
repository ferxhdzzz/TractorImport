import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const API_URL = "http://localhost:4000/api/products";

export const useDataProduct = () => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const fetchProducts = async () => {
    try {
      const res = await fetch(API_URL, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al obtener productos");

      const data = await res.json();
      setProducts(data);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al obtener productos",
        text: error.message || "Error desconocido",
        confirmButtonColor: "#d6336c",
      });
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al eliminar producto");

      Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: "El producto se eliminó correctamente.",
        confirmButtonColor: "#d6336c",
      });

      fetchProducts();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: error.message || "Error desconocido",
        confirmButtonColor: "#d6336c",
      });
    }
  };

  const updateProduct = async (id, updatedData) => {
    try {
      const formData = new FormData();

      for (const key in updatedData) {
        if (key === "images" && Array.isArray(updatedData.images)) {
          updatedData.images.forEach((image) => formData.append("images", image));
        } else {
          formData.append(key, updatedData[key]);
        }
      }

      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al actualizar producto");

      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: "El producto se actualizó correctamente.",
        confirmButtonColor: "#d6336c",
      });

      fetchProducts();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: error.message || "Error desconocido",
        confirmButtonColor: "#d6336c",
      });
    }
  };

  const createProduct = async (productData) => {
    try {
      const formData = new FormData();

      for (const key in productData) {
        if (key === "images" && Array.isArray(productData.images)) {
          productData.images.forEach((image) => formData.append("images", image));
        } else {
          formData.append(key, productData[key]);
        }
      }

      const res = await fetch(API_URL, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al crear producto");

      Swal.fire({
        icon: "success",
        title: "Producto creado",
        text: "El producto se agregó correctamente.",
        confirmButtonColor: "#d6336c",
      });

      fetchProducts();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error al crear producto",
        text: error.message || "Error desconocido",
        confirmButtonColor: "#d6336c",
      });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    selectedProduct,
    setSelectedProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchProducts,
  };
};
