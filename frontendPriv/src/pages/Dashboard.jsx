import React, { useEffect, useState } from "react";
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

        // Validación para array directo u objeto con propiedad (p. ej. productsData.products)
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

        <div className="bottom-section">
          
          <SalesChart />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;