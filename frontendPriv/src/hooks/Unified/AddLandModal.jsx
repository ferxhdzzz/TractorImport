import React, { useState } from "react";
import Swal from "sweetalert2";
import "./AddLandModal.css";

const AddLandModal = ({ onClose, refreshLands }) => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    nombreCliente: "",
    direccion: "",
    telefono: "",
    dimensionTerreno: "",
    costoTerreno: "",
    montoAbonado: "",
    fechaVenta: new Date().toISOString().split("T")[0],
    tipoVenta: "Contado",
    numeroCuotas: "",
    montoCuotaMensual: "",
    observaciones: "",
  });

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

  const costo = parseFloat(formData.costoTerreno) || 0;
  const abonado = parseFloat(formData.montoAbonado) || 0;
  const saldoRemanenteCalculado = Math.max(0, costo - abonado);

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
      fechaVenta: formData.fechaVenta, // Envío directo YYYY-MM-DD
      tipoVenta: formData.tipoVenta,
      numeroCuotas: esPromesa && !isNaN(numCuotas) ? numCuotas : null,
      montoCuotaMensual: esPromesa && !isNaN(numMontoCuota) ? numMontoCuota : null,
      observaciones: formData.observaciones ? formData.observaciones.trim() : "",
    };

    try {
      const res = await fetch("https://tractorimport.onrender.com/api/lands", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();

      if (!res.ok) {
        throw new Error(resJson.message || resJson.error || "Error al registrar el terreno");
      }

      if (typeof refreshLands === "function") {
        await refreshLands();
      }

      setLoading(false);

      await Swal.fire({
        icon: "success",
        title: "Terreno Guardado",
        text: "El terreno se registró correctamente.",
        confirmButtonColor: "#be185d",
      });

      onClose();
    } catch (err) {
      setLoading(false);
      console.error("Error al guardar terreno:", err);
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
          <h2 className="land-modal-title">Registrar Nuevo Terreno</h2>
          <button type="button" className="land-modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

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
              {loading ? "Guardando..." : "Guardar Terreno"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddLandModal;