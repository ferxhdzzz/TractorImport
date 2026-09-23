import React, { useState, useRef } from "react";
import Swal from "sweetalert2";
import "./AddLandModal.css"; // Utiliza los mismos estilos estéticos de tus modales

const AddGastoModal = ({ onClose, refreshGastos }) => {
  const [loading, setLoading] = useState(false);
  const fechaGastoRef = useRef(null);

  const [formData, setFormData] = useState({
    tipoPeriodo: "Dias",
    cantidadPeriodo: "1",
    costoPeriodo: "",
    combustible: "",
    pasajeTerrestre: "",
    pasajeAereo: "",
    pasajeMaritimo: "",
    alquilerTransporte: "",
    hospedaje: "",
    observaciones: "",
    fechaGasto: new Date().toISOString().split("T")[0],
  });

  const handleOpenPicker = () => {
    if (fechaGastoRef.current) {
      if (typeof fechaGastoRef.current.showPicker === "function") {
        fechaGastoRef.current.showPicker();
      } else {
        fechaGastoRef.current.focus();
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Cambiar entre "Dias" u "Horas"
  const handlePeriodoTypeChange = (tipo) => {
    setFormData((prev) => ({
      ...prev,
      tipoPeriodo: tipo,
    }));
  };

  // Formatear campos numéricos con comas en tiempo real
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;

    // Permitir únicamente números, comas y punto decimal
    let cleanValue = value.replace(/[^\d.,]/g, "").replace(/,/g, "");

    // Separar parte entera y decimal
    const parts = cleanValue.split(".");

    let integerPart = parts[0];
    const decimalPart = parts[1];

    // Formatear la parte entera con comas
    if (integerPart) {
      integerPart = Number(integerPart).toLocaleString("en-US");
    }

    // Reconstruir el valor conservando los decimales
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
    return Number(String(value).replace(/,/g, "")) || 0;
  };

  // Evitar desfase de 1 día en zona horaria / UTC
  const formatLocalDate = (dateString) => {
    if (!dateString) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(`${dateString}T12:00:00`).toISOString();
    }
    return new Date(dateString).toISOString();
  };

  // Cálculo Dinámico en Tiempo Real del Total de Gastos
  const totalCalculado =
    convertToNumber(formData.costoPeriodo) +
    convertToNumber(formData.combustible) +
    convertToNumber(formData.pasajeTerrestre) +
    convertToNumber(formData.pasajeAereo) +
    convertToNumber(formData.pasajeMaritimo) +
    convertToNumber(formData.alquilerTransporte) +
    convertToNumber(formData.hospedaje);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      tipoPeriodo: formData.tipoPeriodo,
      cantidadPeriodo: convertToNumber(formData.cantidadPeriodo) || 1,
      costoPeriodo: convertToNumber(formData.costoPeriodo),
      combustible: convertToNumber(formData.combustible),
      pasajes: {
        terrestre: convertToNumber(formData.pasajeTerrestre),
        aereo: convertToNumber(formData.pasajeAereo),
        maritimo: convertToNumber(formData.pasajeMaritimo),
      },
      alquilerTransporte: convertToNumber(formData.alquilerTransporte),
      hospedaje: convertToNumber(formData.hospedaje),
      observaciones: formData.observaciones ? formData.observaciones.trim() : "",
      fechaGasto: formatLocalDate(formData.fechaGasto),
    };

    try {
      const res = await fetch("http://localhost:4000/api/gastos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();

      if (!res.ok) {
        throw new Error(resJson.message || resJson.error || "Error al registrar el gasto");
      }

      if (typeof refreshGastos === "function") {
        await refreshGastos();
      }

      setLoading(false);

      await Swal.fire({
        icon: "success",
        title: "Gasto Guardado",
        text: "El registro de gasto se guardó correctamente.",
        confirmButtonColor: "#be185d",
      });

      onClose();
    } catch (err) {
      setLoading(false);
      console.error("Error al guardar gasto:", err);
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
          <h2 className="land-modal-title">Registrar Nuevo Gasto</h2>
          <button type="button" className="land-modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Toggle para seleccionar Tipo de Período (Días u Horas) */}
        <div className="type-sale-toggle">
          <button
            type="button"
            className={`toggle-btn ${formData.tipoPeriodo === "Dias" ? "active" : ""}`}
            onClick={() => handlePeriodoTypeChange("Dias")}
          >
            Cálculo por Días
          </button>
          <button
            type="button"
            className={`toggle-btn ${formData.tipoPeriodo === "Horas" ? "active" : ""}`}
            onClick={() => handlePeriodoTypeChange("Horas")}
          >
            Cálculo por Horas
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="land-form-grid">
            {/* Cantidad de Días u Horas */}
            <div className="land-field-group">
              <label>Cantidad de {formData.tipoPeriodo} *</label>
              <input
                type="number"
                min="0"
                step="any"
                name="cantidadPeriodo"
                value={formData.cantidadPeriodo}
                onChange={handleChange}
                placeholder={`Ej: ${formData.tipoPeriodo === "Dias" ? "3 días" : "8 horas"}`}
                required
                className="land-input-field"
              />
            </div>

            {/* Costo del Período */}
            <div className="land-field-group">
              <label>Costo de {formData.tipoPeriodo} ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="costoPeriodo"
                value={formData.costoPeriodo}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Fecha del Gasto con Date Picker e Ícono */}
            <div className="land-field-group">
              <label>Fecha del Gasto *</label>
              <div style={{ position: "relative", width: "100%", cursor: "pointer" }}>
                <input
                  ref={fechaGastoRef}
                  type="date"
                  name="fechaGasto"
                  value={formData.fechaGasto}
                  onChange={handleChange}
                  onClick={handleOpenPicker}
                  required
                  className="land-input-field"
                  style={{
                    width: "100%",
                    paddingRight: "40px",
                    boxSizing: "border-box",
                    cursor: "pointer",
                  }}
                />
                <svg
                  onClick={handleOpenPicker}
                  className="calendar-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#1C4024"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                  }}
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
            </div>

            {/* Combustible */}
            <div className="land-field-group">
              <label>Combustible ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="combustible"
                value={formData.combustible}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Pasaje Terrestre */}
            <div className="land-field-group">
              <label>Pasaje Terrestre ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="pasajeTerrestre"
                value={formData.pasajeTerrestre}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Pasaje Aéreo */}
            <div className="land-field-group">
              <label>Pasaje Aéreo ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="pasajeAereo"
                value={formData.pasajeAereo}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Pasaje Marítimo */}
            <div className="land-field-group">
              <label>Pasaje Marítimo ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="pasajeMaritimo"
                value={formData.pasajeMaritimo}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Alquiler de Transporte */}
            <div className="land-field-group">
              <label>Alquiler de Transporte ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="alquilerTransporte"
                value={formData.alquilerTransporte}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Hospedaje */}
            <div className="land-field-group">
              <label>Hospedaje ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="hospedaje"
                value={formData.hospedaje}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Total General Calculado */}
            <div className="land-field-group">
              <label>Total General del Gasto ($)</label>
              <input
                type="text"
                value={`$${totalCalculado.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                readOnly
                className="land-input-field"
                style={{
                  fontWeight: "bold",
                  color: "#059669",
                  fontSize: "1.05rem",
                  backgroundColor: "#f8fafc",
                }}
              />
            </div>

            {/* Observaciones */}
            <div className="land-field-group full-width">
              <label>Observaciones / Detalles</label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Añade notas o justificaciones adicionales de los gastos..."
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
              {loading ? "Guardando..." : "Guardar Gasto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddGastoModal;