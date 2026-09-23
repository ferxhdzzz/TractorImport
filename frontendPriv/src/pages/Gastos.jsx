import React, { useState } from "react";
import Swal from "sweetalert2";
import Titulo from "../components/Componte-hook/Titulos";
import SubTitulo from "../components/Componte-hook/SubTitulo";
import Button from "../components/Componte-hook/Button";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/TopBar/TopBar";
import EditGasto from "../hooks/Unified/EditGasto";
import AddGastoModal from "../hooks/Unified/AddGasto";
import { useDataGasto } from "../hooks/Unified/useDataGastos"; // Hook para obtener y manejar gastos

import "../styles/PageLands.css";

const Gastos = () => {
  const { gastos, deleteGasto, fetchGastos, loading } = useDataGasto();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingGastoId, setEditingGastoId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const safeGastos = Array.isArray(gastos) ? gastos : [];

  // Función para formatear números a moneda con comas (Ej. 13500 -> "13,500.00")
  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Lógica de filtrado por observaciones, tipo de período o fecha del gasto
  const filteredGastos = safeGastos.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const matchesObs = item.observaciones?.toLowerCase().includes(term);
    const matchesPeriodo = item.tipoPeriodo?.toLowerCase().includes(term);

    const formattedDate = item.fechaGasto
      ? new Date(item.fechaGasto).toLocaleDateString("es-SV", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      : "";
    const matchesDate = formattedDate.includes(term) || String(item.fechaGasto || "").includes(term);

    return matchesObs || matchesPeriodo || matchesDate;
  });

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "¿Eliminar este registro de gasto?",
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
        await deleteGasto(id);
        Swal.fire({
          icon: "success",
          title: "Gasto eliminado",
          text: "El registro fue eliminado correctamente.",
          confirmButtonColor: "#be185d",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        console.error("Error al eliminar el gasto:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo eliminar el gasto.",
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
            <Titulo>Gestión de Gastos de Operación</Titulo>
            <SubTitulo>Administra viáticos, pasajes, combustible, hospedajes y transporte</SubTitulo>
          </div>

          {/* Barra Superior: Botón Agregar Gasto y Búsqueda */}
          <div className="land-top-actions">
            <button
              type="button"
              className="land-add-btn"
              onClick={() => setIsAddModalOpen(true)}
            >
              <span style={{ fontSize: "1.2rem", lineHeight: 0 }}>+</span> Agregar Gasto
            </button>

            <div className="land-search-wrapper">
              <input
                type="text"
                className="land-search-input"
                placeholder="Buscar por notas, tipo de período o fecha (DD/MM/AAAA)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Lista de Gastos */}
          <div className="products-list">
            {loading ? (
              <div className="no-products-message">
                <p>Cargando lista de gastos...</p>
              </div>
            ) : filteredGastos.length === 0 ? (
              <div className="no-products-message">
                <p>No hay registros de gastos que coincidan con la búsqueda.</p>
              </div>
            ) : (
              filteredGastos.map((item) => {
                const fechaFormateada = item.fechaGasto
                  ? new Date(item.fechaGasto).toLocaleDateString("es-SV", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "No especificada";

                // Detalle de Pasajes
                const terrestre = item.pasajes?.terrestre || 0;
                const aereo = item.pasajes?.aereo || 0;
                const maritimo = item.pasajes?.maritimo || 0;

                // Total de Pasajes
                const totalPasajes = terrestre + aereo + maritimo;

                return (
                  <div key={item._id} className="product-card">
                    {/* Encabezado del Gasto */}
                    <div className="product-card-header">
                      <h3 className="product-title">
                        Gasto por {item.cantidadPeriodo || 1} {item.tipoPeriodo || "Días"}
                      </h3>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            backgroundColor: "#e0f2fe",
                            color: "#0369a1",
                          }}
                        >
                          {item.tipoPeriodo === "Horas" ? "Por Horas" : "Por Días"}
                        </span>
                        <span className="product-date-badge">Fecha: {fechaFormateada}</span>
                      </div>
                    </div>

                    {/* Contenido en Grid */}
                    <div className="product-card-body">
                      {/* Columna 1: Período y Operación */}
                      <div className="product-details-section">
                        <p>
                          <strong>Costo Período ({item.tipoPeriodo}):</strong> ${formatCurrency(item.costoPeriodo)}
                        </p>
                        <p>
                          <strong>Combustible:</strong> ${formatCurrency(item.combustible)}
                        </p>
                        <p>
                          <strong>Alquiler Transporte:</strong> ${formatCurrency(item.alquilerTransporte)}
                        </p>
                      </div>

                      {/* Columna 2: Pasajes y Hospedaje */}
                      <div className="product-details-section">
                        <p>
                          <strong>Pasaje Terrestre:</strong> ${formatCurrency(terrestre)}
                        </p>
                        <p>
                          <strong>Pasaje Aéreo:</strong> ${formatCurrency(aereo)}
                        </p>
                        <p>
                          <strong>Pasaje Marítimo:</strong> ${formatCurrency(maritimo)}
                        </p>
                        <p>
                          <strong>Hospedaje:</strong> ${formatCurrency(item.hospedaje)}
                        </p>
                      </div>

                      {/* Columna 3: Financiero / Total General */}
                      <div className="product-financial-section">
                        <div className="financial-row">
                          <span>Subtotal Operación:</span>
                          <strong>
                            ${formatCurrency((item.costoPeriodo || 0) + (item.combustible || 0))}
                          </strong>
                        </div>
                        <div className="financial-row">
                          <span>Total Pasajes:</span>
                          <strong>${formatCurrency(totalPasajes)}</strong>
                        </div>
                        <div className="financial-row">
                          <span>Hospedaje + Alquiler:</span>
                          <strong>
                            ${formatCurrency((item.hospedaje || 0) + (item.alquilerTransporte || 0))}
                          </strong>
                        </div>
                        <div className="financial-row total">
                          <span>Total General:</span>
                          <span style={{ color: "#059669" }}>
                            ${formatCurrency(item.totalGasto)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Observaciones */}
                    {item.observaciones && (
                      <div className="product-observaciones">
                        <strong>Notas / Detalles:</strong> {item.observaciones}
                      </div>
                    )}

                    {/* Botones de Acción */}
                    <div className="product-actions">
                      <Button onClick={() => setEditingGastoId(item._id)}>Editar</Button>
                      <Button
                        onClick={() => handleDelete(item._id)}
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
      {editingGastoId && (
        <EditGasto
          gastoId={editingGastoId}
          onClose={() => setEditingGastoId(null)}
          refreshGastos={fetchGastos}
        />
      )}

      {isAddModalOpen && (
        <AddGastoModal
          onClose={() => setIsAddModalOpen(false)}
          refreshGastos={fetchGastos}
        />
      )}
    </div>
  );
};

export default Gastos;