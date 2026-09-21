import { useState } from "react";

const API_URL = `${import.meta.env.VITE_API_URL || "http://localhost:4000/api"}/recoveryPassword`;

export default function useRecoverAdminPassword() {
  const [loading, setLoading] = useState(false);

  const toJson = async (res) => {
    let data = {};
    try { 
      const text = await res.text();
      if (text) {
        data = JSON.parse(text);
      }
    } catch (error) {
      console.error("Error parsing JSON:", error);
    }
    
    // Incluye 'ok' (true para status 200-299), 'status' y los datos del cuerpo.
    const result = { ok: res.ok, status: res.status, ...data };
    console.log("toJson result (admin):", result);
    return result;
  };

  const requestCode = async (email) => {
    setLoading(true);
    try {
      console.log("Solicitando código para admin:", email);
      const requestBody = { email, userType: "admin" };
      console.log("Enviando datos:", requestBody);
      
      const response = await fetch(`${API_URL}/requestCode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });
      
      console.log("Respuesta requestCode (admin):", response.status, response.statusText);
      const result = await toJson(response);
      console.log("Resultado requestCode (admin):", result);
      return result;
    } catch (error) {
      console.error("Error en requestCode (admin):", error);
      return { ok: false, message: "Error de conexión con el servidor. Inténtalo de nuevo más tarde." };
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (code) => {
    setLoading(true);
    try {
      console.log("Verificando código admin:", code);
      const requestBody = { code, userType: "admin" };
      console.log("Enviando datos:", requestBody);
      
      const response = await fetch(`${API_URL}/verifyCode`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });
      
      console.log("Respuesta verifyCode (admin):", response.status, response.statusText);
      const result = await toJson(response);
      console.log("Resultado verifyCode (admin):", result);
      
      // Si la verificación fue exitosa, mostrar las cookies
      if (result.ok) {
        console.log("Cookies después de verifyCode (admin):", document.cookie);
      }
      
      return result;
    } catch (error) {
      console.error("Error en verifyCode (admin):", error);
      return { ok: false, message: "Error de conexión con el servidor. Inténtalo de nuevo más tarde." };
    } finally {
      setLoading(false);
    }
  };

  const newPassword = async (password) => {
    setLoading(true);
    try {
      console.log("Cambiando contraseña admin...");
      const requestBody = { newPassword: password };
      console.log("Enviando datos:", requestBody);
      console.log("Cookies disponibles (admin):", document.cookie);
      
      const response = await fetch(`${API_URL}/newPassword`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(requestBody),
      });
      
      console.log("Respuesta newPassword (admin):", response.status, response.statusText);
      const result = await toJson(response);
      console.log("Resultado newPassword (admin):", result);
      return result;
    } catch (error) {
      console.error("Error en newPassword (admin):", error);
      return { ok: false, message: "Error de conexión con el servidor. Inténtalo de nuevo más tarde." };
    } finally {
      setLoading(false);
    }
  };

  return { requestCode, verifyCode, newPassword, loading };
}
