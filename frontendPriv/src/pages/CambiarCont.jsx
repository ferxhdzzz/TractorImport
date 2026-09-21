import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../components/registro/logo/Logo";
import Button from "../components/registro/button/Button";
import BackArrow from "../components/registro/backarrow/BackArrow";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Swal from "sweetalert2";
import useRecoverAdminPassword from "../hooks/recovery/useRecoverAdminPassword";
import "../styles/Recuperacion.css";

// Componente Input mejorado con tema verde y ojo dentro
const GreenImprovedInput = React.forwardRef(
  ({ label, type = "text", error, showEye, toggleEye, ...props }, ref) => {
    return (
      <div className="green-input-container">
        <div className="green-input-wrapper">
          <input
            ref={ref}
            type={type}
            className={`green-input ${error ? "error" : ""}`}
            placeholder=" "
            {...props}
          />
          <label className="green-label">{label}</label>

          {/* Icono de ojo dentro del input */}
          {showEye !== undefined && (
            <span className="eye-icon-inside" onClick={toggleEye}>
              {showEye ? <AiFillEyeInvisible /> : <AiFillEye />}
            </span>
          )}
        </div>
        {error && <span className="green-error-message">{error}</span>}
      </div>
    );
  }
);

const CambiarContra = () => {
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({ password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { newPassword } = useRecoverAdminPassword();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
  };

  const handleSubmit = async () => {
    const { password, confirmPassword } = form;
    let newErrors = { password: "", confirmPassword: "" };
    let hasError = false;

    if (!password) {
      newErrors.password = "Complete todos los campos.";
      hasError = true;
    } else {
      if (password.length < 8) {
        newErrors.password = "Debe tener al menos 8 caracteres.";
        hasError = true;
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        newErrors.password = "Debe incluir al menos un carácter especial.";
        hasError = true;
      }
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirma tu contraseña.";
      hasError = true;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Las contraseñas no coinciden.";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;

    try {
      const result = await newPassword(password);
      if (result.ok) {
        Swal.fire({
          icon: "success",
          title: "¡Listo!",
          text: "Contraseña actualizada correctamente.",
          confirmButtonText: "Ir al login",
          confirmButtonColor: "#4C8F3F",
        }).then(() => navigate("/login"));
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message || "No se pudo actualizar la contraseña.",
          confirmButtonColor: "#1C4024",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo actualizar la contraseña. Error de conexión o inesperado.",
        confirmButtonColor: "#1C4024",
      });
    }
  };

  return (
    <div
      className="recover-wrapper"
      style={{
        backgroundColor: "#CDDACC",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div className="recover-card" style={{ maxWidth: "420px", width: "100%" }}>
        <BackArrow to="/recuperacion" />
        <Logo />
        <h2 className="recover-title">Recuperar contraseña</h2>

        <div className="green-form-fields">
          <GreenImprovedInput
            label="Nueva Contraseña"
            name="password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            showEye={showPassword}
            toggleEye={() => setShowPassword(!showPassword)}
          />

          <GreenImprovedInput
            label="Confirmar contraseña"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={form.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            showEye={showConfirmPassword}
            toggleEye={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        </div>

        <Button text="Actualizar →" onClick={handleSubmit} />
      </div>

      <style jsx>{`
        .green-input-container {
          margin-bottom: 20px;
          width: 100%;
        }

        .green-input-wrapper {
          position: relative;
          width: 100%;
        }

        .green-input {
          width: 100%;
          height: 56px;
          padding: 16px 48px 8px 16px;
          border: 2px solid #CDDACC;
          border-radius: 12px;
          font-size: 16px;
          font-family: inherit;
          background: #f8fafc;
          transition: all 0.3s ease;
          outline: none;
          box-sizing: border-box;
          color: #1e293b;
        }

        .green-input:focus {
          border-color: #1C4024;
          box-shadow: 0 0 0 4px rgba(28, 64, 36, 0.15), 
                      0 4px 12px rgba(28, 64, 36, 0.1);
          background: #ffffff;
          transform: translateY(-1px);
        }

        .green-input:hover:not(:focus) {
          border-color: #4C8F3F;
          box-shadow: 0 2px 8px rgba(76, 143, 63, 0.1);
        }

        .green-input.error {
          border-color: #ef4444;
          background: #fef2f2;
        }

        .green-input.error:focus {
          box-shadow: 0 0 0 4px rgba(248, 113, 113, 0.15);
          border-color: #ef4444;
        }

        .green-input::placeholder {
          color: #94a3b8;
        }

        .green-label {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          color: #1C4024;
          pointer-events: none;
          transition: all 0.3s ease;
          background: #f8fafc;
          padding: 0 6px;
          border-radius: 4px;
          font-weight: 500;
        }

        .green-input:focus + .green-label,
        .green-input:not(:placeholder-shown) + .green-label {
          top: -2px;
          font-size: 12px;
          font-weight: 600;
          color: #4C8F3F;
          transform: translateY(0);
          background: #ffffff;
          box-shadow: 0 2px 4px rgba(76, 143, 63, 0.1);
        }

        .green-input.error:focus + .green-label,
        .green-input.error:not(:placeholder-shown) + .green-label {
          color: #ef4444;
          background: #fef2f2;
        }

        .eye-icon-inside {
          position: absolute;
          top: 50%;
          right: 16px;
          transform: translateY(-50%);
          cursor: pointer;
          color: #1C4024;
          font-size: 1.4rem;
          transition: color 0.3s;
        }

        .eye-icon-inside:hover {
          color: #4C8F3F;
        }

        .green-error-message {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #ef4444;
          font-size: 14px;
          margin-top: 6px;
          margin-left: 4px;
          font-weight: 500;
        }

        .green-error-message::before {
          content: "⚠️";
          font-size: 12px;
        }

        .green-form-fields {
          width: 100%;
          margin: 24px 0;
        }

        /* Contenedor principal */
        .recover-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-color: #CDDACC;
        }

        .recover-card {
          background: rgba(255, 255, 255, 0.98);
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                      0 10px 10px -5px rgba(0, 0, 0, 0.04);
          width: 100%;
          position: relative;
          backdrop-filter: blur(10px);
          border: 1px solid #CDDACC;
        }

        .recover-title {
          text-align: center;
          margin-bottom: 2rem;
          color: #1C4024;
          font-size: 1.75rem;
          font-weight: 700;
        }

        /* Responsive para móvil */
        @media (max-width: 768px) {
          .recover-card {
            margin: 20px;
            padding: 24px 20px;
            border-radius: 14px;
          }

          .recover-title {
            font-size: 1.5rem;
            margin: 16px 0 24px 0;
          }

          .green-input {
            height: 54px;
            font-size: 16px;
            border-radius: 10px;
          }

          .green-input:focus {
            transform: translateY(-0.5px);
          }

          .green-form-fields {
            margin: 20px 0;
          }

          .green-input-container {
            margin-bottom: 18px;
          }
        }

        /* Para dispositivos muy pequeños */
        @media (max-width: 480px) {
          .recover-wrapper {
            padding: 10px;
          }

          .recover-card {
            margin: 10px;
            padding: 20px 16px;
          }

          .green-input {
            height: 52px;
            padding: 14px 42px 8px 18px;
            border-radius: 10px;
          }

          .green-label {
            left: 18px;
          }
        }
      `}</style>
    </div>
  );
};

export default CambiarContra;