import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "./AddLandModal.css";

const EditCustomer = ({ customerId, onClose, refreshCustomers }) => {
  const [loading, setLoading] = useState(false);
  const [machineryList, setMachineryList] = useState([]);

  // Referencias para abrir el calendario programáticamente
  const fechaCompraRef = useRef(null);
  const fechaAbonoRef = useRef(null);

  const [formData, setFormData] = useState({
    nombreCliente: "",
    maquinariaComprada: [], // Arreglo de IDs seleccionadas
    precioFinal: "",
    fechaCompra: "",
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

  // Convertir un número formateado como "13,000.50" a valor numérico puro
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
  // 1. CARGAR LISTA DE MAQUINARIA
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
  // 2. CARGAR CLIENTE A EDITAR
  // ==============================
  useEffect(() => {
    const loadCustomer = async () => {
      if (!customerId) return;

      try {
        const res = await fetch(`https://tractorimport.onrender.com/api/customers/${customerId}`, {
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

        // Normalizar las maquinarias compradas a un Arreglo de IDs (string)
        let idsMaquinarias = [];
        if (Array.isArray(data.maquinariaComprada)) {
          idsMaquinarias = data.maquinariaComprada.map((item) =>
            typeof item === "object" && item !== null ? item._id : item
          );
        } else if (data.maquinariaComprada) {
          idsMaquinarias = [
            typeof data.maquinariaComprada === "object" && data.maquinariaComprada !== null
              ? data.maquinariaComprada._id
              : data.maquinariaComprada,
          ];
        }

        setFormData({
          nombreCliente: data.nombreCliente || "",
          maquinariaComprada: idsMaquinarias.filter(Boolean),
          precioFinal: formatNumberWithCommas(data.precioFinal),
          fechaCompra: formattedFechaCompra,
          aplicaAbono: Boolean(data.aplicaAbono),
          abonoPagado: formatNumberWithCommas(data.abonoPagado),
          fechaAbono: formattedFechaAbono,
          remanente: formatNumberWithCommas(data.remanente),
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
  // MANEJO DE CAMBIOS EN CAMPOS GENERALES
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

      // Recalcular el remanente si cambia el precio o abono
      const pf = convertToNumber(name === "precioFinal" ? formattedValue : prev.precioFinal);
      const ab = convertToNumber(name === "abonoPagado" ? formattedValue : prev.abonoPagado);

      if (prev.aplicaAbono && (name === "precioFinal" || name === "abonoPagado")) {
        const calcRemanente = Math.max(0, pf - ab);
        updated.remanente = formatNumberWithCommas(calcRemanente);
      }

      return updated;
    });
  };

  // Recalcular suma total del precio final basado en maquinarias
  const recalculateTotalPrice = (selectedIds) => {
    let totalSum = 0;
    selectedIds.forEach((id) => {
      const found = machineryList.find((item) => item._id === id);
      if (found) {
        const val = found.precioFinal ?? found.price ?? 0;
        totalSum += Number(val) || 0;
      }
    });

    const formattedPrice = totalSum > 0 ? formatNumberWithCommas(totalSum) : formData.precioFinal;

    setFormData((prev) => {
      const updated = {
        ...prev,
        maquinariaComprada: selectedIds,
        precioFinal: formattedPrice,
      };

      if (prev.aplicaAbono) {
        const ab = convertToNumber(prev.abonoPagado);
        updated.remanente = formatNumberWithCommas(Math.max(0, totalSum - ab));
      }

      return updated;
    });
  };

  // Agregar maquinaria seleccionada
  const handleAddMachinery = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) return;

    if (!formData.maquinariaComprada.includes(selectedId)) {
      const updatedList = [...formData.maquinariaComprada, selectedId];
      recalculateTotalPrice(updatedList);
    }

    e.target.value = ""; // Reiniciar select
  };

  // Remover maquinaria seleccionada
  const handleRemoveMachinery = (idToRemove) => {
    const updatedList = formData.maquinariaComprada.filter((id) => id !== idToRemove);
    recalculateTotalPrice(updatedList);
  };

  // ==============================
  // ENVIAR ACTUALIZACIÓN (PUT)
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.maquinariaComprada.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Selección requerida",
        text: "Debe mantener al menos una maquinaria asociada al cliente.",
        confirmButtonColor: "#be185d",
      });
      return;
    }

    setLoading(true);

    const payload = {
      nombreCliente: formData.nombreCliente.trim(),
      maquinariaComprada: formData.maquinariaComprada, // Enviamos el arreglo con las IDs
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
      const res = await fetch(`https://tractorimport.onrender.com/api/customers/${customerId}`, {
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

            {/* Selección Múltiple de Maquinarias Compradas */}
            <div className="land-field-group full-width">
              <label>Maquinaria(s) Comprada(s) *</label>
              
              <select
                onChange={handleAddMachinery}
                className="land-input-field"
                defaultValue=""
              >
                <option value="" disabled>
                  + Agregar otra maquinaria del inventario...
                </option>
                {machineryList.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.nombreMaquinaria || item.name} {item.numeroContenedor ? `(Cont: ${item.numeroContenedor})` : ""}
                  </option>
                ))}
              </select>

              {/* Badges con opción de eliminar */}
              <div 
                style={{ 
                  display: "flex", 
                  flexWrap: "wrap", 
                  gap: "8px", 
                  marginTop: "10px" 
                }}
              >
                {formData.maquinariaComprada.map((id) => {
                  const item = machineryList.find((m) => m._id === id);
                  return (
                    <span
                      key={id}
                      style={{
                        backgroundColor: "#1C4024",
                        color: "#ffffff",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: "600",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                    >
                      {item ? (item.nombreMaquinaria || item.name) : "Cargando maquinaria..."}
                      <button
                        type="button"
                        onClick={() => handleRemoveMachinery(id)}
                        style={{
                          background: "#1C4024",
                          border: "none",
                          color: "#ffffff",
                          borderRadius: "50%",
                          width: "18px",
                          height: "18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: "0.8rem",
                          lineHeight: 1,
                        }}
                        title="Quitar maquinaria"
                      >
                        ×
                      </button>
                    </span>
                  );
                })}
              </div>
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

            {/* Precio Final Total */}
            <div className="land-field-group">
              <label>Precio Final Total ($) *</label>
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
                  id="aplicaAbono"
                  name="aplicaAbono"
                  checked={formData.aplicaAbono}
                  onChange={handleChange}
                  style={{ width: "18px", height: "18px", accentColor: "#17390c", cursor: "pointer" }}
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
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCustomer;