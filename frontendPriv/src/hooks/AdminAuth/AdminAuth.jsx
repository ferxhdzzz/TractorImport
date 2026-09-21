// IMPORTACIÓN DE HOOKS DE REACT
import { useEffect, useState } from "react";

// DEFINICIÓN DEL HOOK PERSONALIZADO PARA VERIFICAR AUTENTICACIÓN DE ADMINISTRADOR
export default function useAdminAuth() {
  // ESTADO QUE INDICA SI EL USUARIO ESTÁ AUTENTICADO COMO ADMINISTRADOR
  const [isAuth, setIsAuth] = useState(false);

  // ESTADO QUE INDICA SI LA VERIFICACIÓN ESTÁ EN CURSO
  const [loading, setLoading] = useState(true);

  // EFFECTO PARA EJECUTAR LA VERIFICACIÓN AL MONTAR EL COMPONENTE
  useEffect(() => {
    // FUNCIÓN ASÍNCRONA QUE CONSULTA AL BACKEND SI EL USUARIO ES ADMIN
    const verifyAdmin = async () => {
      try {
        // SOLICITUD AL BACKEND PARA VERIFICAR EL ROL DE ADMINISTRADOR
        const res = await fetch("http://localhost:4000/api/login/checkAdmin", {
          method: "GET",
          credentials: "include", // INCLUYE LAS COOKIES DE SESIÓN
        });

        // RESPUESTA DEL SERVIDOR CON INFORMACIÓN DE AUTENTICACIÓN
        const data = await res.json();

        // ACTUALIZA ESTADO SEGÚN LA RESPUESTA
        setIsAuth(data.ok);
      } catch (error) {
        // SI HAY ERROR, SE CONSIDERA NO AUTENTICADO
        console.error(error);
        setIsAuth(false);
      } finally {
        // FINALIZA LA CARGA
        setLoading(false);
      }
    };

    // LLAMADO A LA FUNCIÓN DE VERIFICACIÓN
    verifyAdmin();
  }, []);

  // RETORNO DE LOS ESTADOS PARA QUE PUEDAN SER USADOS EN COMPONENTES
  return { isAuth, loading };
}
