import React, { createContext, useContext, useEffect, useState } from "react";

// URL base de la API (DEBE coincidir con el backend)
const API_BASE_URL = "http://localhost:4000/api";

// 1. Crear el contexto
const AdminAuthContext = createContext(null);

/**
 * Hook personalizado para consumir el contexto de autenticación de administrador.
 * Devuelve { isAuth, loading, userData, updateAuthStatus }.
 */
export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth debe ser usado dentro de un AdminAuthProvider");
  }
  return context;
};

// 2. Componente Proveedor (Provider)
export function AdminAuthProvider({ children }) {
  // ESTADO QUE INDICA SI EL USUARIO ESTÁ AUTENTICADO COMO ADMINISTRADOR
  const [isAuth, setIsAuth] = useState(false);
  // ESTADO QUE INDICA SI LA VERIFICACIÓN ESTÁ EN CURSO
  const [loading, setLoading] = useState(true);
  // ESTADO PARA ALMACENAR LOS datos del usuario
  const [userData, setUserData] = useState(null);

  /**
   * Función que realiza la solicitud al backend para verificar el token de autenticación.
   * Es la misma función que se ejecuta al inicio y la que se llama manualmente en Login.jsx.
   * @returns {boolean} true si la autenticación fue exitosa.
   */
  const updateAuthStatus = async () => {
    setLoading(true);
    try {
      // SOLICITUD AL BACKEND para verificar y obtener datos del administrador
      const res = await fetch(`${API_BASE_URL}/admins/me`, {
        method: "GET",
        credentials: "include", // CRUCIAL para enviar la cookie 'authToken'
      });

      if (!res.ok) {
        console.error(`Admin verification failed: ${res.status} ${res.statusText}`);
        setIsAuth(false);
        setUserData(null);
        return false; // Retorna false en caso de fallo de autenticación
      }

      const data = await res.json();
      setIsAuth(true);
      setUserData(data.user); // Usa data.user, que es la estructura de adminController.js
      return true; // Retorna true si la autenticación es exitosa
    } catch (error) {
      console.error("Error de conexión al verificar admin:", error);
      setIsAuth(false);
      setUserData(null);
      return false; // Retorna false en caso de error de conexión
    } finally {
      setLoading(false);
    }
  };

  // EFFECTO para verificar la autenticación al montar el componente (al inicio de la app)
  useEffect(() => {
    updateAuthStatus();
  }, []);

  // 3. Valor del contexto
  const contextValue = {
    isAuth,
    loading,
    userData,
    updateAuthStatus, // ¡Ahora sí exportamos la función de actualización!
  };

  return (
    <AdminAuthContext.Provider value={contextValue}>
      {children}
    </AdminAuthContext.Provider>
  );
}
