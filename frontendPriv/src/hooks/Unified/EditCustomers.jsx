// EditCustomer.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./AddLandModal.css"; // Utiliza el estilo unificado y amplio

const EditCustomer = ({ customerId, onClose, refreshCustomers }) => {
  const [loading, setLoading] = useState(false);
  const [machineryList, setMachineryList] = useState([]);

  const [formData, setFormData] = useState({
    nombreCliente: "",
    maquinariaComprada: "",
    precioFinal: "",
    fechaCompra: "",
    aplicaAbono: false,
    abonoPagado: "",
    fechaAbono: "",
    remanente: "0",
    metodoPago: "Transferencia",
    observaciones: "",
  });

  // ==============================
  // 1. CARGAR LISTA DE MAQUINARIA (DESDE PRODUCTOS/INVENTARIO)
  // ==============================
  useEffect(() => {
    const fetchMachinery = async () => {
      try {
        const res = await axios.get("http://localhost:4000/api/products", {
          withCredentials: true,
        });
        const items = Array.isArray(res.data) ? res.data : res.data.products || [];
        setMachineryList(items);
      } catch (err) {
        console.error("Error al obtener la lista de maquinarias:", err);
      }
    };

    fetchMachinery();
  }, []);

  // ==============================
  // 2. CARGAR CLIENTE A EDITAR POR ID
  // ==============================
  useEffect(() => {
    const loadCustomer = async () => {
      if (!customerId) return;

      try {
        const res = await fetch(`http://localhost:4000/api/customers/${customerId}`, {
          credentials: "include",
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || "No se pudo cargar la información del cliente");
        }

        const data = await res.json();

        // Formatear fechas a YYYY-MM-DD para inputs date
        const formattedFechaCompra = data.fechaCompra
          ? new Date(data.fechaCompra).toISOString().split("T")[0]
          : "";
        const formattedFechaAbono = data.fechaAbono
          ? new Date(data.fechaAbono).toISOString().split("T")[0]
          : "";

        // Extraer ID de maquinaria por si viene poblada como objeto
        const idMaquinaria =
          typeof data.maquinariaComprada === "object" && data.maquinariaComprada !== null
            ? data.maquinariaComprada._id
            : data.maquinariaComprada || "";

        setFormData({
          nombreCliente: data.nombreCliente || "",
          maquinariaComprada: idMaquinaria,
          precioFinal: data.precioFinal ?? "",
          fechaCompra: formattedFechaCompra,
          aplicaAbono: Boolean(data.aplicaAbono),
          abonoPagado: data.abonoPagado ?? "",
          fechaAbono: formattedFechaAbono,
          remanente: data.remanente ?? "0",
          metodoPago: data.metodoPago || "Transferencia",
          observaciones: data.observaciones || "",
        });
      } catch (err) {
        console.error("Error al cargar cliente:", err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: err.message || "No se pudo obtener el cliente",
          confirmButtonColor: "#be185d",
        });
      }
    };

    loadCustomer();
  }, [customerId]);

  // ==============================
  // MANEJO DE CAMBIOS EN CAMPOS
  // ==============================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleMachineryChange = (e) => {
    const selectedId = e.target.value;
    const selectedItem = machineryList.find((item) => item._id === selectedId);

    setFormData((prev) => ({
      ...prev,
      maquinariaComprada: selectedId,
      precioFinal: selectedItem
        ? selectedItem.precioFinal || selectedItem.price || prev.precioFinal
        : prev.precioFinal,
    }));
  };

  // ==============================
  // ENVIAR ACTUALIZACIÓN (PUT)
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      nombreCliente: formData.nombreCliente.trim(),
      maquinariaComprada: formData.maquinariaComprada,
      precioFinal: Number(formData.precioFinal) || 0,
      fechaCompra: formData.fechaCompra,
      aplicaAbono: formData.aplicaAbono,
      abonoPagado: formData.aplicaAbono ? Number(formData.abonoPagado) || null : null,
      fechaAbono: formData.aplicaAbono && formData.fechaAbono ? formData.fechaAbono : null,
      remanente: Number(formData.remanente) || 0,
      metodoPago: formData.metodoPago,
      observaciones: formData.observaciones.trim(),
    };

    try {
      const res = await fetch(`http://localhost:4000/api/customers/${customerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();

      if (!res.ok) throw new Error(resJson.message || "Error al actualizar cliente");

      if (typeof refreshCustomers === "function") {
        await refreshCustomers();
      }

      setLoading(false);

      await Swal.fire({
        icon: "success",
        title: "Cliente Actualizado",
        text: "Los datos del cliente se modificaron correctamente.",
        confirmButtonColor: "#be185d",
      });

      onClose();
    } catch (err) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.message,
        confirmButtonColor: "#be185d",
      });
    }
  };

  return (
    <div className="land-modal-overlay" onClick={onClose}>
      <div className="land-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Encabezado del Modal */}
        <div className="land-modal-header">
          <h2 className="land-modal-title">Editar Registro de Cliente</h2>
          <button type="button" className="land-modal-close-btn" onClick={onClose}>
            ×
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
                placeholder="Ej: Juan Pérez"
                required
                className="land-input-field"
              />
            </div>

            {/* Maquinaria Comprada */}
            <div className="land-field-group">
              <label>Maquinaria Comprada *</label>
              <select
                name="maquinariaComprada"
                value={formData.maquinariaComprada}
                onChange={handleMachineryChange}
                required
                className="land-input-field"
              >
                <option value="">Selecciona Maquinaria del Inventario</option>
                {machineryList.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.nombreMaquinaria || item.name} {item.numeroContenedor ? `(Cont: ${item.numeroContenedor})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Fecha de Compra */}
            <div className="land-field-group">
              <label>Fecha de Compra *</label>
              <input
                type="date"
                name="fechaCompra"
                value={formData.fechaCompra}
                onChange={handleChange}
                required
                className="land-input-field"
              />
            </div>

            {/* Precio Final */}
            <div className="land-field-group">
              <label>Precio Final ($) *</label>
              <input
                type="number"
                step="0.01"
                name="precioFinal"
                value={formData.precioFinal}
                onChange={handleChange}
                placeholder="0.00"
                required
                className="land-input-field"
              />
            </div>

            {/* Método de Pago */}
            <div className="land-field-group">
              <label>Método de Pago</label>
              <select
                name="metodoPago"
                value={formData.metodoPago}
                onChange={handleChange}
                className="land-input-field"
              >
                <option value="Transferencia">Transferencia</option>
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Cheque">Cheque</option>
              </select>
            </div>

            {/* Saldo Remanente */}
            <div className="land-field-group">
              <label>Saldo Remanente ($)</label>
              <input
                type="number"
                step="0.01"
                name="remanente"
                value={formData.remanente}
                onChange={handleChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Checkbox Aplica Abono */}
            <div className="land-field-group full-width">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "0.4rem" }}>
                <input
                  type="checkbox"
                  id="aplicaAbono"
                  name="aplicaAbono"
                  checked={formData.aplicaAbono}
                  onChange={handleChange}
                  style={{ width: "18px", height: "18px", accentColor: "#be185d", cursor: "pointer" }}
                />
                <label htmlFor="aplicaAbono" style={{ cursor: "pointer", fontWeight: "600", color: "#334155" }}>
                  ¿Aplica Abono Inicial?
                </label>
              </div>
            </div>

            {/* Campos de Abono Condicionales */}
            {formData.aplicaAbono && (
              <>
                <div className="land-field-group">
                  <label>Abono Inicial Pagado ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="abonoPagado"
                    value={formData.abonoPagado}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="land-input-field"
                  />
                </div>

                <div className="land-field-group">
                  <label>Fecha de Abono</label>
                  <input
                    type="date"
                    name="fechaAbono"
                    value={formData.fechaAbono}
                    onChange={handleChange}
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
                placeholder="Escribe detalles adicionales sobre el cliente o la venta..."
                className="land-input-field"
              />
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="land-modal-actions">
            <button
              type="button"
              onClick={onClose}
              className="land-btn-cancel"
              disabled={loading}
            >
              Cancelar
            </button>

            <button type="submit" className="land-btn-submit" disabled={loading}>
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomer;