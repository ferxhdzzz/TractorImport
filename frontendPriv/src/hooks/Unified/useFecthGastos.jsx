import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "https://tractorimport.onrender.com/api/gastos";

const useFetchGasto = () => {
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(false);

  const getGastos = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(API_URL, {
        withCredentials: true, // Incluye cookies de sesión
      });
      setGastos(data);
    } catch (error) {
      console.error("Error al obtener los gastos:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getGastos();
  }, []);

  return { gastos, getGastos, loading };
};

export default useFetchGasto;