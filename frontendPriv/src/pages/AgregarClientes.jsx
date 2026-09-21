import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import TopBar from "../components/TopBar/TopBar";
import Sidebar from "../components/Sidebar/Sidebar";
import "../styles/AddProducts/AgregarProducto.css";

export default function AddCustomerPage() {
  const [loading, setLoading] = useState(false);
  const [machineryList, setMachineryList] = useState([]);

  // Referencias para abrir el calendario programáticamente
  const fechaCompraRef = useRef(null);
  const fechaAbonoRef = useRef(null);

  const [formData, setFormData] = useState({
    nombreCliente: "",
    maquinariaComprada: "",
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

  useEffect(() => {
    const fetchMachinery = async () => {
      try {
        const response = await axios.get("http://localhost:4000/api/products", {
          withCredentials: true,
        });
        const items = Array.isArray(response.data)
          ? response.data
          : response.data.products || [];
        setMachineryList(items);
      } catch (error) {
        console.error("Error al obtener inventario de maquinaria:", error);
      }
    };

    fetchMachinery();
  }, []);

  const handleInputChange = (e) => {
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
      precioFinal: selectedItem ? selectedItem.precioFinal || selectedItem.price || "" : prev.precioFinal,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombreCliente.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Falta Nombre del Cliente",
        text: "Por favor ingresa el nombre del cliente",
        confirmButtonColor: "#1C4024",
      });
      return;
    }

    if (!formData.maquinariaComprada) {
      Swal.fire({
        icon: "warning",
        title: "Selecciona una Maquinaria",
        text: "Debes asociar una maquinaria del inventario a este registro",
        confirmButtonColor: "#1C4024",
      });
      return;
    }

    if (!formData.fechaCompra) {
      Swal.fire({
        icon: "warning",
        title: "Falta Fecha de Compra",
        text: "Por favor selecciona la fecha de compra",
        confirmButtonColor: "#1C4024",
      });
      return;
    }

    setLoading(true);

    const payload = {
      nombreCliente: formData.nombreCliente.trim(),
      maquinariaComprada: formData.maquinariaComprada,
      precioFinal: Number(formData.precioFinal) || 0,
      fechaCompra: formData.fechaCompra,
      aplicaAbono: formData.aplicaAbono,
      abonoPagado: formData.aplicaAbono ? formData.abonoPagado : null,
      fechaAbono: formData.aplicaAbono ? formData.fechaAbono : null,
      remanente: Number(formData.remanente) || 0,
      metodoPago: formData.metodoPago,
      observaciones: formData.observaciones.trim(),
    };

    try {
      await axios.post("http://localhost:4000/api/customers", payload, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      setLoading(false);

      await Swal.fire({
        icon: "success",
        title: "Cliente / Venta Registrada",
        text: "El registro de la venta se guardó correctamente.",
        confirmButtonColor: "#4C8F3F",
      });

      setFormData({
        nombreCliente: "",
        maquinariaComprada: "",
        precioFinal: "",
        fechaCompra: "",
        aplicaAbono: false,
        abonoPagado: "0",
        fechaAbono: "",
        remanente: "0",
        metodoPago: "Transferencia",
        observaciones: "",
      });
    } catch (error) {
      setLoading(false);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Ocurrió un error al guardar el cliente",
        confirmButtonColor: "#1C4024",
      });
    }
  };

  return (
    <div className="container-main">
      <Sidebar />

      <div className="main-content">
        <div className="topbar-wrapper">
          <TopBar />
        </div>

        <br />
        <br />

        <div className="add-product-content">
          <form className="form" onSubmit={handleSubmit}>
            <h2 style={{ color: "#1C4024", marginBottom: "20px" }}>Registrar Nueva Venta / Cliente</h2>

            <div className="form-row">
              <div className="form-group">
                <label>Nombre del Cliente</label>
                <input
                  type="text"
                  name="nombreCliente"
                  placeholder="Ej. Carlos Alberto Mendoza"
                  value={formData.nombreCliente}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Maquinaria Comprada</label>
                <select
                  name="maquinariaComprada"
                  value={formData.maquinariaComprada}
                  onChange={handleMachineryChange}
                  required
                  className="custom-select"
                  style={{
                    width: "100%",
                    height: "45px",
                    borderRadius: "6px",
                    padding: "0 10px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="">Selecciona la maquinaria de inventario</option>
                  {machineryList.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.nombreMaquinaria || item.name} {item.numeroContenedor ? `(Cont: ${item.numeroContenedor})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha de Compra Funcional */}
              <div className="form-group">
                <label>Fecha de Compra</label>
                <div className="date-input-wrapper" style={{ position: "relative", width: "100%", cursor: "pointer" }}>
                  <input
                    ref={fechaCompraRef}
                    type="date"
                    name="fechaCompra"
                    value={formData.fechaCompra}
                    onChange={handleInputChange}
                    onClick={() => handleOpenPicker(fechaCompraRef)}
                    required
                    style={{
                      width: "100%",
                      paddingRight: "40px",
                      boxSizing: "border-box",
                      borderRadius: "6px",
                      height: "45px",
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
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Precio Final ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="precioFinal"
                  placeholder="0.00"
                  value={formData.precioFinal}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Método de Pago</label>
                <select
                  name="metodoPago"
                  value={formData.metodoPago}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    height: "45px",
                    borderRadius: "6px",
                    padding: "0 10px",
                    border: "1px solid #ccc",
                  }}
                >
                  <option value="Transferencia">Transferencia</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Cheque">Cheque</option>
                  <option value="MoneyOrder">Money Order</option>
                </select>
              </div>

              <div className="form-group">
                <label>Saldo Remanente ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="remanente"
                  placeholder="0.00"
                  value={formData.remanente}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row" style={{ alignItems: "center" }}>
              <div className="form-group" style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "15px" }}>
                <input
                  type="checkbox"
                  id="aplicaAbono"
                  name="aplicaAbono"
                  checked={formData.aplicaAbono}
                  onChange={handleInputChange}
                  style={{ width: "20px", height: "20px", cursor: "pointer", accentColor: "#4C8F3F" }}
                />
                <label htmlFor="aplicaAbono" style={{ cursor: "pointer", margin: 0, fontWeight: "bold" }}>
                  ¿Aplica Abono Inicial?
                </label>
              </div>

              {formData.aplicaAbono && (
                <>
                  {/* Fecha de Abono Funcional */}
                  <div className="form-group">
                    <label>Fecha de Abono</label>
                    <div className="date-input-wrapper" style={{ position: "relative", width: "100%", cursor: "pointer" }}>
                      <input
                        ref={fechaAbonoRef}
                        type="date"
                        name="fechaAbono"
                        value={formData.fechaAbono}
                        onChange={handleInputChange}
                        onClick={() => handleOpenPicker(fechaAbonoRef)}
                        required={formData.aplicaAbono}
                        style={{
                          width: "100%",
                          paddingRight: "40px",
                          boxSizing: "border-box",
                          borderRadius: "6px",
                          height: "45px",
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

                  <div className="form-group">
                    <label>Cantidad de abono ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      name="abonoPagado"
                      value={formData.abonoPagado}
                      onChange={handleInputChange}
                      required={formData.aplicaAbono}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="form-group">
              <label>Observaciones</label>
              <textarea
                name="observaciones"
                className="custom-textarea"
                placeholder="Ej. Realizó abono inicial de $38,350. Saldo restante a liquidar en 30 días."
                value={formData.observaciones}
                onChange={handleInputChange}
              />
            </div>

            <button type="submit" disabled={loading} className="prod">
              {loading ? "Guardando..." : "Guardar Cliente / Venta"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}