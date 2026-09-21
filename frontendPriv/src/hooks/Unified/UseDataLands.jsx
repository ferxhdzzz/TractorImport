import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const API_URL = "https://tractorimport.onrender.com/api/lands";

export const useDataLand = () => {
  const [lands, setLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState(null);
  const [loading, setLoading] = useState(false);

  // Obtener todos los terrenos
  const fetchLands = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al obtener el historial de terrenos");

      const data = await res.json();
      setLands(data);
    } catch (error) {
      console.error("Error en fetchLands:", error);
      Swal.fire({
        icon: "error",
        title: "Error al obtener terrenos",
        text: error.message || "Error desconocido al conectar con el servidor",
        confirmButtonColor: "#be185d",
      });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un registro de terreno
  const deleteLand = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al eliminar el terreno");

      Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: "El registro del terreno se eliminó correctamente.",
        confirmButtonColor: "#be185d",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchLands();
    } catch (error) {
      console.error("Error en deleteLand:", error);
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: error.message || "Error desconocido",
        confirmButtonColor: "#be185d",
      });
    }
  };

  // Actualizar un terreno existente (envío JSON)
  const updateLand = async (id, updatedData) => {
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
        throw new Error(errorData.message || "Error al actualizar el terreno");
      }

      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: "La información del terreno se actualizó correctamente.",
        confirmButtonColor: "#be185d",
      });

      fetchLands();
    } catch (error) {
      console.error("Error en updateLand:", error);
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: error.message || "Error desconocido",
        confirmButtonColor: "#be185d",
      });
    }
  };

  // Registrar un nuevo terreno / venta (envío JSON)
  const createLand = async (landData) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(landData),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al registrar el terreno");
      }

      Swal.fire({
        icon: "success",
        title: "Terreno registrado",
        text: "La venta o promesa de venta se agregó correctamente.",
        confirmButtonColor: "#be185d",
      });

      fetchLands();
    } catch (error) {
      console.error("Error en createLand:", error);
      Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text: error.message || "Error desconocido",
        confirmButtonColor: "#be185d",
      });
    }
  };

  useEffect(() => {
    fetchLands();
  }, []);

  return {
    lands,
    selectedLand,
    loading,
    setSelectedLand,
    createLand,
    updateLand,
    deleteLand,
    fetchLands,
  };
};