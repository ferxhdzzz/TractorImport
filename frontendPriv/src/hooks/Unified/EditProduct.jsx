import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "./AddLandModal.css"; // 👈 Utiliza el estilo amplio y unificado

const EditProduct = ({ productId, onClose, refreshProducts }) => {
  const [loading, setLoading] = useState(false);

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

        // Formatear la fecha a YYYY-MM-DD para el input type="date"
        const formattedDate = data.fechaCompra
          ? new Date(data.fechaCompra).toISOString().split("T")[0]
          : "";

        setFormData({
          nombreMaquinaria: data.nombreMaquinaria || data.name || "",
          numeroContenedor: data.numeroContenedor || "",
          costoMaquinaria: data.costoMaquinaria || "",
          impuestoPagado: data.impuestoPagado || "",
          costoTransporte: data.costoTransporte || "",
          precioFinal: data.precioFinal || data.price || "",
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
  // MANEJO DE CAMPOS
  // ==============================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

      // Agregar campos de maquinaria
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value);
      });

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
              <label>Número de Contenedor</label>
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
                type="number"
                step="0.01"
                name="costoMaquinaria"
                value={formData.costoMaquinaria}
                onChange={handleChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Impuesto Pagado */}
            <div className="land-field-group">
              <label>Impuesto Pagado ($)</label>
              <input
                type="number"
                step="0.01"
                name="impuestoPagado"
                value={formData.impuestoPagado}
                onChange={handleChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Costo Transporte */}
            <div className="land-field-group">
              <label>Costo de Transporte ($)</label>
              <input
                type="number"
                step="0.01"
                name="costoTransporte"
                value={formData.costoTransporte}
                onChange={handleChange}
                placeholder="0.00"
                className="land-input-field"
              />
            </div>

            {/* Precio Final */}
            <div className="land-field-group">
              <label>Precio Final de Venta ($) *</label>
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

            {/* Fecha de Compra */}
            <div className="land-field-group">
              <label>Fecha de Compra</label>
              <input
                type="date"
                name="fechaCompra"
                value={formData.fechaCompra}
                onChange={handleChange}
                className="land-input-field"
              />
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