import { toast } from "react-hot-toast";

const api = "http://localhost:4000/api/customers";

const useCustomerAction = (getCustomers) => {
  const deleteCustomer = async (id) => {
    try {
      const response = await fetch(`${api}/${id}`, {
        method: "DELETE",
        credentials: "include", // Necesario para la autenticación por cookies
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al eliminar el cliente");
      }

      toast.success("Cliente eliminado correctamente");
      
      if (getCustomers) {
        getCustomers();
      }
    } catch (error) {
      console.error("Error al eliminar cliente:", error);
      toast.error(error.message || "Error al eliminar el registro del cliente");
    }
  };

  return {
    deleteCustomer,
  };
};

export default useCustomerAction;