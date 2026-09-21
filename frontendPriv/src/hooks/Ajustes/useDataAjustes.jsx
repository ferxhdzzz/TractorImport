// Archivo: src/hooks/Ajustes/useDataAjustes.js (Confirmado como correcto)

import { useState } from "react";
import { toast } from "react-toastify";

const useDataAjustes = () => {
  const [uploading, setUploading] = useState(false);

  // Lógica de uploadImage (se mantiene igual y funciona)
  const uploadImage = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "upload_preset_eternaljoyeria");

      const response = await fetch("https://api.cloudinary.com/v1_1/dosy4rouu/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || "Cloudinary upload failed");
      }

      return data.secure_url;
    } catch (error) {
      toast.error("Error al subir la imagen: " + error.message);
      return null;
    } finally {
      setUploading(false);
    }
  };

  // FUNCIÓN PARA ACTUALIZAR DATOS DEL ADMINISTRADOR
  // Envía los datos como JSON, incluyendo profilePicture si se proporciona.
  const updateAdmin = async (data) => {
    try {
        // Creamos el objeto solo con los campos que vamos a enviar.
        const requestBody = {
            name: data.name,
            email: data.email,
        };
        
        // Solo incluimos la foto si existe en los datos (cuando se actualiza la foto)
        if (data.profilePicture) {
            requestBody.profilePicture = data.profilePicture;
        }
        // Nota: El campo 'password' se puede omitir ya que se maneja por separado.

        const options = {
          method: "PUT",
          credentials: "include",
          headers: { "Content-Type": "application/json" }, // Importante para enviar JSON
          body: JSON.stringify(requestBody), 
        };

      // ENVIAR LA SOLICITUD AL SERVIDOR
      const response = await fetch("http://localhost:4000/api/admins/me", options);
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || "Error al actualizar perfil");
      }

      toast.success("Perfil actualizado correctamente");

      localStorage.setItem("adminName", result.user.name);
      localStorage.setItem("adminImage", result.user.profilePicture);

      // RETORNAR ADMIN ACTUALIZADO para que 'refetchAdmin' sepa que fue exitoso
      return result.user;
    } catch (error) {
      toast.error(error.message || "Error al actualizar");
      return null;
    }
  };

  // RETORNO DE FUNCIONES Y ESTADO DEL HOOK
  return {
    uploadImage,
    updateAdmin,
    uploading,
  };
};

// EXPORTA EL HOOK PARA USO EN OTROS COMPONENTES
export default useDataAjustes;
