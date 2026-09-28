import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./AddLandModal.css"; // Utiliza la misma línea gráfica de modales

const EditArticuloVarios = ({ articuloId, onClose, refreshArticulos }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombreArticulo: "",
    precioUnitario: "",
    impuestos: "",
    transporte: "",
    precioFinal: "",
  });

  // Formatear números para mostrar con comas (Ej. 13500 -> "13,500.00")
  const formatNumberWithCommas = (val) => {
    if (val === undefined || val === null || val === "") return "";
    const clean = String(val).replace(/,/g, "");
    const parts = clean.split(".");
    let integerPart = parts[0];
    const decimalPart = parts[1];

    if (integerPart) {
      integerPart = Number(integerPart).toLocaleString("en-US");
    }

    return decimalPart !== undefined
      ? `${integerPart}.${decimalPart.slice(0, 2)}`
      : integerPart;
  };

  // Convertir string formateado ("13,000.50") a número puro (13000.5)
  const convertToNumber = (value) => {
    if (value === undefined || value === null || value === "") return 0;
    return Number(String(value).replace(/,/g, "")) || 0;
  };

  // ==============================
  // CARGAR EL REGISTRO A EDITAR
  // ==============================
  useEffect(() => {
    const loadArticulo = async () => {
      try {
        const res = await fetch(
          `https://tractorimport.onrender.com/api/articulos-varios/${articuloId}`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error("No se pudo cargar el artículo");
        const data = await res.json();

        setFormData({
          nombreArticulo: data.nombreArticulo || "",
          precioUnitario: formatNumberWithCommas(data.precioUnitario),
          impuestos: formatNumberWithCommas(data.impuestos),
          transporte: formatNumberWithCommas(data.transporte),
          precioFinal: formatNumberWithCommas(data.precioFinal),
        });
      } catch (err) {
        console.error("Error al cargar artículo:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo obtener la información del artículo.",
          confirmButtonColor: "#be185d",
        });
      }
    };

    if (articuloId) {
      loadArticulo();
    }
  }, [articuloId]);

  // Manejador de texto plano (Nombre)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Manejador numérico con comas en tiempo real (Edición Libre)
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;

    // Permitir borrar completamente
    if (value === "") {
      setFormData((prev) => ({ ...prev, [name]: "" }));
      return;
    }

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

  // ==============================
  // ENVIAR ACTUALIZACIÓN (PUT)
  // ==============================
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
      const res = await fetch(
        `https://tractorimport.onrender.com/api/articulos-varios/${articuloId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      const resJson = await res.json();

      if (!res.ok) {
        throw new Error(
          resJson.message || resJson.error || "Error al actualizar el artículo"
        );
      }

      if (typeof refreshArticulos === "function") {
        await refreshArticulos();
      }

      setLoading(false);

      await Swal.fire({
        icon: "success",
        title: "Artículo Actualizado",
        text: "Los cambios se guardaron correctamente.",
        confirmButtonColor: "#be185d",
      });

      onClose();
    } catch (err) {
      setLoading(false);
      console.error("Error al actualizar artículo:", err);
      Swal.fire({
        icon: "error",
        title: "Error al Actualizar",
        text: err.message,
        confirmButtonColor: "#be185d",
      });
    }
  };

  return (
    <div className="land-modal-overlay" onClick={onClose}>
      <div className="land-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="land-modal-header">
          <h2 className="land-modal-title">Editar Artículo Varios</h2>
          <button type="button" className="land-modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="land-form-grid">
            {/* Nombre del Artículo */}
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

            {/* Precio Final (Totalmente Libre) */}
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

          {/* Botones del Modal */}
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
              {loading ? "Actualizando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditArticuloVarios;