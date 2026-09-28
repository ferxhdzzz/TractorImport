import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const API_URL = "https://tractorimport.onrender.com/api/articulos-varios";

export const useDataArticuloVarios = () => {
  const [articulos, setArticulos] = useState([]);
  const [selectedArticulo, setSelectedArticulo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Obtener todos los artículos varios
  const fetchArticulos = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al obtener la lista de artículos varios");

      const data = await res.json();
      setArticulos(data);
    } catch (error) {
      console.error("Error en fetchArticulos:", error);
      Swal.fire({
        icon: "error",
        title: "Error al obtener artículos",
        text: error.message || "Error desconocido al conectar con el servidor",
        confirmButtonColor: "#be185d",
      });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un artículo
  const deleteArticulo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al eliminar el artículo");

      Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: "El artículo se eliminó correctamente.",
        confirmButtonColor: "#be185d",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchArticulos();
    } catch (error) {
      console.error("Error en deleteArticulo:", error);
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: error.message || "Error desconocido",
        confirmButtonColor: "#be185d",
      });
    }
  };

  // Actualizar un artículo existente
  const updateArticulo = async (id, updatedData) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al actualizar el artículo");
      }

      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: "La información del artículo se actualizó correctamente.",
        confirmButtonColor: "#be185d",
      });

      fetchArticulos();
    } catch (error) {
      console.error("Error en updateArticulo:", error);
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: error.message || "Error desconocido",
        confirmButtonColor: "#be185d",
      });
    }
  };

  // Registrar un nuevo artículo
  const createArticulo = async (articuloData) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(articuloData),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al registrar el artículo");
      }

      Swal.fire({
        icon: "success",
        title: "Artículo registrado",
        text: "El registro de artículo se agregó correctamente.",
        confirmButtonColor: "#be185d",
      });

      fetchArticulos();
    } catch (error) {
      console.error("Error en createArticulo:", error);
      Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text: error.message || "Error desconocido",
        confirmButtonColor: "#be185d",
      });
    }
  };

  useEffect(() => {
    fetchArticulos();
  }, []);

  return {
    articulos,
    selectedArticulo,
    loading,
    setSelectedArticulo,
    createArticulo,
    updateArticulo,
    deleteArticulo,
    fetchArticulos,
  };
};