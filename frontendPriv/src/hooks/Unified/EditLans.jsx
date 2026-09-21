
// EditLand.jsx
import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./AddLandModal.css";

const EditLand = ({ landId, onClose, refreshLands }) => {
  const [loading, setLoading] = useState(false);

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

  // ==============================
  // 1. CARGAR REGISTRO DE TERRENO POR ID
  // ==============================
  useEffect(() => {
    const loadLand = async () => {
      if (!landId) return;

      try {
        const res = await fetch(`http://localhost:4000/api/lands/${landId}`, {
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
          costoTerreno: data.costoTerreno ?? "",
          montoAbonado: data.montoAbonado ?? "",
          fechaVenta: formattedDate,
          tipoVenta: data.tipoVenta || "Contado",
          numeroCuotas: data.numeroCuotas ?? "",
          montoCuotaMensual: data.montoCuotaMensual ?? "",
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

  const handleTypeChange = (tipo) => {
    setFormData((prev) => ({
      ...prev,
      tipoVenta: tipo,
      ...(tipo === "Contado" && { numeroCuotas: "", montoCuotaMensual: "" }),
    }));
  };

  // Cálculo automático del saldo remanente
  const costo = parseFloat(formData.costoTerreno) || 0;
  const abonado = parseFloat(formData.montoAbonado) || 0;
  const saldoRemanenteCalculado = Math.max(0, costo - abonado);

  // ==============================
  // ENVIAR ACTUALIZACIÓN (PUT)
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const esPromesa = formData.tipoVenta === "Promesa";

    const numCosto = parseFloat(formData.costoTerreno);
    const numAbonado = parseFloat(formData.montoAbonado);
    const numCuotas = parseInt(formData.numeroCuotas, 10);
    const numMontoCuota = parseFloat(formData.montoCuotaMensual);

    const payload = {
      nombreCliente: formData.nombreCliente.trim(),
      direccion: formData.direccion.trim(),
      telefono: formData.telefono.trim(),
      dimensionTerreno: formData.dimensionTerreno.trim(),
      costoTerreno: isNaN(numCosto) ? 0 : numCosto,
      montoAbonado: isNaN(numAbonado) ? 0 : numAbonado,
      fechaVenta: formData.fechaVenta,
      tipoVenta: formData.tipoVenta,
      numeroCuotas: esPromesa && !isNaN(numCuotas) ? numCuotas : null,
      montoCuotaMensual: esPromesa && !isNaN(numMontoCuota) ? numMontoCuota : null,
      observaciones: formData.observaciones ? formData.observaciones.trim() : "",
    };

    try {
      const res = await fetch(`http://localhost:4000/api/lands/${landId}`, {
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
              <input
                type="date"
                name="fechaVenta"
                value={formData.fechaVenta}
                onChange={handleChange}
                required
                className="land-input-field"
              />
            </div>

            {/* Costo del Terreno */}
            <div className="land-field-group">
              <label>Costo del Terreno ($) *</label>
              <input
                type="number"
                step="0.01"
                name="costoTerreno"
                value={formData.costoTerreno}
                onChange={handleChange}
                placeholder="0.00"
                required
                className="land-input-field"
              />
            </div>

            {/* Monto Abonado */}
            <div className="land-field-group">
              <label>Monto Abonado ($)</label>
              <input
                type="number"
                step="0.01"
                name="montoAbonado"
                value={formData.montoAbonado}
                onChange={handleChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Saldo Remanente Calculado */}
            <div className="land-field-group">
              <label>Saldo Remanente Calculado ($)</label>
              <input
                type="text"
                value={`$${saldoRemanenteCalculado.toFixed(2)}`}
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
                    type="number"
                    step="0.01"
                    name="montoCuotaMensual"
                    value={formData.montoCuotaMensual}
                    onChange={handleChange}
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