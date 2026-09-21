import React from "react";
import Button from "./Button";
import Label from "./Label";
import PasswordLabel from "./PasswordLabel";
import "./ProfileDetails.css";

const ProfileDetails = () => {
  return (
    <div className="profile-details">
      <div className="profile-header">
        <img src="/profile.jpg" alt="Profile" className="profile-image" />
        <Button text="Actualizar foto" />
      </div>
      <div className="info-section">
        <div className="info-row">
          <Label text="Tu nombre" />
          <p>Jennifer Teos</p>
          <Button text="Editar" />
        </div>
        <div className="info-row">
          <Label text="Tu correo" />
          <p>t22jenn@gmail.com</p>
          <Button text="Editar" />
        </div>
        <div className="info-row">
          <Label text="Tu teléfono" />
          <p>+503 7104-2228</p>
          <Button text="Editar" />
        </div>
        <div className="info-row">
          <PasswordLabel label="Tu contraseña" password="12345Secure!" />
        </div>
      </div>
    </div>
  );
};

export default ProfileDetails;
