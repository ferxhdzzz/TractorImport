
import React, { useState } from "react";
import Swal from "sweetalert2";
import Titulo from "../components/Componte-hook/Titulos";
import SubTitulo from "../components/Componte-hook/SubTitulo";
import Button from "../components/Componte-hook/Button";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/TopBar/TopBar";
import EditProduct from "../hooks/Unified/EditProduct";
import { useDataProduct } from "../hooks/Unified/UseDataProduct";

import "../styles/PaginaProduct.css";

const Products = () => {
  const {
    products: inventory,
    deleteProduct: deleteInventory,
    fetchProducts: fetchInventory,
  } = useDataProduct();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);

  // Estados para el Modal Lightbox con Zoom y Pan
  const [selectedImageModal, setSelectedImageModal] = useState(null);
  const [zoomScale, setZoomScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const safeInventory = Array.isArray(inventory) ? inventory : [];

  // =====================================================
  // FORMATEAR MONEDA
  // =====================================================
  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;

    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // =====================================================
  // ABRIR IMAGEN EN MODAL
  // =====================================================
  const handleOpenImageModal = (src) => {
    setSelectedImageModal(src);
    setZoomScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // =====================================================
  // CERRAR MODAL
  // =====================================================
  const handleCloseImageModal = () => {
    setSelectedImageModal(null);
    setZoomScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // =====================================================
  // ZOOM
  // =====================================================
  const handleZoomIn = () => {
    setZoomScale((prev) => Math.min(prev + 0.3, 4));
  };

  const handleZoomOut = () => {
    setZoomScale((prev) => Math.max(prev - 0.3, 1));
  };

  const handleResetZoom = () => {
    setZoomScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // =====================================================
  // ZOOM CON RUEDA DEL MOUSE
  // =====================================================
  const handleWheelZoom = (e) => {
    e.preventDefault();

    if (e.deltaY < 0) {
      setZoomScale((prev) => Math.min(prev + 0.2, 4));
    } else {
      setZoomScale((prev) => {
        const newScale = Math.max(prev - 0.2, 1);

        if (newScale === 1) {
          setPosition({ x: 0, y: 0 });
        }

        return newScale;
      });
    }
  };

  // =====================================================
  // ARRASTRAR IMAGEN CON ZOOM
  // =====================================================
  const handleMouseDown = (e) => {
    if (zoomScale > 1) {
      setIsDragging(true);

      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomScale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // =====================================================
  // FILTRADO POR BÚSQUEDA
  // =====================================================
  const filteredInventory = safeInventory.filter((item) => {
    const term = searchTerm.toLowerCase();

    const matchesName = item.nombreMaquinaria
      ?.toLowerCase()
      .includes(term);

    const matchesContainer = item.numeroContenedor
      ?.toLowerCase()
      .includes(term);

    return matchesName || matchesContainer;
  });

  // =====================================================
  // ELIMINAR MAQUINARIA
  // =====================================================
  const handleDelete = async (id, nombre) => {
    const result = await Swal.fire({
      title: `¿Eliminar ${nombre || "esta maquinaria"}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1C4024",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await deleteInventory(id);

        Swal.fire({
          icon: "success",
          title: "Maquinaria eliminada",
          text: "El registro fue eliminado correctamente del inventario.",
          confirmButtonColor: "#4C8F3F",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar la maquinaria.",
          confirmButtonColor: "#1C4024",
        });
      }
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />

      <div className="main-content">
        <div className="topbar-wrapper">
          <Topbar />
        </div>

        <div className="products-container">
          <div className="products-header">
            <Titulo>Inventario de Maquinaria</Titulo>

            <SubTitulo>
              Administra la maquinaria y tractores importados
            </SubTitulo>
          </div>

          {/* Barra de búsqueda */}
          <div className="product-search-wrapper">
            <input
              type="text"
              className="product-search-input"
              placeholder="Buscar por maquinaria o # contenedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Lista de Maquinaria */}
          <div className="products-list">
            {filteredInventory.length === 0 ? (
              <div className="no-products-message">
                <p>
                  No hay maquinaria registrada en el inventario.
                </p>
              </div>
            ) : (
              filteredInventory.map((item) => {
                const fechaFormateada = item.fechaCompra
                  ? new Date(item.fechaCompra).toLocaleDateString(
                      "es-SV",
                      {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      }
                    )
                  : "No especificada";

                return (
                  <div
                    key={item._id}
                    className="product-card"
                  >
                    <div className="product-card-header">
                      <h3 className="product-title">
                        {item.nombreMaquinaria ||
                          "Maquinaria sin nombre"}
                      </h3>

                      <span className="product-date-badge">
                        Compra: {fechaFormateada}
                      </span>
                    </div>

                    <div className="product-card-body">

                      {/* =====================================================
                          IMAGEN ÚNICA DE LA MAQUINARIA
                          ===================================================== */}
                      <div
                        className="product-image-section"
                        onClick={() => {
                          if (item.imagenUrl) {
                            handleOpenImageModal(
                              item.imagenUrl
                            );
                          }
                        }}
                        style={{
                          cursor: item.imagenUrl
                            ? "pointer"
                            : "default",
                        }}
                        title={
                          item.imagenUrl
                            ? "Haz clic para ver la imagen en grande"
                            : ""
                        }
                      >
                        {item.imagenUrl ? (
                          <img
                            src={item.imagenUrl}
                            alt={
                              item.nombreMaquinaria ||
                              "Maquinaria"
                            }
                            className="product-main-image"
                          />
                        ) : (
                          <p className="no-image">
                            Sin imagen
                          </p>
                        )}
                      </div>

                      {/* Detalles */}
                      <div className="product-details-section">
                        <p>
                          <strong>Serie:</strong>{" "}
                          {item.numeroContenedor || "N/A"}
                        </p>

                        <p>
                          <strong>Descripción:</strong>{" "}
                          {item.descripcion ||
                            "Sin descripción disponible."}
                        </p>
                      </div>

                      {/* Desglose Financiero */}
                      <div className="product-financial-section">
                        <div className="financial-row">
                          <span>
                            Costo Maquinaria:
                          </span>

                          <strong>
                            $
                            {formatCurrency(
                              item.costoMaquinaria
                            )}
                          </strong>
                        </div>

                        <div className="financial-row">
                          <span>
                            Costo Transporte:
                          </span>

                          <strong>
                            $
                            {formatCurrency(
                              item.costoTransporte
                            )}
                          </strong>
                        </div>

                        <div className="financial-row">
                          <span>Impuestos:</span>

                          <strong>
                            $
                            {formatCurrency(
                              item.impuestoPagado
                            )}
                          </strong>
                        </div>

                        <div className="financial-row total">
                          <span>Precio Final:</span>

                          <span>
                            $
                            {formatCurrency(
                              item.precioFinal
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Observaciones */}
                    {item.observaciones && (
                      <div className="product-observaciones">
                        <strong>
                          Observaciones:
                        </strong>{" "}
                        {item.observaciones}
                      </div>
                    )}

                    {/* Acciones */}
                    <div className="product-actions">
                      <Button
                        onClick={() =>
                          setEditingProductId(item._id)
                        }
                        style={{
                          backgroundColor: "#4C8F3F",
                          color: "#ffffff",
                          borderRadius: "6px",
                        }}
                      >
                        Editar
                      </Button>

                      <Button
                        onClick={() =>
                          handleDelete(
                            item._id,
                            item.nombreMaquinaria
                          )
                        }
                        style={{
                          backgroundColor: "#dc3545",
                          color: "#ffffff",
                          borderRadius: "6px",
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* =====================================================
          MODAL DE EDICIÓN
          ===================================================== */}
      {editingProductId && (
        <EditProduct
          productId={editingProductId}
          onClose={() =>
            setEditingProductId(null)
          }
          refreshProducts={fetchInventory}
        />
      )}

      {/* =====================================================
          LIGHTBOX MODAL CON ZOOM
          ===================================================== */}
      {selectedImageModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor:
              "rgba(0, 0, 0, 0.9)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 99999,
            overflow: "hidden",
            backdropFilter: "blur(5px)",
          }}
          onClick={handleCloseImageModal}
        >
          {/* Panel de botones */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              display: "flex",
              gap: "10px",
              zIndex: 100001,
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            {/* Zoom + */}
            <button
              type="button"
              onClick={handleZoomIn}
              style={{
                backgroundColor: "#1C4024",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 14px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              title="Acercar (+)"
            >
              +
            </button>

            {/* Zoom - */}
            <button
              type="button"
              onClick={handleZoomOut}
              style={{
                backgroundColor: "#1C4024",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 14px",
                fontSize: "1rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              title="Alejar (-)"
            >
              -
            </button>

            {/* Reset */}
            <button
              type="button"
              onClick={handleResetZoom}
              style={{
                backgroundColor: "#334155",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 12px",
                fontSize: "0.85rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              title="Restablecer vista"
            >
              {Math.round(zoomScale * 100)}%
            </button>

            {/* Cerrar */}
            <button
              type="button"
              onClick={handleCloseImageModal}
              style={{
                backgroundColor: "#164a09",
                color: "#fff",
                border: "none",
                borderRadius: "6px",
                padding: "8px 14px",
                fontSize: "1.1rem",
                fontWeight: "bold",
                cursor: "pointer",
              }}
              title="Cerrar"
            >
              ×
            </button>
          </div>

          {/* Contenedor interactivo */}
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor:
                zoomScale > 1
                  ? isDragging
                    ? "grabbing"
                    : "grab"
                  : "default",
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
            onWheel={handleWheelZoom}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              src={selectedImageModal}
              alt="Maquinaria ampliada"
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                width: "auto",
                height: "auto",
                objectFit: "contain",
                borderRadius: "8px",
                transition: isDragging
                  ? "none"
                  : "transform 0.15s ease-out",
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoomScale})`,
                userSelect: "none",
                WebkitUserDrag: "none",
                boxShadow:
                  "0 10px 30px rgba(0,0,0,0.6)",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;

