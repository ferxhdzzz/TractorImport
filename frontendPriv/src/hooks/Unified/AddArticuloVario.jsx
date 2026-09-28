import React, { useState } from "react";
import Swal from "sweetalert2";
import "./AddLandModal.css"; // Mantiene los mismos estilos estéticos del proyecto

const AddArticuloVariosModal = ({ onClose, refreshArticulos }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombreArticulo: "",
    precioUnitario: "",
    impuestos: "",
    transporte: "",
    precioFinal: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Formatear campos numéricos con comas en tiempo real
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;

    // Permitir borrar todo el texto si el usuario quiere dejarlo vacío
    if (value === "") {
      setFormData((prev) => ({ ...prev, [name]: "" }));
      return;
    }

    // Permitir únicamente números, comas y punto decimal
    let cleanValue = value.replace(/[^\d.,]/g, "").replace(/,/g, "");

    const parts = cleanValue.split(".");
    let integerPart = parts[0];
    const decimalPart = parts[1];

    if (integerPart) {
      integerPart = Number(integerPart).toLocaleString("en-US");
    }

    const formattedValue =
      decimalPart !== undefined
        ? `${integerPart}.${decimalPart.slice(0, 2)}`
        : integerPart;

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  // Convertir string formateado ("13,000.50") a número puro (13000.5)
  const convertToNumber = (value) => {
    if (value === undefined || value === null || value === "") return 0;
    return Number(String(value).replace(/,/g, "")) || 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      nombreArticulo: formData.nombreArticulo ? formData.nombreArticulo.trim() : "",
      precioUnitario: convertToNumber(formData.precioUnitario),
      impuestos: convertToNumber(formData.impuestos),
      transporte: convertToNumber(formData.transporte),
      precioFinal: convertToNumber(formData.precioFinal),
    };

    try {
      const res = await fetch("https://tractorimport.onrender.com/api/articulos-varios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();

      if (!res.ok) {
        throw new Error(
          resJson.message || resJson.error || "Error al registrar el artículo"
        );
      }

      if (typeof refreshArticulos === "function") {
        await refreshArticulos();
      }

      setLoading(false);

      await Swal.fire({
        icon: "success",
        title: "Artículo Guardado",
        text: "El registro de artículo se guardó correctamente.",
        confirmButtonColor: "#be185d",
      });

      onClose();
    } catch (err) {
      setLoading(false);
      console.error("Error al guardar artículo:", err);
      Swal.fire({
        icon: "error",
        title: "Error al Guardar",
        text: err.message,
        confirmButtonColor: "#be185d",
      });
    }
  };

  return (
    <div className="land-modal-overlay" onClick={onClose}>
      <div className="land-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="land-modal-header">
          <h2 className="land-modal-title">Registrar Nuevo Artículo Varios</h2>
          <button type="button" className="land-modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="land-form-grid">
            {/* Nombre del Artículo (Opcional) */}
            <div className="land-field-group full-width">
              <label>Nombre del Artículo</label>
              <input
                type="text"
                name="nombreArticulo"
                value={formData.nombreArticulo}
                onChange={handleChange}
                placeholder="Ej: Repuestos o Lote Varios"
                className="land-input-field"
              />
            </div>

            {/* Precio Unitario */}
            <div className="land-field-group">
              <label>Precio Unitario ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="precioUnitario"
                value={formData.precioUnitario}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Impuestos */}
            <div className="land-field-group">
              <label>Impuestos ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="impuestos"
                value={formData.impuestos}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Transporte */}
            <div className="land-field-group">
              <label>Transporte ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="transporte"
                value={formData.transporte}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Precio Final (Editable Libremente) */}
            <div className="land-field-group">
              <label>Precio Final ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="precioFinal"
                value={formData.precioFinal}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="land-modal-actions">
            <button
              type="button"
              className="land-btn-cancel"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="land-btn-submit"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar Artículo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddArticuloVariosModal;