import { useState, useEffect } from "react";
import Swal from "sweetalert2";

const API_URL = "https://tractorimport.onrender.com/api/gastos";

export const useDataGasto = () => {
  const [gastos, setGastos] = useState([]);
  const [selectedGasto, setSelectedGasto] = useState(null);
  const [loading, setLoading] = useState(false);

  // Obtener todos los gastos
  const fetchGastos = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al obtener el historial de gastos");

      const data = await res.json();
      setGastos(data);
    } catch (error) {
      console.error("Error en fetchGastos:", error);
      Swal.fire({
        icon: "error",
        title: "Error al obtener gastos",
        text: error.message || "Error desconocido al conectar con el servidor",
        confirmButtonColor: "#be185d",
      });
    } finally {
      setLoading(false);
    }
  };

  // Eliminar un registro de gasto
  const deleteGasto = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error al eliminar el gasto");

      Swal.fire({
        icon: "success",
        title: "Eliminado",
        text: "El registro de gasto se eliminó correctamente.",
        confirmButtonColor: "#be185d",
        timer: 1500,
        showConfirmButton: false,
      });

      fetchGastos();
    } catch (error) {
      console.error("Error en deleteGasto:", error);
      Swal.fire({
        icon: "error",
        title: "Error al eliminar",
        text: error.message || "Error desconocido",
        confirmButtonColor: "#be185d",
      });
    }
  };

  // Actualizar un gasto existente
  const updateGasto = async (id, updatedData) => {
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
        throw new Error(errorData.message || "Error al actualizar el gasto");
      }

      Swal.fire({
        icon: "success",
        title: "Actualizado",
        text: "La información del gasto se actualizó correctamente.",
        confirmButtonColor: "#be185d",
      });

      fetchGastos();
    } catch (error) {
      console.error("Error en updateGasto:", error);
      Swal.fire({
        icon: "error",
        title: "Error al actualizar",
        text: error.message || "Error desconocido",
        confirmButtonColor: "#be185d",
      });
    }
  };

  // Registrar un nuevo gasto
  const createGasto = async (gastoData) => {
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(gastoData),
        credentials: "include",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Error al registrar el gasto");
      }

      Swal.fire({
        icon: "success",
        title: "Gasto registrado",
        text: "El registro de gasto se agregó correctamente.",
        confirmButtonColor: "#be185d",
      });

      fetchGastos();
    } catch (error) {
      console.error("Error en createGasto:", error);
      Swal.fire({
        icon: "error",
        title: "Error al registrar",
        text: error.message || "Error desconocido",
        confirmButtonColor: "#be185d",
      });
    }
  };

  useEffect(() => {
    fetchGastos();
  }, []);

  return {
    gastos,
    selectedGasto,
    loading,
    setSelectedGasto,
    createGasto,
    updateGasto,
    deleteGasto,
    fetchGastos,
  };
};