import React, { useState } from "react";
import Swal from "sweetalert2";
import Titulo from "../components/Componte-hook/Titulos";
import SubTitulo from "../components/Componte-hook/SubTitulo";
import Button from "../components/Componte-hook/Button";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/TopBar/TopBar";
import EditLand from "../hooks/Unified/EditLans"; // Modal para editar terreno
import AddLandModal from "../hooks/Unified/AddLandModal"; // Modal para agregar terreno
import { useDataLand } from "../hooks/Unified/UseDataLands";

import "../styles/PageLands.css";

const Lands = () => {
  const { lands, deleteLand, fetchLands, loading } = useDataLand();

  const [searchTerm, setSearchTerm] = useState("");
  const [editingLandId, setEditingLandId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const safeLands = Array.isArray(lands) ? lands : [];

  // Lógica de filtrado por Nombre de cliente, Dirección/Dimensión o Fecha de Venta
  const filteredLands = safeLands.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    const matchesClient = item.nombreCliente?.toLowerCase().includes(term);
    const matchesAddress = item.direccion?.toLowerCase().includes(term);
    const matchesDimension = item.dimensionTerreno?.toLowerCase().includes(term);

    const formattedDate = item.fechaVenta
      ? new Date(item.fechaVenta).toLocaleDateString("es-SV", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      : "";
    const matchesDate = formattedDate.includes(term) || String(item.fechaVenta || "").includes(term);

    return matchesClient || matchesAddress || matchesDimension || matchesDate;
  });

  const handleDelete = async (id, cliente) => {
    const result = await Swal.fire({
      title: `¿Eliminar terreno de ${cliente || "este cliente"}?`,
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
        await deleteLand(id);
      } catch (error) {
        console.error("Error al eliminar terreno:", error);
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
            <Titulo>Inventario y Ventas de Terrenos</Titulo>
            <SubTitulo>Gestiona ventas al contado, promesas de venta, abonos y cuotas mensuales</SubTitulo>
          </div>

          {/* Barra Superior: Botón Agregar Terreno y Barra de Búsqueda Estética */}
          <div className="land-top-actions">
            <button
              type="button"
              className="land-add-btn"
              onClick={() => setIsAddModalOpen(true)}
            >
              <span style={{ fontSize: "1.2rem", lineHeight: 0 }}>+</span> Agregar Terreno
            </button>

            <div className="land-search-wrapper">
              <input
                type="text"
                className="land-search-input"
                placeholder="Buscar por cliente, dirección o fecha (DD/MM/AAAA)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Lista de Terrenos */}
          <div className="products-list">
            {loading ? (
              <div className="no-products-message">
                <p>Cargando lista de terrenos...</p>
              </div>
            ) : filteredLands.length === 0 ? (
              <div className="no-products-message">
                <p>No hay terrenos registrados que coincidan con la búsqueda.</p>
              </div>
            ) : (
              filteredLands.map((item) => {
                const fechaFormateada = item.fechaVenta
                  ? new Date(item.fechaVenta).toLocaleDateString("es-SV", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "No especificada";

                const esPromesa = item.tipoVenta === "Promesa";
                const remanenteCalculado =
                  item.saldoRemanente ?? Math.max(0, (item.costoTerreno || 0) - (item.montoAbonado || 0));

                return (
                  <div key={item._id} className="product-card">
                    {/* Encabezado del Terreno */}
                    <div className="product-card-header">
                      <h3 className="product-title">{item.nombreCliente || "Cliente Sin Nombre"}</h3>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: "bold",
                            padding: "4px 10px",
                            borderRadius: "12px",
                            backgroundColor: esPromesa ? "#fef3c7" : "#d1fae5",
                            color: esPromesa ? "#b45309" : "#047857",
                          }}
                        >
                          {esPromesa ? "Promesa de Venta" : "Venta Contado"}
                        </span>
                        <span className="product-date-badge">Fecha: {fechaFormateada}</span>
                      </div>
                    </div>

                    {/* Contenido en Grid */}
                    <div className="product-card-body">
                      <div className="product-details-section">
                        <p>
                          <strong>Teléfono:</strong> {item.telefono || "N/A"}
                        </p>
                        <p>
                          <strong>Dirección:</strong> {item.direccion || "No registrada"}
                        </p>
                        <p>
                          <strong>Dimensión:</strong> {item.dimensionTerreno || "No especificada"}
                        </p>
                      </div>

                      <div className="product-details-section">
                        {esPromesa ? (
                          <>
                            <p>
                              <strong>Número de Cuotas:</strong> {item.numeroCuotas ?? "N/A"}
                            </p>
                            <p>
                              <strong>Monto Cuota Mensual:</strong> ${item.montoCuotaMensual ?? 0}
                            </p>
                          </>
                        ) : (
                          <p style={{ color: "#047857", fontWeight: "600" }}>
                            <strong>Modalidad:</strong> Pago Directo / Contado
                          </p>
                        )}
                        <p>
                          <strong>Monto Abonado:</strong> ${item.montoAbonado ?? 0}
                        </p>
                      </div>

                      <div className="product-financial-section">
                        <div className="financial-row">
                          <span>Costo Terreno:</span>
                          <strong>${item.costoTerreno ?? 0}</strong>
                        </div>
                        <div className="financial-row">
                          <span>Total Abonado:</span>
                          <strong>${item.montoAbonado ?? 0}</strong>
                        </div>
                        <div className="financial-row total">
                          <span>Saldo Remanente:</span>
                          <span style={{ color: remanenteCalculado > 0 ? "#dc2626" : "#2563eb" }}>
                            ${remanenteCalculado}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Observaciones */}
                    {item.observaciones && (
                      <div className="product-observaciones">
                        <strong>Observaciones:</strong> {item.observaciones}
                      </div>
                    )}

                    {/* Botones de Acción */}
                    <div className="product-actions">
                      <Button onClick={() => setEditingLandId(item._id)}>Editar</Button>
                      <Button
                        onClick={() => handleDelete(item._id, item.nombreCliente)}
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
      {editingLandId && (
        <EditLand
          landId={editingLandId}
          onClose={() => setEditingLandId(null)}
          refreshLands={fetchLands}
        />
      )}

      {isAddModalOpen && (
        <AddLandModal
          onClose={() => setIsAddModalOpen(false)}
          refreshLands={fetchLands}
        />
      )}
    </div>
  );
};

export default Lands;