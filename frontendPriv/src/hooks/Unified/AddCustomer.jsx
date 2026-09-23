import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./AddLandModal.css";

const AddCustomerModal = ({ onClose, refreshCustomers }) => {
  const [loading, setLoading] = useState(false);
  const [machineryList, setMachineryList] = useState([]);

  // Referencias para abrir el selector de fechas al hacer clic en el input o en el ícono
  const fechaCompraRef = useRef(null);
  const fechaAbonoRef = useRef(null);

  const [formData, setFormData] = useState({
    nombreCliente: "",
    maquinariaComprada: "",
    precioFinal: "",
    fechaCompra: new Date().toISOString().split("T")[0],
    aplicaAbono: false,
    abonoPagado: "",
    fechaAbono: "",
    remanente: "",
    metodoPago: "Transferencia",
    observaciones: "",
  });

  const handleOpenPicker = (ref) => {
    if (ref.current) {
      if (typeof ref.current.showPicker === "function") {
        ref.current.showPicker();
      } else {
        ref.current.focus();
      }
    }
  };

  // Convertir string formateado como "13,000.50" a número puro (13000.5)
  const convertToNumber = (value) => {
    return Number(String(value).replace(/,/g, "")) || 0;
  };

  // Formatear números con comas para la vista (Ej: 13500 -> "13,500")
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

  // Evitar desfase de 1 día por zona horaria UTC
  const formatLocalDate = (dateString) => {
    if (!dateString) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(`${dateString}T12:00:00`).toISOString();
    }
    return new Date(dateString).toISOString();
  };

  // ==============================
  // CARGAR LISTA DE MAQUINARIAS
  // ==============================
  useEffect(() => {
    const fetchMachinery = async () => {
      try {
        const res = await axios.get("https://tractorimport.onrender.com/api/products", {
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
  // MANEJO DE CAMBIOS GENERALES
  // ==============================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ==============================
  // MANEJO DE CAMPOS NUMÉRICOS CON COMAS
  // ==============================
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

    setFormData((prev) => {
      const updated = { ...prev, [name]: formattedValue };

      // Recalcular el remanente automáticamente si cambia el precio final o el abono
      const pf = convertToNumber(name === "precioFinal" ? formattedValue : prev.precioFinal);
      const ab = convertToNumber(name === "abonoPagado" ? formattedValue : prev.abonoPagado);

      if (prev.aplicaAbono && (name === "precioFinal" || name === "abonoPagado")) {
        const calcRemanente = Math.max(0, pf - ab);
        updated.remanente = formatNumberWithCommas(calcRemanente);
      }

      return updated;
    });
  };

  // Selección de Maquinaria y Autocompletado opcional del precio
  const handleMachineryChange = (e) => {
    const selectedId = e.target.value;
    const selectedItem = machineryList.find((item) => item._id === selectedId);

    let formattedPrice = "";
    if (selectedItem) {
      const priceVal = selectedItem.precioFinal || selectedItem.price || "";
      if (priceVal) {
        formattedPrice = formatNumberWithCommas(priceVal);
      }
    }

    setFormData((prev) => {
      const updated = {
        ...prev,
        maquinariaComprada: selectedId,
      };

      if (formattedPrice) {
        updated.precioFinal = formattedPrice;
        if (prev.aplicaAbono) {
          const ab = convertToNumber(prev.abonoPagado);
          const pf = convertToNumber(formattedPrice);
          updated.remanente = formatNumberWithCommas(Math.max(0, pf - ab));
        }
      }

      return updated;
    });
  };

  // ==============================
  // ENVIAR REGISTRO (POST)
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      nombreCliente: formData.nombreCliente.trim(),
      maquinariaComprada: formData.maquinariaComprada,
      precioFinal: convertToNumber(formData.precioFinal),
      fechaCompra: formatLocalDate(formData.fechaCompra),
      aplicaAbono: formData.aplicaAbono,
      abonoPagado: formData.aplicaAbono ? convertToNumber(formData.abonoPagado) : null,
      fechaAbono: formData.aplicaAbono && formData.fechaAbono ? formatLocalDate(formData.fechaAbono) : null,
      remanente: convertToNumber(formData.remanente),
      metodoPago: formData.metodoPago,
      observaciones: formData.observaciones.trim(),
    };

    try {
      const res = await fetch("https://tractorimport.onrender.com/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const resJson = await res.json();

      if (!res.ok) {
        throw new Error(resJson.message || resJson.error || "Error al registrar el cliente");
      }

      if (typeof refreshCustomers === "function") {
        await refreshCustomers();
      }

      setLoading(false);

      await Swal.fire({
        icon: "success",
        title: "Cliente Guardado",
        text: "El registro del cliente se guardó correctamente.",
        confirmButtonColor: "#be185d",
      });

      onClose();
    } catch (err) {
      setLoading(false);
      console.error("Error al registrar cliente:", err);
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
        {/* Encabezado del Modal */}
        <div className="land-modal-header">
          <h2 className="land-modal-title">Registrar Nuevo Cliente / Venta</h2>
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
              <div style={{ position: "relative", width: "100%", cursor: "pointer" }}>
                <input
                  ref={fechaCompraRef}
                  type="date"
                  name="fechaCompra"
                  value={formData.fechaCompra}
                  onChange={handleChange}
                  onClick={() => handleOpenPicker(fechaCompraRef)}
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
                  onClick={() => handleOpenPicker(fechaCompraRef)}
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

            {/* Precio Final */}
            <div className="land-field-group">
              <label>Precio Final ($) *</label>
              <input
                type="text"
                inputMode="decimal"
                name="precioFinal"
                value={formData.precioFinal}
                onChange={handleNumberInputChange}
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
                <option value="MoneyOrder">Money Order</option>
              </select>
            </div>

            {/* Saldo Remanente */}
            <div className="land-field-group">
              <label>Saldo Remanente ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="remanente"
                value={formData.remanente}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Checkbox Aplica Abono */}
            <div className="land-field-group full-width">
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "0.4rem" }}>
                <input
                  type="checkbox"
                  id="aplicaAbonoModal"
                  name="aplicaAbono"
                  checked={formData.aplicaAbono}
                  onChange={handleChange}
                  style={{ width: "18px", height: "18px", accentColor: "#17390c", cursor: "pointer" }}
                />
                <label htmlFor="aplicaAbonoModal" style={{ cursor: "pointer", fontWeight: "600", color: "#334155" }}>
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
                    type="text"
                    inputMode="decimal"
                    name="abonoPagado"
                    value={formData.abonoPagado}
                    onChange={handleNumberInputChange}
                    placeholder="0.00"
                    className="land-input-field"
                  />
                </div>

                <div className="land-field-group">
                  <label>Fecha de Abono</label>
                  <div style={{ position: "relative", width: "100%", cursor: "pointer" }}>
                    <input
                      ref={fechaAbonoRef}
                      type="date"
                      name="fechaAbono"
                      value={formData.fechaAbono}
                      onChange={handleChange}
                      onClick={() => handleOpenPicker(fechaAbonoRef)}
                      className="land-input-field"
                      style={{
                        width: "100%",
                        paddingRight: "40px",
                        boxSizing: "border-box",
                        cursor: "pointer",
                      }}
                    />
                    <svg
                      onClick={() => handleOpenPicker(fechaAbonoRef)}
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
              {loading ? "Guardando..." : "Guardar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomerModal;