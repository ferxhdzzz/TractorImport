import React, { useState } from "react";
import Swal from "sweetalert2";
import Titulo from "../components/Componte-hook/Titulos";
import SubTitulo from "../components/Componte-hook/SubTitulo";
import Sidebar from "../components/Sidebar/Sidebar";
import Topbar from "../components/TopBar/TopBar";
import EditCustomer from "../hooks/Unified/EditCustomers";
import AddCustomer from "../hooks/Unified/AddCustomer"; // Ajusta esta ruta según la ubicación real de tu modal
import useFetchCustomers from "../hooks/Customers/useFetchCustomers";
import useCustomerAction from "../hooks/Customers/useCustomerAction";

import "../styles/PaginaCustomers.css";

const Customers = () => {
  const { customers, getCustomers, loading } = useFetchCustomers();
  const { deleteCustomer } = useCustomerAction(getCustomers);

  const [searchTerm, setSearchTerm] = useState("");
  const [editingCustomerId, setEditingCustomerId] = useState(null);
  const [isAddCustomerOpen, setIsAddCustomerOpen] = useState(false);

  const safeCustomers = Array.isArray(customers) ? customers : [];

  // Función para formatear números a moneda con comas (Ej. 13500 -> "13,500.00")
  const formatCurrency = (amount) => {
    const num = Number(amount) || 0;
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Lógica de filtrado por búsqueda (Cliente, Maquinaria o Fecha)
  const filteredCustomers = safeCustomers.filter((item) => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;

    // 1. Coincidencia por Nombre de Cliente
    const matchesClient = item.nombreCliente?.toLowerCase().includes(term);

    // 2. Coincidencia por Nombre de Maquinaria
    const machineryName =
      typeof item.maquinariaComprada === "object" && item.maquinariaComprada !== null
        ? item.maquinariaComprada?.nombreMaquinaria || item.maquinariaComprada?.name
        : String(item.maquinariaComprada || "");
    const matchesMachinery = machineryName?.toLowerCase().includes(term);

    // 3. Coincidencia por Fecha de Compra
    const formattedDate = item.fechaCompra
      ? new Date(item.fechaCompra).toLocaleDateString("es-SV", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        })
      : "";
    const matchesDate = formattedDate.includes(term) || String(item.fechaCompra || "").includes(term);

    return matchesClient || matchesMachinery || matchesDate;
  });

  const handleDelete = async (id, nombre) => {
    const result = await Swal.fire({
      title: `¿Eliminar registro de ${nombre || "este cliente"}?`,
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
        await deleteCustomer(id);
        Swal.fire({
          icon: "success",
          title: "Cliente eliminado",
          text: "El registro fue eliminado correctamente del sistema.",
          confirmButtonColor: "#be185d",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (error) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "No se pudo eliminar el cliente.",
          confirmButtonColor: "#be185d",
        });
      }
    }
  };

  return (
    <div className="customer-dashboard-container">
      <Sidebar />
      <div className="customer-main-content">
        <div className="customer-topbar-wrapper">
          <Topbar />
        </div>

        <div className="customer-container">
          <div className="customer-header">
            <Titulo>Gestión de Clientes y Ventas</Titulo>
            <SubTitulo>Administra las ventas realizadas, pagos de abonos y saldos remanentes</SubTitulo>
          </div>

          {/* Barra Superior: Botón para Abrir Modal Agregar Cliente y Búsqueda */}
          <div
            className="land-top-actions"
            style={{ display: "flex", gap: "15px", marginBottom: "20px", alignItems: "center" }}
          >
            <button
              type="button"
              className="land-add-btn"
              onClick={() => setIsAddCustomerOpen(true)}
            >
              <span style={{ fontSize: "1.2rem", lineHeight: 0 }}>+</span> Agregar Cliente / Venta
            </button>

            <div className="customer-search-wrapper" style={{ flex: 1 }}>
              <input
                type="text"
                className="customer-search-input"
                placeholder="Buscar por cliente, maquinaria o fecha (DD/MM/AAAA)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Lista de Clientes / Registros de Venta */}
          <div className="customer-list">
            {loading ? (
              <div className="customer-no-data">
                <p>Cargando lista de clientes...</p>
              </div>
            ) : filteredCustomers.length === 0 ? (
              <div className="customer-no-data">
                <p>No hay registros de clientes o ventas disponibles.</p>
              </div>
            ) : (
              filteredCustomers.map((item) => {
                // Formateo de fechas
                const fechaCompraFormateada = item.fechaCompra
                  ? new Date(item.fechaCompra).toLocaleDateString("es-SV", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "No especificada";

                const fechaAbonoFormateada = item.fechaAbono
                  ? new Date(item.fechaAbono).toLocaleDateString("es-SV", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "N/A";

                const maquinariaNombre =
                  typeof item.maquinariaComprada === "object" && item.maquinariaComprada !== null
                    ? item.maquinariaComprada.nombreMaquinaria || item.maquinariaComprada.name || "Sin nombre"
                    : "ID: " + String(item.maquinariaComprada || "No asignada");

                const numContenedor =
                  typeof item.maquinariaComprada === "object" && item.maquinariaComprada?.numeroContenedor
                    ? ` (Contenedor: ${item.maquinariaComprada.numeroContenedor})`
                    : "";

                return (
                  <div key={item._id} className="customer-card">
                    {/* Encabezado */}
                    <div className="customer-card-header">
                      <h3 className="customer-title">{item.nombreCliente || "Cliente Sin Nombre"}</h3>
                      <span className="customer-date-badge">Venta: {fechaCompraFormateada}</span>
                    </div>

                    {/* Contenido en Grid Parejo */}
                    <div className="customer-card-grid">
                      <div className="customer-data-block">
                        <p>
                          <strong>Maquinaria Comprada:</strong>
                        </p>
                        <p>{maquinariaNombre} {numContenedor}</p>
                      </div>

                      <div className="customer-data-block">
                        <p>
                          <strong>Precio Final:</strong>
                        </p>
                        <p style={{ color: "#059669", fontWeight: "700", fontSize: "1.05rem" }}>
                          ${formatCurrency(item.precioFinal)}
                        </p>
                      </div>

                      <div className="customer-data-block">
                        <p>
                          <strong>Método de Pago:</strong>
                        </p>
                        <p>{item.metodoPago || "Transferencia"}</p>
                      </div>

                      {/* Bloque Destacado de Abonos */}
                      <div className="customer-abono-box">
                        <div className="customer-abono-detail">
                          <p style={{ margin: 0 }}>
                            <strong>Aplica Abono Inicial:</strong> {item.aplicaAbono ? "Sí" : "No"}
                          </p>
                          {item.aplicaAbono && (
                            <>
                              <p style={{ margin: 0 }}>
                                <strong>Pagado:</strong> ${formatCurrency(item.abonoPagado)}
                              </p>
                              <p style={{ margin: 0 }}>
                                <strong>Fecha:</strong> {fechaAbonoFormateada}
                              </p>
                            </>
                          )}
                        </div>

                        <div
                          className={`customer-remanente-badge ${
                            (item.remanente || 0) > 0 ? "pendiente" : "pagado"
                          }`}
                        >
                          Saldo Remanente: ${formatCurrency(item.remanente)}
                        </div>
                      </div>

                      {/* Observaciones */}
                      {item.observaciones && (
                        <div className="customer-observaciones">
                          <strong>Observaciones:</strong> {item.observaciones}
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="customer-actions">
                      <button
                        className="customer-btn customer-btn-edit"
                        onClick={() => setEditingCustomerId(item._id)}
                      >
                        Editar
                      </button>
                      <button
                        className="customer-btn customer-btn-delete"
                        onClick={() => handleDelete(item._id, item.nombreCliente)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Modal para Agregar Cliente */}
      {isAddCustomerOpen && (
        <AddCustomer
          onClose={() => setIsAddCustomerOpen(false)}
          refreshCustomers={getCustomers}
        />
      )}

      {/* Modal de Edición */}
      {editingCustomerId && (
        <EditCustomer
          customerId={editingCustomerId}
          onClose={() => setEditingCustomerId(null)}
          refreshCustomers={getCustomers}
        />
      )}
    </div>
  );
};

export default Customers;