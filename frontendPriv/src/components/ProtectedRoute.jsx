import React from "react";
import { Navigate } from "react-router-dom"; // Para redirigir a rutas protegidas
import { useAdminAuth } from "../context/AdminAuthContext"; // Hook del contexto de autenticación

// Componente que protege rutas, solo permite acceso si el usuario está autenticado
export default function ProtectedRoute({ children }) {
  // Extraemos estado de autenticación y carga del contexto
  const { isAuth, loading } = useAdminAuth();

  // Mientras se carga el estado de autenticación, mostramos mensaje de carga
  if (loading) return <p>Cargando...</p>;

  // Si no está autenticado, redirige al login y reemplaza la ruta actual en el historial
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }

  // Si está autenticado, renderiza los hijos (el componente protegido)
  return children;
}
