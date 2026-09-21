import React from "react";
import "./PerfilFoto.css";

const PerfilFoto = ({ src, alt = "Foto de perfil", size = 120 }) => {
  return (
    <div className="perfil-foto-container">
      <img
        className="perfil-foto"
        src={src}
        alt={alt}
        style={{ width: size, height: size }}
      />
    </div>
  );
};

export default PerfilFoto;
