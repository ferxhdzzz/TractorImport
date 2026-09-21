import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend
} from "recharts";
import "../../styles/DashboardCss/salesChart.css";

const SalesChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totalSalesValue, setTotalSalesValue] = useState(0);
  const [totalSalesCount, setTotalSalesCount] = useState(0);

  // Función para calcular acumulados
  const calculateCumulativeData = (monthlyData) => {
    let cumulative = 0;
    return monthlyData.map((month) => {
      cumulative += month.ventas;
      return {
        ...month,
        ventasAcumuladas: cumulative,
      };
    });
  };

  // Función para obtener datos reales desde Localhost (Colección Customers)
  const fetchSalesData = async (year) => {
    try {
      setLoading(true);

      // Obtener lista de clientes / ventas desde backend local
      const response = await fetch("http://localhost:4000/api/customers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const customersData = await response.json();
      const allCustomers = Array.isArray(customersData) ? customersData : customersData.customers || [];

      // Inicializar contadores por mes (1 a 12)
      const monthlyValues = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 };
      const monthlyCounts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 };

      let yearSalesCount = 0;
      let yearSalesValue = 0;

      allCustomers.forEach((item) => {
        // Intentar obtener fecha de compra
        const dateRaw = item.fechaCompra || item.createdAt || item.fecha;
        if (!dateRaw) return;

        const saleDate = new Date(dateRaw);
        if (isNaN(saleDate.getTime())) return;

        if (saleDate.getFullYear() === year) {
          const month = saleDate.getMonth() + 1;
          const precio = Number(item.precioFinal) || Number(item.precio) || 0;

          monthlyValues[month] += precio;
          monthlyCounts[month] += 1;

          yearSalesValue += precio;
          yearSalesCount += 1;
        }
      });

      // Mapear nombres de los meses
      const monthNames = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
      
      const enrichedData = monthNames.map((name, index) => {
        const monthNum = index + 1;
        return {
          mes: name,
          ventas: monthlyValues[monthNum],
          cantidadVentas: monthlyCounts[monthNum],
        };
      });

      const dataWithCumulative = calculateCumulativeData(enrichedData);

      setSalesData(dataWithCumulative);
      setTotalSalesValue(yearSalesValue);

      const currentYear = new Date().getFullYear();
      if (year === currentYear) {
        setTotalSalesCount(allCustomers.length);
      } else {
        setTotalSalesCount(yearSalesCount);
      }

      setError(null);
    } catch (err) {
      console.error("Error al cargar ventas en el gráfico:", err);
      setError("Error al cargar los datos de ventas");

      // Datos por defecto vacíos en caso de error
      const fallbackData = [
        { mes: "Ene", ventas: 0, ventasAcumuladas: 0, cantidadVentas: 0 },
        { mes: "Feb", ventas: 0, ventasAcumuladas: 0, cantidadVentas: 0 },
        { mes: "Mar", ventas: 0, ventasAcumuladas: 0, cantidadVentas: 0 },
        { mes: "Abr", ventas: 0, ventasAcumuladas: 0, cantidadVentas: 0 },
        { mes: "May", ventas: 0, ventasAcumuladas: 0, cantidadVentas: 0 },
        { mes: "Jun", ventas: 0, ventasAcumuladas: 0, cantidadVentas: 0 },
        { mes: "Jul", ventas: 0, ventasAcumuladas: 0, cantidadVentas: 0 },
        { mes: "Ago", ventas: 0, ventasAcumuladas: 0, cantidadVentas: 0 },
        { mes: "Sep", ventas: 0, ventasAcumuladas: 0, cantidadVentas: 0 },
        { mes: "Oct", ventas: 0, ventasAcumuladas: 0, cantidadVentas: 0 },
        { mes: "Nov", ventas: 0, ventasAcumuladas: 0, cantidadVentas: 0 },
        { mes: "Dic", ventas: 0, ventasAcumuladas: 0, cantidadVentas: 0 },
      ];
      setSalesData(fallbackData);
      setTotalSalesValue(0);
      setTotalSalesCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSalesData(selectedYear);
  }, [selectedYear]);

  const handleRefresh = () => {
    fetchSalesData(selectedYear);
  };

  const handleYearChange = (event) => {
    setSelectedYear(parseInt(event.target.value));
  };

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div
          className="custom-tooltip"
          style={{
            backgroundColor: "#fff",
            padding: "12px",
            border: "1px solid #CDDACC",
            borderRadius: "6px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <p style={{ margin: "0 0 6px 0", fontWeight: "bold", color: "#1C4024" }}>{`Mes: ${label}`}</p>
          <p style={{ margin: 0, color: "#1C4024" }}>
            {`Valor del mes: $${payload[0]?.value?.toLocaleString() || 0}`}
          </p>
          <p style={{ margin: 0, color: "#4C8F3F" }}>
            {`Total acumulado: $${payload[1]?.value?.toLocaleString() || 0}`}
          </p>
          <p style={{ margin: 0, color: "#2563eb" }}>
            {`Cantidad de ventas: ${payload[2]?.value || 0}`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="sales-chart-container">
        <h2>Ventas Totales de Maquinaria por Mes</h2>
        <div style={{ height: "320px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p>Cargando datos del gráfico...</p>
        </div>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const isCurrentYear = selectedYear === currentYear;

  return (
    <div className="sales-chart-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
        <div>
          <h2 style={{ color: "#1C4024", margin: "0 0 6px 0" }}>
            Ventas de Maquinaria - {selectedYear}
          </h2>
          <div style={{ fontSize: "14px", color: "#475569", display: "flex", gap: "20px" }}>
            <p style={{ margin: 0 }}>
              {isCurrentYear ? "Total de ventas" : `Ventas en ${selectedYear}`}:{" "}
              <strong style={{ color: "#1C4024" }}>{totalSalesCount}</strong>
            </p>
            <p style={{ margin: 0 }}>
              Valor total: <strong style={{ color: "#4C8F3F" }}>${totalSalesValue.toLocaleString()}</strong>
            </p>
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <select
            value={selectedYear}
            onChange={handleYearChange}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              outline: "none",
            }}
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
          <button
            onClick={handleRefresh}
            style={{
              padding: "6px 14px",
              cursor: "pointer",
              backgroundColor: "#4C8F3F",
              color: "#ffffff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "600",
            }}
          >
            Actualizar
          </button>
        </div>
      </div>

      {error && (
        <div style={{ color: "#dc3545", marginBottom: "10px", fontSize: "14px" }}>
          {error}
        </div>
      )}

      <div style={{ position: "relative", width: "100%", height: "320px" }}>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={salesData} margin={{ top: 10, right: 30, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="mes" stroke="#334155" />
            <YAxis yAxisId="left" stroke="#1C4024" />
            <YAxis yAxisId="right" orientation="right" stroke="#2563eb" />
            <Tooltip content={<CustomTooltip />} />
            <Legend />

            {/* Línea de ventas mensuales (Verde Oscuro) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ventas"
              stroke="#1C4024"
              strokeWidth={3}
              activeDot={{ r: 7, fill: "#1C4024", stroke: "#4C8F3F", strokeWidth: 2 }}
              name="Valor mensual ($)"
            />

            {/* Línea de ventas acumuladas (Verde Medio) */}
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="ventasAcumuladas"
              stroke="#4C8F3F"
              strokeWidth={2}
              strokeDasharray="5 5"
              activeDot={{ r: 6, fill: "#4C8F3F", stroke: "#1C4024", strokeWidth: 2 }}
              name="Total acumulado ($)"
            />

            {/* Línea de cantidad de ventas (Azul Suave) */}
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="cantidadVentas"
              stroke="#2563eb"
              strokeWidth={2}
              activeDot={{ r: 6, fill: "#2563eb", stroke: "#1d4ed8", strokeWidth: 2 }}
              name="Cantidad de ventas"
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Indicador flotante en la esquina de la gráfica */}
        <div
          style={{
            position: "absolute",
            top: "15px",
            right: "15px",
            background: "rgba(240, 245, 240, 0.95)",
            backdropFilter: "blur(8px)",
            padding: "12px 16px",
            borderRadius: "8px",
            border: "1px solid #CDDACC",
            boxShadow: "0 4px 12px rgba(28, 64, 36, 0.1)",
            fontSize: "14px",
            fontWeight: "bold",
          }}
        >
          <div style={{ color: "#1C4024", marginBottom: "4px", fontSize: "14px" }}>
            {isCurrentYear ? "Total ventas" : `Ventas ${selectedYear}`}: {totalSalesCount}
          </div>
          <div style={{ color: "#4C8F3F", fontSize: "13px", fontWeight: "normal" }}>
            ${totalSalesValue.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesChart;