// src/hooks/useLogoutAction.js
import { toast } from "react-hot-toast";

const api = "http://localhost:4000/api/logout";

const useLogoutAction = (navigate) => {
  const logoutUser = async () => {
    try {
      const response = await fetch(api, {
        method: "POST",
        credentials: "include", // para enviar cookies
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      toast.success("Sesión cerrada correctamente");
      navigate("/login"); // ajusta si tu ruta de login es otra
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      toast.error("Error al cerrar sesión");
    }
  };

  return {
    logoutUser,
  };
};

export default useLogoutAction;
