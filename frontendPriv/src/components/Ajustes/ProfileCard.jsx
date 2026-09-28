import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink } from "react-router-dom";
// Asumo que usePerfilAdmin ahora exporta 'refetchAdmin'
import usePerfilAdmin from "../../hooks/Ajustes/useFetchAjustes"; 
import useDataAjustes from "../../hooks/Ajustes/useDataAjustes"; 
import Label from "./Label"; 
import Button from "./Button";
import "./ProfileCard.css";

const ProfileCard = () => {
  // Extraemos 'refetchAdmin' del hook
  const { admin, loading, error, refetchAdmin } = usePerfilAdmin();
  const { updateAdmin, uploadImage } = useDataAjustes();
  // Usamos 'nombre' y 'correo' para los campos del formulario
  const { register, handleSubmit, reset, formState: { errors }, getValues } = useForm();

  const [imagenPreview, setImagenPreview] = useState(null);
  const [editingField, setEditingField] = useState(null); // "nombre" | "correo" | "foto"
  const [nuevaFoto, setNuevaFoto] = useState(null);
  // Estado para la notificación de éxito
  const [successMessage, setSuccessMessage] = useState(null);

  // Función para manejar la visualización del mensaje de éxito
  const handleSuccess = (message) => {
    setSuccessMessage(message);
    // Ocultar el mensaje después de 3 segundos
    setTimeout(() => {
      setSuccessMessage(null);
    }, 3000);
  };

  useEffect(() => {
    // Este useEffect se dispara cuando 'admin' cambia (al cargar o después de un refetch exitoso)
    if (admin) {
      reset({
        nombre: admin.name || "",
        correo: admin.email || "",
      });
      setImagenPreview(admin.profilePicture || null);
    }
  }, [admin, reset]); // Dependencia clave: 'admin'

  const handleEdit = (field) => setEditingField(field);

  // Esta función ahora se llama EXCLUSIVAMENTE desde el formulario del MODAL
  const onSubmit = async (data) => {
    // Determinar qué campo se está guardando
    const fieldToSave = editingField;
    
    if (!fieldToSave || fieldToSave === "foto") return;

    try {
      const updatedData = {};
      if (fieldToSave === "nombre") {
        updatedData.name = data.nombre;
        // Aseguramos que el correo mantenga el valor actual del estado (por si acaso)
        updatedData.email = getValues("correo"); 
      } else if (fieldToSave === "correo") {
        updatedData.email = data.correo;
        // Aseguramos que el nombre mantenga el valor actual del estado
        updatedData.name = getValues("nombre"); 
      }
      
      const updatedAdmin = await updateAdmin(updatedData);
      
      if (updatedAdmin) {
        // Recargar los datos para que el useEffect actualice la vista principal
        refetchAdmin();
        setEditingField(null); // Cerrar modal
        handleSuccess("¡Perfil actualizado correctamente!"); // 🟢 ÉXITO
      }
    } catch (e) {
      console.error("Error al actualizar:", e);
    }
  };

  const handleImageSubmit = async () => {
    if (!nuevaFoto) return;
    try {
      const imageUrl = await uploadImage(nuevaFoto);
      if (imageUrl) {
        const valores = getValues();
        // Enviamos la nueva URL de la imagen junto con el nombre/correo actualizados.
        const updatedAdmin = await updateAdmin({
          name: valores.nombre,
          email: valores.correo,
          profilePicture: imageUrl,
        });
        if (updatedAdmin) {
          // Recargar los datos para que el hook de fetch tenga la nueva URL
          refetchAdmin(); 
          setEditingField(null);
          setNuevaFoto(null);
          setImagenPreview(imageUrl);
          handleSuccess("¡Foto de perfil actualizada correctamente!"); // 🟢 ÉXITO
        }
      }
    } catch (e) {
      console.error("Error al subir foto:", e);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNuevaFoto(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  if (loading) return <p className="cargando-texto">Cargando perfil...</p>;
  if (error) return <p className="error-texto">Error al cargar el perfil: {error}. Asegúrate de haber iniciado sesión.</p>;

  return (
    <>
      {/* Notificación de éxito flotante */}
      {successMessage && (
        <div 
          className="success-toast"
          style={{
            position: 'fixed', 
            top: '20px', 
            right: '20px', 
            backgroundColor: '#4CAF50', 
            color: 'white', 
            padding: '15px 20px', 
            borderRadius: '8px', 
            zIndex: 1000,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            transition: 'opacity 0.3s ease-out'
          }}
        >
          {successMessage}
        </div>
      )}
      
      {/* El formulario principal ya no es necesario para la submission de nombre/correo */}
      <div className="profile-card">
        <div className="profile-header">
          {imagenPreview && (
            <div className="preview-circle" style={{ backgroundImage: `url(${imagenPreview})` }} />
          )}
          <Button text="Actualizar foto" onClick={() => handleEdit("foto")} />
        </div>

        <div className="info-container">
          <div className="info-box">
            <Label text="Nombre" />
            <div className="info-row">
              <input
                {...register("nombre")}
                className="info-input"
                disabled={true} // Siempre deshabilitado para mostrar
                readOnly // Añadir readOnly para mejor accesibilidad/claridad
              />
              <Button text="Editar" onClick={() => handleEdit("nombre")} />
            </div>
            {errors.nombre && <p className="error-texto">{errors.nombre.message}</p>}

            <Label text="Correo" />
            <div className="info-row">
              <input
                {...register("correo")}
                className="info-input"
                disabled={true} // Siempre deshabilitado para mostrar
                readOnly
              />
              <Button text="Editar" onClick={() => handleEdit("correo")} />
            </div>
            {errors.correo && <p className="error-texto">{errors.correo.message}</p>}

            <Label text="Contraseña" />
            <div className="info-row">
              <input type="password" className="info-input" value="**********" disabled readOnly />
              <NavLink to="/recuperacion/">
                <Button text="¿Olvidó la contraseña?" />
              </NavLink>
            </div>
          </div>

          <div className="admin-box">
            <Label text="Acerca del administrador" />
            <p className="admin-description">
              El administrador es el usuario responsable de gestionar y supervisar el funcionamiento completo del 
              sitio web de Tractor Import. Tiene acceso exclusivo a las funciones internas de la plataforma.
            </p>
          </div>
        </div>

        {/* Modal para editar nombre/correo */}
        {editingField && editingField !== "foto" && (
          <div className="overlay">
            <div className="overlay-content">
              <h3>Editar {editingField === "nombre" ? "Nombre" : "Correo"}</h3>
              {/* Usamos un nuevo formulario independiente para el modal */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <input
                  {...register(editingField, {
                    required: `El ${editingField} es obligatorio`,
                    ...(editingField === "correo" && {
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Formato de correo inválido",
                      },
                    }),
                  })}
                  className="floating-input"
                  placeholder={`Nuevo ${editingField}`}
                  autoFocus
                />
                {errors[editingField] && <p className="error-texto">{errors[editingField].message}</p>}
                <div className="button-group">
                  <Button text="Guardar" type="submit" className="purple-btn" />
                  {/* Al cancelar, limpiamos los errores y cerramos */}
                  <Button text="Cancelar" className="purple-btn" onClick={() => { setEditingField(null); reset(); }} />
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal para actualizar foto */}
        {editingField === "foto" && (
          <div className="overlay">
            <div className="overlay-content">
              <h3>Actualizar Foto</h3>
              {nuevaFoto && <img src={URL.createObjectURL(nuevaFoto)} alt="preview" className="preview-img" />}
              <input type="file" accept="image/*" onChange={handleFileChange} />
              <br />
              <br />
              <div className="button-group">
                <Button text="Guardar" className="purple-btn" onClick={handleImageSubmit} />
                <Button text="Cancelar" className="purple-btn" onClick={() => { setEditingField(null); setNuevaFoto(null); }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ProfileCard;