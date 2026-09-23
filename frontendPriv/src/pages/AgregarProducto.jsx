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
    fechaCompra: "",
    impuestoPagado: "",
    costoTransporte: "",
    precioFinal: "",
    observaciones: "",
    images: [],
  });

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

  // Formatear campos numéricos con comas
  const handleNumberInputChange = (e) => {
    const { name, value } = e.target;

    // Permitir únicamente números, comas y punto decimal
    let cleanValue = value.replace(/[^\d.,]/g, "");

    // Eliminar comas anteriores para poder volver a formatear
    cleanValue = cleanValue.replace(/,/g, "");

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

  // Convertir un número formateado como "13,000.50" a 13000.50
  const convertToNumber = (value) => {
    return Number(String(value).replace(/,/g, "")) || 0;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }));
  };

  const handleRemoveImage = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, index) => index !== indexToRemove),
    }));
  };

  // Función para evitar el desfase de 1 día por conversión de zona horaria / UTC
  const formatLocalDate = (dateString) => {
    if (!dateString) return null;

    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(`${dateString}T12:00:00`).toISOString();
    }

    return new Date(dateString).toISOString();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nombreMaquinaria.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Falta Nombre",
        text: "Por favor ingresa el nombre de la maquinaria",
        confirmButtonColor: "#1C4024",
      });

      return;
    }

    if (!formData.numeroContenedor.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Falta Contenedor",
        text: "Ingresa el número de contenedor / serie",
        confirmButtonColor: "#1C4024",
      });

      return;
    }

    if (formData.images.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Falta Imagen",
        text: "Debes subir al menos una imagen de la maquinaria",
        confirmButtonColor: "#1C4024",
      });

      return;
    }

    setLoading(true);

    const data = new FormData();

    data.append(
      "nombreMaquinaria",
      formData.nombreMaquinaria.trim()
    );

    data.append(
      "descripcion",
      formData.descripcion.trim()
    );

    // Quitar las comas antes de enviar al backend
    data.append(
      "costoMaquinaria",
      convertToNumber(formData.costoMaquinaria)
    );

    data.append(
      "numeroContenedor",
      formData.numeroContenedor.trim()
    );

    data.append(
      "fechaCompra",
      formatLocalDate(formData.fechaCompra)
    );

    data.append(
      "impuestoPagado",
      convertToNumber(formData.impuestoPagado)
    );

    data.append(
      "costoTransporte",
      convertToNumber(formData.costoTransporte)
    );

    data.append(
      "precioFinal",
      convertToNumber(formData.precioFinal)
    );

    data.append(
      "observaciones",
      formData.observaciones.trim()
    );

    formData.images.forEach((file) => {
      data.append("images", file);
    });

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

      setFormData({
        nombreMaquinaria: "",
        descripcion: "",
        costoMaquinaria: "",
        numeroContenedor: "",
        fechaCompra: "",
        impuestoPagado: "",
        costoTransporte: "",
        precioFinal: "",
        observaciones: "",
        images: [],
      });
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
                <label>Número de Serie / Contenedor</label>

                <input
                  type="text"
                  name="numeroContenedor"
                  placeholder="Ej. CONT-987654"
                  value={formData.numeroContenedor}
                  onChange={handleInputChange}
                  required
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
                    <rect
                      x="3"
                      y="4"
                      width="18"
                      height="18"
                      rx="2"
                      ry="2"
                    ></rect>

                    <line
                      x1="16"
                      y1="2"
                      x2="16"
                      y2="6"
                    ></line>

                    <line
                      x1="8"
                      y1="2"
                      x2="8"
                      y2="6"
                    ></line>

                    <line
                      x1="3"
                      y1="10"
                      x2="21"
                      y2="10"
                    ></line>
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
                  required
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

              {/* Precio Final */}
              <div className="form-group">
                <label>Precio Final ($)</label>

                <input
                  type="text"
                  inputMode="decimal"
                  name="precioFinal"
                  placeholder="0.00"
                  value={formData.precioFinal}
                  onChange={handleNumberInputChange}
                  required
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
              <h4>Imágenes</h4>

              <div className="image-upload-area">
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="images"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                  />

                  <label
                    htmlFor="images"
                    className="file-input-label"
                  >
                    Subir Imagen
                  </label>
                </div>

                {formData.images.length === 0 && (
                  <div className="image-placeholder">
                    <span>Vista previa de la imagen</span>
                  </div>
                )}
              </div>

              {formData.images.length > 0 && (
                <div className="preview">
                  {formData.images.map((file, index) => (
                    <div
                      key={index}
                      className="image-preview-container"
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${index}`}
                        className="preview-img"
                      />

                      <button
                        type="button"
                        className="remove-image-btn"
                        onClick={() => handleRemoveImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="prod"
            >
              {loading
                ? "Guardando..."
                : "Guardar Maquinaria"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}