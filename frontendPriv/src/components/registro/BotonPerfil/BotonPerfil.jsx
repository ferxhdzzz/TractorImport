import React from "react";
import "./BotonPerfil.css";

const BotonPerfil = ({ text, color = "#CE91A5", onClick }) => {
  return (
    <button className="boton-perfil" style={{ backgroundColor: color }} onClick={onClick}>
      {text}
    </button>
  );
};

export default BotonPerfil;
