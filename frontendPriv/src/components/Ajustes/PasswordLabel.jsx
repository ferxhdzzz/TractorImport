import React, { useState } from "react";
import "./PasswordLabel.css";

const PasswordLabel = ({ label, password }) => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="password-label">
      <label className="password-label-text">{label}</label>
      <div className="password-container">
        <p className="password-text">
          {showPassword ? password : "●●●●●●●●●●"}
        </p>
        <button
          type="button"
          className="toggle-button"
          onClick={togglePasswordVisibility}
        >
          {showPassword ? "Ocultar" : "Mostrar"}
        </button>
      </div>
    </div>
  );
};

export default PasswordLabel;
