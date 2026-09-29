import React, { useState, useRef } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import TopBar from "../components/TopBar/TopBar";
import Sidebar from "../components/Sidebar/Sidebar";
import "../styles/AddProducts/AgregarProducto.css";

export default function AddInventoryPage() {
  const [loading, setLoading] = useState(false);
  const fechaCompraRef = useRef(null);

  const [formData, setFormData] = useState({
    nombreMaquinaria: "",
    descripcion: "",
    costoMaquinaria: "",
    numeroContenedor: "",
    fechaCompra: new Date().toISOString().split("T")[0],
    impuestoPagado: "",
    costoTransporte: "",
    observaciones: "",
  });

  // Estado para manejar UNA SOLA imagen física
  const [imageFile, setImageFile] = useState(null);

  const handleOpenPicker = () => {
    if (fechaCompraRef.current) {
      if (typeof fechaCompraRef.current.showPicker === "function") {
        fechaCompraRef.current.showPicker();
      } else {
        fechaCompraRef.current.focus();
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Convertir número formateado con comas (Ej: "13,000.50" -> 13000.5)
  const convertToNumber = (value) => {
    if (value === undefined || value === null || value === "") return 0;
    return Number(String(value).replace(/,/g, "")) || 0;
  };

  // Formatear números con comas para la vista (Ej: 13500 -> "13,500.00")
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

  // Formatear campos numéricos con comas en tiempo real
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;

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

  // Cálculo Dinámico en Tiempo Real del Precio Final
  const costoMaq = convertToNumber(formData.costoMaquinaria);
  const impuesto = convertToNumber(formData.impuestoPagado);
  const transporte = convertToNumber(formData.costoTransporte);
  const precioFinalCalculado = costoMaq + impuesto + transporte;

  // Seleccionar la imagen única
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
    }
  };

  // Remover la imagen seleccionada
  const handleRemoveImage = () => {
    setImageFile(null);
  };

  // Evitar desfase de días por zona horaria UTC
  const formatLocalDate = (dateString) => {
    if (!dateString) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(`${dateString}T12:00:00`).toISOString();
    }

    return new Date(dateString).toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();

    data.append(
      "nombreMaquinaria",
      formData.nombreMaquinaria ? formData.nombreMaquinaria.trim() : ""
    );

    data.append(
      "descripcion",
      formData.descripcion ? formData.descripcion.trim() : ""
    );

    data.append("costoMaquinaria", costoMaq);

    data.append(
      "numeroContenedor",
      formData.numeroContenedor ? formData.numeroContenedor.trim() : ""
    );

    if (formData.fechaCompra) {
      data.append("fechaCompra", formatLocalDate(formData.fechaCompra));
    }

    data.append("impuestoPagado", impuesto);
    data.append("costoTransporte", transporte);
    data.append("precioFinal", precioFinalCalculado);

    data.append(
      "observaciones",
      formData.observaciones ? formData.observaciones.trim() : ""
    );

    // Adjuntar la imagen bajo la clave "image" (coincide con upload.single("image"))
    if (imageFile) {
      data.append("image", imageFile);
    }

    try {
      await axios.post(
        "https://tractorimport.onrender.com/api/products",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        }
      );

      setLoading(false);

      await Swal.fire({
        icon: "success",
        title: "Maquinaria Guardada",
        text: "El registro de maquinaria se agregó correctamente.",
        confirmButtonColor: "#4C8F3F",
      });

      // Resetear formulario
      setFormData({
        nombreMaquinaria: "",
        descripcion: "",
        costoMaquinaria: "",
        numeroContenedor: "",
        fechaCompra: new Date().toISOString().split("T")[0],
        impuestoPagado: "",
        costoTransporte: "",
        observaciones: "",
      });
      setImageFile(null);
    } catch (error) {
      setLoading(false);

      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          "Ocurrió un error al guardar la maquinaria",
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
            <div className="form-row">
              <div className="form-group">
                <label>Nombre de la Maquinaria</label>
                <input
                  type="text"
                  name="nombreMaquinaria"
                  placeholder="Ej. Tractor John Deere 5075E"
                  value={formData.nombreMaquinaria}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Número de Serie</label>
                <input
                  type="text"
                  name="numeroContenedor"
                  placeholder="Ej. CONT-987654"
                  value={formData.numeroContenedor}
                  onChange={handleInputChange}
                />
              </div>

              {/* Fecha de Compra */}
              <div className="form-group">
                <label>Fecha de Compra</label>
                <div
                  className="date-input-wrapper"
                  style={{
                    position: "relative",
                    width: "100%",
                    cursor: "pointer",
                  }}
                >
                  <input
                    ref={fechaCompraRef}
                    type="date"
                    name="fechaCompra"
                    value={formData.fechaCompra}
                    onChange={handleInputChange}
                    onClick={handleOpenPicker}
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
            </div>

            <div className="form-row">
              {/* Costo Maquinaria */}
              <div className="form-group">
                <label>Costo Maquinaria ($)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="costoMaquinaria"
                  placeholder="0.00"
                  value={formData.costoMaquinaria}
                  onChange={handleNumberInputChange}
                />
              </div>

              {/* Impuesto Pagado */}
              <div className="form-group">
                <label>Impuesto Pagado ($)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="impuestoPagado"
                  placeholder="0.00"
                  value={formData.impuestoPagado}
                  onChange={handleNumberInputChange}
                />
              </div>

              {/* Costo Transporte */}
              <div className="form-group">
                <label>Costo Transporte ($)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  name="costoTransporte"
                  placeholder="0.00"
                  value={formData.costoTransporte}
                  onChange={handleNumberInputChange}
                />
              </div>

              {/* Precio Final Calculado */}
              <div className="form-group">
                <label>Precio Final Calculado ($)</label>
                <input
                  type="text"
                  readOnly
                  value={`$${formatNumberWithCommas(precioFinalCalculado)}`}
                  style={{
                    fontWeight: "bold",
                    color: "#059669",
                    backgroundColor: "#f8fafc",
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                className="custom-textarea"
                placeholder="Detalles sobre especificaciones o estado de la maquinaria"
                value={formData.descripcion}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group">
              <label>Observaciones</label>
              <textarea
                name="observaciones"
                className="custom-textarea"
                placeholder="Notas adicionales o requerimientos del cliente"
                value={formData.observaciones}
                onChange={handleInputChange}
              />
            </div>

            <div className="images-section">
              <h4>Imagen de Maquinaria</h4>

              <div className="image-upload-area" style={{ marginTop: "10px" }}>
                {!imageFile ? (
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="singleImageInput"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="singleImageInput" className="file-input-label">
                      Subir Imagen
                    </label>
                  </div>
                ) : (
                  <div
                    className="image-preview-container"
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    <img
                      src={URL.createObjectURL(imageFile)}
                      alt="preview"
                      className="preview-img"
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                      }}
                    />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={handleRemoveImage}
                      style={{
                        position: "absolute",
                        top: "6px",
                        right: "6px",
                        background: "rgba(220, 53, 69, 0.9)",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "26px",
                        height: "26px",
                        cursor: "pointer",
                        fontWeight: "bold",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="prod"
              style={{ marginTop: "20px" }}
            >
              {loading ? "Guardando..." : "Guardar Maquinaria"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}