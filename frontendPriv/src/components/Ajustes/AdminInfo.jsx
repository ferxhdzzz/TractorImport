import React from "react";
import Label from "./Label";
import "./AdminInfo.css";

const AdminInfo = () => {
  return (
    <div className="admin-info">
      <Label text="Acerca del administrador" highlight />
      <p>
        El administrador es el usuario responsable de gestionar y supervisar el
        funcionamiento completo del sitio web Eternal Joyería. Tiene acceso
        exclusivo a las funciones internas de la plataforma, permitiéndole
        agregar, editar o eliminar productos, gestionar pedidos, revisar
        comentarios de clientes y mantener actualizada la información de la
        tienda.
      </p>
    </div>
  );
};

export default AdminInfo;
