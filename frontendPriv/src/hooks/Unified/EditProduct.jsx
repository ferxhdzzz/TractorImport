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

  // Estado para UNA sola imagen
  const [previewImage, setPreviewImage] = useState(null);

  const handleOpenPicker = () => {
    if (fechaCompraRef.current) {
      if (typeof fechaCompraRef.current.showPicker === "function") {
        fechaCompraRef.current.showPicker();
      } else {
        fechaCompraRef.current.focus();
      }
    }
  };

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

  const convertToNumber = (value) => {
    if (value === undefined || value === null || value === "") return 0;
    return Number(String(value).replace(/,/g, "")) || 0;
  };

  const formatLocalDate = (dateString) => {
    if (!dateString) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return new Date(`${dateString}T12:00:00`).toISOString();
    }
    return new Date(dateString).toISOString();
  };

  useEffect(() => {
    const loadProduct = async () => {
      try {
        const res = await fetch(
          `https://tractorimport.onrender.com/api/products/${productId}`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error("No se pudo cargar la maquinaria");
        const data = await res.json();

        const formattedDate = data.fechaCompra
          ? new Date(data.fechaCompra).toISOString().split("T")[0]
          : "";

        setFormData({
          nombreMaquinaria: data.nombreMaquinaria || data.name || "",
          numeroContenedor: data.numeroContenedor || "",
          costoMaquinaria: formatNumberWithCommas(data.costoMaquinaria),
          impuestoPagado: formatNumberWithCommas(data.impuestoPagado),
          costoTransporte: formatNumberWithCommas(data.costoTransporte),
          precioFinal: formatNumberWithCommas(data.precioFinal ?? data.price),
          fechaCompra: formattedDate,
          descripcion: data.descripcion || data.description || "",
          observaciones: data.observaciones || "",
        });

        // Cargar imagen única
        const imgSrc = data.imagenUrl || (Array.isArray(data.images) && data.images.length > 0 ? data.images[0] : null);

        if (imgSrc) {
          setPreviewImage({ url: imgSrc, isNew: false });
        } else {
          setPreviewImage(null);
        }
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  // Seleccionar o reemplazar la imagen única
  const handleImageClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (previewImage && previewImage.isNew && previewImage.url) {
          URL.revokeObjectURL(previewImage.url);
        }
        const newUrl = URL.createObjectURL(file);
        setPreviewImage({ url: newUrl, isNew: true, file });
      }
    };

    input.click();
  };

  // Eliminar la imagen única
  const handleDeleteImage = () => {
    Swal.fire({
      title: "¿Eliminar esta imagen?",
      text: "La imagen se eliminará definitivamente cuando guardes los cambios.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#be185d",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then((result) => {
      if (result.isConfirmed) {
        if (previewImage && previewImage.isNew && previewImage.url) {
          URL.revokeObjectURL(previewImage.url);
        }
        setPreviewImage(null);
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const form = new FormData();

      form.append("nombreMaquinaria", formData.nombreMaquinaria.trim());
      form.append("numeroContenedor", formData.numeroContenedor.trim());

      if (formData.fechaCompra) {
        form.append("fechaCompra", formatLocalDate(formData.fechaCompra));
      } else {
        form.append("fechaCompra", "");
      }

      form.append("descripcion", formData.descripcion.trim());
      form.append("observaciones", formData.observaciones.trim());

      form.append("costoMaquinaria", convertToNumber(formData.costoMaquinaria));
      form.append("impuestoPagado", convertToNumber(formData.impuestoPagado));
      form.append("costoTransporte", convertToNumber(formData.costoTransporte));
      form.append("precioFinal", convertToNumber(formData.precioFinal));

      // MANEJO DIRECTO DE UNA SOLA IMAGEN
      if (!previewImage) {
        // Si el usuario eliminó la imagen
        form.append("imagenUrl", "");
      } else if (!previewImage.isNew) {
        // Si se mantiene la imagen previa
        form.append("imagenUrl", previewImage.url);
      } else {
        // Si se subió una nueva foto local
        form.append("imagenUrl", "");
        form.append("image", previewImage.file);
        form.append("file", previewImage.file);
        form.append("images", previewImage.file);
      }

      const res = await fetch(
        `https://tractorimport.onrender.com/api/products/${productId}`,
        {
          method: "PUT",
          credentials: "include",
          body: form,
        }
      );

      const resJson = await res.json();

      if (!res.ok) throw new Error(resJson.message || "Error al actualizar la maquinaria");

      if (typeof refreshProducts === "function") {
        await refreshProducts();
      }

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

            <div className="land-field-group">
              <label>Precio Final de Venta ($)</label>
              <input
                type="text"
                inputMode="decimal"
                name="precioFinal"
                value={formData.precioFinal}
                onChange={handleNumberInputChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

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

            <div className="land-field-group full-width">
              <label>Imagen de Maquinaria</label>

              <div
                className="edit-image-preview"
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  gap: "10px",
                  marginTop: "8px",
                }}
              >
                {previewImage ? (
                  <div className="img-container" style={{ position: "relative" }}>
                    <img
                      src={previewImage.url}
                      alt="preview"
                      className="editable-img"
                      onClick={handleImageClick}
                      title="Haz clic para reemplazar la imagen"
                      style={{
                        cursor: "pointer",
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                      }}
                    />
                    <button
                      type="button"
                      className="delete-img-btn"
                      onClick={handleDeleteImage}
                      aria-label="Eliminar imagen"
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
                ) : (
                  <div
                    onClick={handleImageClick}
                    style={{
                      width: "150px",
                      height: "150px",
                      border: "2px dashed #1C4024",
                      borderRadius: "8px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#1C4024",
                      backgroundColor: "#f9fafb",
                    }}
                  >
                    <span style={{ fontSize: "2rem", lineHeight: "1" }}>+</span>
                    <span style={{ fontSize: "0.85rem", marginTop: "5px" }}>Agregar foto</span>
                  </div>
                )}
              </div>
            </div>
          </div>

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