import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";

const api = "http://localhost:4000/api/customers";

const useFetchCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);

  const getCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch(api, {
        credentials: "include", // Incluye cookies de sesión
      });
      
      if (!response.ok) {
        throw new Error("Error al obtener la lista de clientes");
      }
      
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
      toast.error("Error al cargar los clientes");
    } finally {
      setLoading(false);
    }
  };

  const getCustomerById = async (id) => {
    try {
      const response = await fetch(`${api}/${id}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Error al obtener la información del cliente");
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching customer by ID:", error);
      toast.error("Error al obtener los datos del cliente");
      return null;
    }
  };

  useEffect(() => {
    getCustomers();
  }, []);

  return {
    customers,
    loading,
    getCustomerById,
    getCustomers,
  };
};

export default useFetchCustomers;