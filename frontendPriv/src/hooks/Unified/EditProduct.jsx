import React, { useState, useEffect, useRef } from "react";
import Swal from "sweetalert2";
import "./AddLandModal.css";

const EditProduct = ({ productId, onClose, refreshProducts }) => {
  const [loading, setLoading] = useState(false);
  const fechaCompraRef = useRef(null);

  const [formData, setFormData] = useState({
    nombreMaquinaria: "",
    numeroContenedor: "",
    costoMaquinaria: "",
    impuestoPagado: "",
    costoTransporte: "",
    precioFinal: "",
    fechaCompra: "",
    descripcion: "",
    observaciones: "",
  });

  // previewImages guarda objetos: { url: string, isNew: boolean, file?: File }
  const [previewImages, setPreviewImages] = useState([]);

  // Abrir picker de fecha
  const handleOpenPicker = () => {
    if (fechaCompraRef.current) {
      if (typeof fechaCompraRef.current.showPicker === "function") {
        fechaCompraRef.current.showPicker();
      } else {
        fechaCompraRef.current.focus();
      }
    }
  };

  // Formatear números para mostrar con comas
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

  // Convertir string formateado ("13,000.50") a número puro (13000.50)
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
  // CARGAR REGISTRO DE MAQUINARIA A EDITAR
  // ==============================
  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch(
          `https://tractorimport.onrender.com/api/products/${productId}`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error("No se pudo cargar la maquinaria");
        const data = await res.json();

        // Extraer fecha limpia YYYY-MM-DD
        const formattedDate = data.fechaCompra
          ? new Date(data.fechaCompra).toISOString().split("T")[0]
          : "";

        setFormData({
          nombreMaquinaria: data.nombreMaquinaria || data.name || "",
          numeroContenedor: data.numeroContenedor || "",
          costoMaquinaria: formatNumberWithCommas(data.costoMaquinaria),
          impuestoPagado: formatNumberWithCommas(data.impuestoPagado),
          costoTransporte: formatNumberWithCommas(data.costoTransporte),
          precioFinal: formatNumberWithCommas(data.precioFinal || data.price),
          fechaCompra: formattedDate,
          descripcion: data.descripcion || data.description || "",
          observaciones: data.observaciones || "",
        });

        // Imágenes existentes
        const imagesData = (data.images || []).map((url) => ({
          url,
          isNew: false,
        }));
        setPreviewImages(imagesData);
      } catch (err) {
        console.error(err);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar la información de la maquinaria",
          confirmButtonColor: "#be185d",
        });
      }
    };
    loadProduct();
  }, [productId]);

  // ==============================
  // MANEJO DE CAMPOS DE TEXTO / FECHA
  // ==============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));
  };

  // ==============================
  // REEMPLAZAR UNA IMAGEN EXISTENTE
  // ==============================
  const handleImageClick = (index) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (previewImages[index].isNew) {
          URL.revokeObjectURL(previewImages[index].url);
        }

        const newUrl = URL.createObjectURL(file);

        setPreviewImages((prev) => {
          const copy = [...prev];
          copy[index] = { url: newUrl, isNew: true, file };
          return copy;
        });
      }
    };

    input.click();
  };

  // ==============================
  // AGREGAR NUEVAS IMÁGENES
  // ==============================
  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);

    const filteredFiles = files.filter((file) => {
      return !previewImages.some(
        (img) =>
          img.isNew &&
          img.file &&
          img.file.name === file.name &&
          img.file.size === file.size &&
          img.file.lastModified === file.lastModified
      );
    });

    if (filteredFiles.length === 0) {
      e.target.value = "";
      return;
    }

    const newImagesObjs = filteredFiles.map((file) => ({
      url: URL.createObjectURL(file),
      isNew: true,
      file,
    }));

    setPreviewImages((prev) => [...prev, ...newImagesObjs]);

    e.target.value = "";
  };

  // ==============================
  // ELIMINAR IMAGEN
  // ==============================
  const handleDeleteImage = (index) => {
    Swal.fire({
      title: "¿Eliminar esta imagen?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#be185d",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        setPreviewImages((prev) => {
          if (prev[index].isNew) {
            URL.revokeObjectURL(prev[index].url);
          }
          return prev.filter((_, i) => i !== index);
        });
      }
    });
  };

  // ==============================
  // ENVIAR FORMULARIO (PUT)
  // ==============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();

      // Campos de texto y fechas
      form.append("nombreMaquinaria", formData.nombreMaquinaria.trim());
      form.append("numeroContenedor", formData.numeroContenedor.trim());
      form.append("fechaCompra", formatLocalDate(formData.fechaCompra));
      form.append("descripcion", formData.descripcion.trim());
      form.append("observaciones", formData.observaciones.trim());

      // Convertir campos de texto formateados a número puro
      form.append("costoMaquinaria", convertToNumber(formData.costoMaquinaria));
      form.append("impuestoPagado", convertToNumber(formData.impuestoPagado));
      form.append("costoTransporte", convertToNumber(formData.costoTransporte));
      form.append("precioFinal", convertToNumber(formData.precioFinal));

      // Imágenes existentes
      const existingImages = previewImages
        .filter((img) => !img.isNew)
        .map((img) => img.url);

      form.append("existingImages", JSON.stringify(existingImages));

      // Imágenes nuevas
      previewImages
        .filter((img) => img.isNew && img.file)
        .forEach((img) => {
          form.append("images", img.file);
        });

      const res = await fetch(
        `https://tractorimport.onrender.com/api/products/${productId}`,
        {
          method: "PUT",
          credentials: "include",
          body: form,
        }
      );

      const resJson = await res.json();

      if (!res.ok) throw new Error(resJson.message || "Error al actualizar");

      await refreshProducts();
      setLoading(false);

      await Swal.fire({
        icon: "success",
        title: "Maquinaria actualizada",
        text: "Los datos de la maquinaria fueron guardados correctamente.",
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
        <div className="land-modal-header">
          <h2 className="land-modal-title">Editar Maquinaria</h2>
          <button type="button" className="land-modal-close-btn" onClick={onClose}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="land-form-grid">
            {/* Nombre de la Maquinaria */}
            <div className="land-field-group">
              <label>Nombre de la Maquinaria *</label>
              <input
                type="text"
                name="nombreMaquinaria"
                value={formData.nombreMaquinaria}
                onChange={handleChange}
                placeholder="Ej: Tractor John Deere"
                required
                className="land-input-field"
              />
            </div>

            {/* Número de Contenedor */}
            <div className="land-field-group">
              <label>Número de Serie</label>
              <input
                type="text"
                name="numeroContenedor"
                value={formData.numeroContenedor}
                onChange={handleChange}
                placeholder="Ej: CONT-9823"
                className="land-input-field"
              />
            </div>

            {/* Costo Maquinaria */}
            <div className="land-field-group">
              <label>Costo de Maquinaria ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="costoMaquinaria"
                value={formData.costoMaquinaria}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Impuesto Pagado */}
            <div className="land-field-group">
              <label>Impuesto Pagado ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="impuestoPagado"
                value={formData.impuestoPagado}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Costo Transporte */}
            <div className="land-field-group">
              <label>Costo de Transporte ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="costoTransporte"
                value={formData.costoTransporte}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Precio Final */}
            <div className="land-field-group">
              <label>Precio Final de Venta ($) *</label>
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

            {/* Fecha de Compra */}
            <div className="land-field-group">
              <label>Fecha de Compra</label>
              <div style={{ position: "relative", width: "100%", cursor: "pointer" }}>
                <input
                  ref={fechaCompraRef}
                  type="date"
                  name="fechaCompra"
                  value={formData.fechaCompra}
                  onChange={handleChange}
                  onClick={handleOpenPicker}
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

            {/* Agregar más imágenes */}
            <div className="land-field-group">
              <label>Cambiar imagen</label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleAddImages}
                className="land-input-field"
              />
            </div>

            {/* Descripción */}
            <div className="land-field-group full-width">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Detalles sobre las especificaciones de la maquinaria..."
                className="land-input-field"
              />
            </div>

            {/* Observaciones */}
            <div className="land-field-group full-width">
              <label>Observaciones</label>
              <textarea
                name="observaciones"
                value={formData.observaciones}
                onChange={handleChange}
                placeholder="Notas adicionales sobre el estado, traslado o negociación..."
                className="land-input-field"
              />
            </div>

            {/* Imágenes actuales */}
            {previewImages.length > 0 && (
              <div className="land-field-group full-width">
                <label>Imágenes actuales (haz clic para reemplazar)</label>
                <div className="edit-image-preview">
                  {previewImages.map((img, index) => (
                    <div key={index} className="img-container">
                      <img
                        src={img.url}
                        alt={`preview-${index}`}
                        className="editable-img"
                        onClick={() => handleImageClick(index)}
                        title="Click para reemplazar"
                      />
                      <button
                        type="button"
                        className="delete-img-btn"
                        onClick={() => handleDeleteImage(index)}
                        aria-label="Eliminar imagen"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              {loading ? "Actualizando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;