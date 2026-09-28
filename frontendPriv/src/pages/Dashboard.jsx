import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom"; // Importamos Link para navegación interna
import Sidebar from "../components/Sidebar/Sidebar";
import TopBar from "../components/TopBar/TopBar";
import DashboardCard from "../components/DashboardCompt/DashboardCard";
import SalesChart from "../components/DashboardCompt/SalesChart";
import "../styles/DashboardCss/dashboard.css";

const Dashboard = () => {
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalLands, setTotalLands] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [customersRes, productsRes, landsRes] = await Promise.all([
          fetch("https://tractorimport.onrender.com/api/customers", { credentials: "include" }),
          fetch("https://tractorimport.onrender.com/api/products", { credentials: "include" }),
          fetch("https://tractorimport.onrender.com/api/lands", { credentials: "include" }),
        ]);

        const customersData = await customersRes.json();
        const productsData = await productsRes.json();
        const landsData = await landsRes.json();

        // Validación para array directo u objeto con propiedad
        const customersArr = Array.isArray(customersData) ? customersData : customersData.customers || [];
        const productsArr = Array.isArray(productsData) ? productsData : productsData.products || [];
        const landsArr = Array.isArray(landsData) ? landsData : landsData.lands || [];

        setTotalCustomers(customersArr.length);
        setTotalProducts(productsArr.length);
        setTotalLands(landsArr.length);
      } catch (error) {
        console.error("Error al cargar datos del dashboard:", error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="topbar-wrapper">
        <TopBar />
      </div>

      <div className="main-content">
        {/* Tarjetas Principales de Indicadores */}
        <div className="cards-container3">
          <DashboardCard
            value={totalCustomers}
            label="Total de Clientes"
            img="/Products/clientesDash.png"
          />
          <DashboardCard
            value={totalProducts}
            label="Total de Maquinaria"
            img="/Products/logo-productos.png"
          />
          <DashboardCard
            value={totalLands}
            label="Total de Terrenos"
            img="/Products/total-de-ventas-logo.png"
          />
        </div>

        {/* Sección Inferior: Gráfico + Card de la Calculadora */}
        <div
          className="bottom-section"
          style={{
            display: "flex",
            gap: "20px",
            alignItems: "stretch",
            flexWrap: "wrap",
            marginTop: "20px",
          }}
        >
          {/* Gráfico de Ventas */}
          <div style={{ flex: "1 1 60%", minWidth: "300px" }}>
            <SalesChart />
          </div>

          {/* Card Flotante para la Calculadora */}
          <div
            style={{
              flex: "1 1 300px",
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              padding: "24px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              alignItems: "center",
              textAlign: "center",
              border: "1px solid #f1f5f9",
            }}
          >
            <div style={{ width: "100%" }}>
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "50%",
                  backgroundColor: "#e0f2fe",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  margin: "0 auto 16px auto",
                }}
              >
                <svg
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#0284c7"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="4" y="2" width="16" height="20" rx="2" />
                  <line x1="8" y1="6" x2="16" y2="6" />
                  <line x1="16" y1="14" x2="16" y2="18" />
                  <path d="M16 10h.01" />
                  <path d="M12 10h.01" />
                  <path d="M8 10h.01" />
                  <path d="M12 14h.01" />
                  <path d="M8 14h.01" />
                  <path d="M12 18h.01" />
                  <path d="M8 18h.01" />
                </svg>
              </div>
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "bold",
                  color: "#1e293b",
                  marginBottom: "8px",
                }}
              >
                Calculadora Financiera
              </h3>
              <p style={{ fontSize: "0.9rem", color: "#64748b", lineHeight: "1.4" }}>
                Accede a la herramienta para calcular costos, impuestos y valores de importación.
              </p>
            </div>

            <Link
              to="/Calculadora" // Cambia esta ruta por la ruta exacta de tu calculadora
              style={{
                width: "100%",
                marginTop: "20px",
                padding: "12px",
                backgroundColor: "#1C4024",
                color: "#ffffff",
                borderRadius: "8px",
                fontWeight: "600",
                textDecoration: "none",
                display: "inline-block",
                boxSizing: "border-box",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2d5e38")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#1C4024")}
            >
              Ir a la Calculadora →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;