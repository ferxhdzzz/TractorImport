import React, { useState } from "react";
import Swal from "sweetalert2";
import Titulo from "../components/Componte-hook/Titulos";
import SubTitulo from "../components/Componte-hook/SubTitulo";
import Button from "../components/Componte-hook/Button";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/TopBar/TopBar";
import EditArticuloVarios from "../hooks/Unified/EditArticuloVario";
import AddArticuloVariosModal from "../hooks/Unified/AddArticuloVario";
import { useDataArticuloVarios } from "../hooks/Unified/useDataArticulosVarios"; // Hook personalizado para Artículos Varios

import "../styles/PageLands.css";

const ArticulosVarios = () => {
  const {
    articulos,
    deleteArticulo,
    fetchArticulos,
    loading,
  } = useDataArticuloVarios();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingArticuloId, setEditingArticuloId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const safeArticulos = Array.isArray(articulos) ? articulos : [];

  // Función para formatear números a moneda con comas (Ej. 13500 -> "13,500.00")
  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Lógica de filtrado por nombre de artículo o fecha de creación
  const filteredArticulos = safeArticulos.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const matchesName = item.nombreArticulo?.toLowerCase().includes(term);

    const formattedDate = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString("es-SV", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      : "";
    const matchesDate =
      formattedDate.includes(term) || String(item.createdAt || "").includes(term);

    return matchesName || matchesDate;
  });

  const handleDelete = async (id, nombre) => {
    const result = await Swal.fire({
      title: `¿Eliminar ${nombre || "este artículo"}?`,
      text: "Esta acción no se puede deshacer.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#be185d",
      cancelButtonColor: "#aaa",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await deleteArticulo(id);
        Swal.fire({
          icon: "success",
          title: "Artículo eliminado",
          text: "El registro fue eliminado correctamente.",
          confirmButtonColor: "#be185d",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al eliminar el artículo:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el artículo.",
          confirmButtonColor: "#be185d",
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
            <Titulo>Gestión de Artículos Varios</Titulo>
            <SubTitulo>Administra precios unitarios, impuestos, transporte y precios finales</SubTitulo>
          </div>

          {/* Barra Superior: Botón Agregar Artículo y Búsqueda */}
          <div className="land-top-actions">
            <button
              type="button"
              className="land-add-btn"
              onClick={() => setIsAddModalOpen(true)}
            >
              <span style={{ fontSize: "1.2rem", lineHeight: 0 }}>+</span> Agregar Artículo
            </button>

            <div className="land-search-wrapper">
              <input
                type="text"
                className="land-search-input"
                placeholder="Buscar por nombre de artículo o fecha (DD/MM/AAAA)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Lista de Artículos Varios */}
          <div className="products-list">
            {loading ? (
              <div className="no-products-message">
                <p>Cargando lista de artículos...</p>
              </div>
            ) : filteredArticulos.length === 0 ? (
              <div className="no-products-message">
                <p>No hay registros de artículos que coincidan con la búsqueda.</p>
              </div>
            ) : (
              filteredArticulos.map((item) => {
                const fechaFormateada = item.createdAt
                  ? new Date(item.createdAt).toLocaleDateString("es-SV", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "No especificada";

                return (
                  <div key={item._id} className="product-card">
                    {/* Encabezado de la Tarjeta */}
                    <div className="product-card-header">
                      <h3 className="product-title">
                        {item.nombreArticulo || "Artículo Sin Nombre"}
                      </h3>
                      <span className="product-date-badge">
                        Registro: {fechaFormateada}
                      </span>
                    </div>

                    {/* Contenido / Desglose Financiero */}
                    <div className="product-card-body">
                      <div className="product-details-section">
                        <p>
                          <strong>Precio Unitario:</strong> ${formatCurrency(item.precioUnitario)}
                        </p>
                        <p>
                          <strong>Impuestos:</strong> ${formatCurrency(item.impuestos)}
                        </p>
                      </div>

                      <div className="product-details-section">
                        <p>
                          <strong>Transporte:</strong> ${formatCurrency(item.transporte)}
                        </p>
                      </div>

                      {/* Total / Precio Final */}
                      <div className="product-financial-section">
                        <div className="financial-row total">
                          <span>Precio Final:</span>
                          <span style={{ color: "#059669", fontWeight: "bold" }}>
                            ${formatCurrency(item.precioFinal)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="product-actions">
                      <Button onClick={() => setEditingArticuloId(item._id)}>
                        Editar
                      </Button>
                      <Button
                        onClick={() => handleDelete(item._id, item.nombreArticulo)}
                        style={{ backgroundColor: "#dc3545" }}
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

      {/* Modales */}
      {editingArticuloId && (
        <EditArticuloVarios
          articuloId={editingArticuloId}
          onClose={() => setEditingArticuloId(null)}
          refreshArticulos={fetchArticulos}
        />
      )}

      {isAddModalOpen && (
        <AddArticuloVariosModal
          onClose={() => setIsAddModalOpen(false)}
          refreshArticulos={fetchArticulos}
        />
      )}
    </div>
  );
};

export default ArticulosVarios;