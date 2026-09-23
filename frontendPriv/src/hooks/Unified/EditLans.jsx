import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import "./AddLandModal.css";

const EditLand = ({ landId, onClose, refreshLands }) => {
  const [loading, setLoading] = useState(false);
  const fechaVentaRef = useRef(null);

  const [formData, setFormData] = useState({
    nombreCliente: "",
    direccion: "",
    telefono: "",
    dimensionTerreno: "",
    costoTerreno: "",
    montoAbonado: "",
    fechaVenta: "",
    tipoVenta: "Contado", // "Contado" o "Promesa"
    numeroCuotas: "",
    montoCuotaMensual: "",
    observaciones: "",
  });

  const handleOpenPicker = () => {
    if (fechaVentaRef.current) {
      if (typeof fechaVentaRef.current.showPicker === "function") {
        fechaVentaRef.current.showPicker();
      } else {
        fechaVentaRef.current.focus();
      }
    }
  };

  // Formatear números para mostrar con comas desde la carga inicial
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

  // ==============================
  // 1. CARGAR REGISTRO DE TERRENO POR ID
  // ==============================
  useEffect(() => {
    const loadLand = async () => {
      if (!landId) return;

      try {
        const res = await fetch(`https://tractorimport.onrender.com/api/lands/${landId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "No se pudo cargar la información del terreno");
        }

        const data = await res.json();

        // Formatear la fecha a YYYY-MM-DD para el input date
        const formattedDate = data.fechaVenta
          ? new Date(data.fechaVenta).toISOString().split("T")[0]
          : "";

        setFormData({
          nombreCliente: data.nombreCliente || "",
          direccion: data.direccion || "",
          telefono: data.telefono || "",
          dimensionTerreno: data.dimensionTerreno || "",
          costoTerreno: formatNumberWithCommas(data.costoTerreno),
          montoAbonado: formatNumberWithCommas(data.montoAbonado),
          fechaVenta: formattedDate,
          tipoVenta: data.tipoVenta || "Contado",
          numeroCuotas: data.numeroCuotas ?? "",
          montoCuotaMensual: formatNumberWithCommas(data.montoCuotaMensual),
          observaciones: data.observaciones || "",
        });
      } catch (err) {
        console.error("Error al cargar terreno:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "No se pudo obtener el terreno",
          confirmButtonColor: "#be185d",
        });
      }
    };

    loadLand();
  }, [landId]);

  // ==============================
  // MANEJO DE CAMPOS E INPUTS
  // ==============================
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

  const handleTypeChange = (tipo) => {
    setFormData((prev) => ({
      ...prev,
      tipoVenta: tipo,
      ...(tipo === "Contado" && { numeroCuotas: "", montoCuotaMensual: "" }),
    }));
  };

  // Cálculo automático del saldo remanente
  const costo = convertToNumber(formData.costoTerreno);
  const abonado = convertToNumber(formData.montoAbonado);
  const saldoRemanenteCalculado = Math.max(0, costo - abonado);

  // ==============================
  // ENVIAR ACTUALIZACIÓN (PUT)
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const esPromesa = formData.tipoVenta === "Promesa";

    const numCosto = convertToNumber(formData.costoTerreno);
    const numAbonado = convertToNumber(formData.montoAbonado);
    const numCuotas = parseInt(formData.numeroCuotas, 10);
    const numMontoCuota = convertToNumber(formData.montoCuotaMensual);

    const payload = {
      nombreCliente: formData.nombreCliente.trim(),
      direccion: formData.direccion.trim(),
      telefono: formData.telefono.trim(),
      dimensionTerreno: formData.dimensionTerreno.trim(),
      costoTerreno: numCosto,
      montoAbonado: numAbonado,
      fechaVenta: formatLocalDate(formData.fechaVenta),
      tipoVenta: formData.tipoVenta,
      numeroCuotas: esPromesa && !isNaN(numCuotas) ? numCuotas : null,
      montoCuotaMensual: esPromesa ? numMontoCuota : null,
      observaciones: formData.observaciones ? formData.observaciones.trim() : "",
    };

    try {
      const res = await fetch(`https://tractorimport.onrender.com/api/lands/${landId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();

      if (!res.ok) {
        throw new Error(resJson.message || "Error al actualizar el terreno");
      }

      if (typeof refreshLands === "function") {
        await refreshLands();
      }

      setLoading(false);

      await Swal.fire({
        icon: "success",
        title: "Terreno Actualizado",
        text: "Los datos del terreno fueron modificados correctamente.",
        confirmButtonColor: "#be185d",
      });

      onClose();
    } catch (err) {
      setLoading(false);
      console.error("Error al actualizar terreno:", err);
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
          <h2 className="land-modal-title">Editar Registro de Terreno</h2>
          <button type="button" className="land-modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Toggle para Venta al Contado / Promesa */}
        <div className="type-sale-toggle">
          <button
            type="button"
            className={`toggle-btn ${formData.tipoVenta === "Contado" ? "active" : ""}`}
            onClick={() => handleTypeChange("Contado")}
          >
            Venta al Contado
          </button>
          <button
            type="button"
            className={`toggle-btn ${formData.tipoVenta === "Promesa" ? "active" : ""}`}
            onClick={() => handleTypeChange("Promesa")}
          >
            Promesa de Venta
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="land-form-grid">
            {/* Nombre del Cliente */}
            <div className="land-field-group">
              <label>Nombre del Cliente *</label>
              <input
                type="text"
                name="nombreCliente"
                value={formData.nombreCliente}
                onChange={handleChange}
                placeholder="Ej: Carlos Alberto Mendoza"
                required
                className="land-input-field"
              />
            </div>

            {/* Teléfono */}
            <div className="land-field-group">
              <label>Teléfono de Contacto *</label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej: 7890-1234"
                required
                className="land-input-field"
              />
            </div>

            {/* Dirección */}
            <div className="land-field-group full-width">
              <label>Dirección del Terreno *</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Ej: Lote 12, Polígono B, Cantón El Carmen"
                required
                className="land-input-field"
              />
            </div>

            {/* Dimensión del Terreno */}
            <div className="land-field-group">
              <label>Dimensión del Terreno *</label>
              <input
                type="text"
                name="dimensionTerreno"
                value={formData.dimensionTerreno}
                onChange={handleChange}
                placeholder="Ej: 200 m² / 10x20 varas"
                required
                className="land-input-field"
              />
            </div>

            {/* Fecha de Venta */}
            <div className="land-field-group">
              <label>Fecha de Venta / Promesa *</label>
              <div style={{ position: "relative", width: "100%", cursor: "pointer" }}>
                <input
                  ref={fechaVentaRef}
                  type="date"
                  name="fechaVenta"
                  value={formData.fechaVenta}
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

            {/* Costo del Terreno */}
            <div className="land-field-group">
              <label>Costo del Terreno ($) *</label>
              <input
                type="text"
                inputMode="decimal"
                name="costoTerreno"
                value={formData.costoTerreno}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                required
                className="land-input-field"
              />
            </div>

            {/* Monto Abonado */}
            <div className="land-field-group">
              <label>Monto Abonado ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="montoAbonado"
                value={formData.montoAbonado}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Saldo Remanente Calculado */}
            <div className="land-field-group">
              <label>Saldo Remanente Calculado ($)</label>
              <input
                type="text"
                value={`$${saldoRemanenteCalculado.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`}
                readOnly
                className="land-input-field"
                style={{
                  fontWeight: "bold",
                  color: saldoRemanenteCalculado > 0 ? "#dc2626" : "#2563eb",
                }}
              />
            </div>

            {/* Campos condicionales para Promesa de Venta */}
            {formData.tipoVenta === "Promesa" && (
              <>
                <div className="land-field-group">
                  <label>Número de Cuotas *</label>
                  <input
                    type="number"
                    name="numeroCuotas"
                    value={formData.numeroCuotas}
                    onChange={handleChange}
                    placeholder="Ej: 24, 36, 48"
                    required
                    className="land-input-field"
                  />
                </div>

                <div className="land-field-group">
                  <label>Monto Cuota Mensual ($) *</label>
                  <input
                    type="text"
                    inputMode="decimal"
                    name="montoCuotaMensual"
                    value={formData.montoCuotaMensual}
                    onChange={handleNumberInputChange}
                    placeholder="Ej: 150.00"
                    required
                    className="land-input-field"
                  />
                </div>
              </>
            )}

            {/* Observaciones */}
            <div className="land-field-group full-width">
              <label>Observaciones</label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Detalles adicionales sobre la negociación..."
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
              {loading ? "Actualizando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLand;