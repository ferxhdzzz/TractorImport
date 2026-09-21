import React, { useState } from "react";
import Swal from "sweetalert2";
import Titulo from "../components/Componte-hook/Titulos";
import SubTitulo from "../components/Componte-hook/SubTitulo";
import Button from "../components/Componte-hook/Button";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/TopBar/TopBar";
import EditProduct from "../hooks/Unified/EditProduct";
import ImageSlider from "../components/Componte-hook/ImageSlider";
import { useDataProduct } from "../hooks/Unified/UseDataProduct";

import "../styles/PaginaProduct.css";

const Products = () => {
  const { products: inventory, deleteProduct: deleteInventory, fetchProducts: fetchInventory } = useDataProduct();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingProductId, setEditingProductId] = useState(null);

  const safeInventory = Array.isArray(inventory) ? inventory : [];

  // Lógica de filtrado por búsqueda (Nombre de maquinaria o número de contenedor)
  const filteredInventory = safeInventory.filter((item) => {
    const term = searchTerm.toLowerCase();
    const matchesName = item.nombreMaquinaria?.toLowerCase().includes(term);
    const matchesContainer = item.numeroContenedor?.toLowerCase().includes(term);
    return matchesName || matchesContainer;
  });

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
            <SubTitulo>Administra la maquinaria y tractores importados</SubTitulo>
          </div>

          {/* Barra de búsqueda con la clase estilizada */}
          <div className="product-search-wrapper">
            <input
              type="text"
              className="product-search-input"
              placeholder="Buscar por maquinaria o # contenedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Lista de Maquinaria en Inventario */}
          <div className="products-list">
            {filteredInventory.length === 0 ? (
              <div className="no-products-message">
                <p>No hay maquinaria registrada en el inventario.</p>
              </div>
            ) : (
              filteredInventory.map((item) => {
                // Formateo de fecha
                const fechaFormateada = item.fechaCompra
                  ? new Date(item.fechaCompra).toLocaleDateString("es-SV", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "No especificada";

                return (
                  <div key={item._id} className="product-card">
                    {/* Encabezado con Nombre y Badge de Fecha */}
                    <div className="product-card-header">
                      <h3 className="product-title">{item.nombreMaquinaria || "Maquinaria sin nombre"}</h3>
                      <span className="product-date-badge">Compra: {fechaFormateada}</span>
                    </div>

                    {/* Cuerpo distribuido en 3 columnas */}
                    <div className="product-card-body">
                      {/* Columna 1: Galería / Imágenes */}
                      <div className="product-image-section">
                        {Array.isArray(item.images) && item.images.length > 0 ? (
                          <ImageSlider images={item.images} name={item.nombreMaquinaria} />
                        ) : item.imagenUrl ? (
                          <ImageSlider images={[item.imagenUrl]} name={item.nombreMaquinaria} />
                        ) : (
                          <p className="no-image">Sin imágenes</p>
                        )}
                      </div>

                      {/* Columna 2: Descripción y Serie */}
                      <div className="product-details-section">
                        <p>
                          <strong>Serie / Contenedor:</strong> {item.numeroContenedor || "N/A"}
                        </p>
                        <p>
                          <strong>Descripción:</strong> {item.descripcion || "Sin descripción disponible."}
                        </p>
                      </div>

                      {/* Columna 3: Desglose Financiero */}
                      <div className="product-financial-section">
                        <div className="financial-row">
                          <span>Costo Maquinaria:</span>
                          <strong>${item.costoMaquinaria ?? 0}</strong>
                        </div>
                        <div className="financial-row">
                          <span>Costo Transporte:</span>
                          <strong>${item.costoTransporte ?? 0}</strong>
                        </div>
                        <div className="financial-row">
                          <span>Impuestos:</span>
                          <strong>${item.impuestoPagado ?? 0}</strong>
                        </div>
                        <div className="financial-row total">
                          <span>Precio Final:</span>
                          <span>${item.precioFinal ?? 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Observaciones (si existen) */}
                    {item.observaciones && (
                      <div className="product-observaciones">
                        <strong>Observaciones:</strong> {item.observaciones}
                      </div>
                    )}

                    {/* Botones de Acción */}
                    <div className="product-actions">
                      <Button
                        onClick={() => setEditingProductId(item._id)}
                        style={{ backgroundColor: "#4C8F3F", color: "#ffffff", borderRadius: "6px" }}
                      >
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDelete(item._id, item.nombreMaquinaria)}
                        style={{ backgroundColor: "#dc3545", color: "#ffffff", borderRadius: "6px" }}
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

      {editingProductId && (
        <EditProduct
          productId={editingProductId}
          onClose={() => setEditingProductId(null)}
          refreshProducts={fetchInventory}
        />
      )}
    </div>
  );
};

export default Products;