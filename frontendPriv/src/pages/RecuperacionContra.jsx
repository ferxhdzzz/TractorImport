// src/pages/RecuperacionContra.jsx
import React from "react";
import { useForm } from "react-hook-form"; // Manejo y validación de formularios
import { useNavigate } from "react-router-dom"; // Navegación programática
import useRecoverAdminPassword from "../hooks/recovery/useRecoverAdminPassword"; // Hook para recuperación de contraseña
import Logo from "../components/registro/logo/Logo"; // Logo reutilizable
import Button from "../components/registro/button/Button"; // Botón reutilizable
import BackArrow from "../components/registro/backarrow/BackArrow"; // Flecha para regresar
import Swal from "sweetalert2"; // Librería de alertas
import "../styles/Recuperacion.css"; // Estilos base

// Componente Input mejorado con tema rosado
const PinkImprovedInput = React.forwardRef(({ label, type = "text", error, ...props }, ref) => {
  return (
    <div className="pink-input-container">
      <div className="pink-input-wrapper">
        <input
          ref={ref}
          type={type}
          className={`pink-input ${error ? "error" : ""}`}
          placeholder=" "
          {...props}
        />
        <label className="pink-label">{label}</label>
      </div>
      {error && <span className="pink-error-message">{error}</span>}
    </div>
  );
});

const RecuperacionContra = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { requestCode, loading } = useRecoverAdminPassword();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      const res = await requestCode(data.email);
      if (res.message?.includes("correctamente")) {
        Swal.fire("Éxito", res.message, "success");
        navigate("/verificar-codigo");
      } else {
        Swal.fire("Error", res.message || "No se pudo enviar el código.", "error");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className="recover-wrapper"
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: "20px",
      }}
    >
      <div className="recover-card improved-form" style={{ maxWidth: "400px", width: "100%" }}>
        <BackArrow to="/login" />
        <Logo />
        <h2 className="recover-title">Recuperar Contraseña</h2>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="pink-form-fields">
            <PinkImprovedInput
              label="Correo electrónico"
              type="email"
              error={errors.email?.message}
              {...register("email", {
                required: "El correo es obligatorio",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Formato de correo inválido",
                },
              })}
            />
          </div>

          <Button text={loading ? "Enviando..." : "Enviar código →"} type="submit" />
        </form>
      </div>

      <style jsx>{`
        /* Estilos para los inputs rosados mejorados */
        .pink-input-container {
          margin-bottom: 20px;
          width: 100%;
        }

        .pink-input-wrapper {
          position: relative;
          width: 100%;
        }

        .pink-input {
          width: 100%;
          height: 56px;
          padding: 16px 16px 8px 16px;
          border: 2px solid #1C4024;
          border-radius: 16px;
          font-size: 16px;
          font-family: inherit;
          background: linear-gradient(145deg, #ffffff, #ffffff);
          transition: all 0.3s ease;
          outline: none;
          box-sizing: border-box;
          color: #4a4a4a;
        }

        .pink-input:focus {
          border-color: #1C4024;
          box-shadow: 0 0 0 4px rgba(236, 72, 153, 0.15), 
                      0 4px 12px rgba(236, 72, 153, 0.1);
          background: linear-gradient(145deg, #ffffff, #ffffff);
          transform: translateY(-1px);
        }

        .pink-input:hover:not(:focus) {
          border-color: #1C4024;
          box-shadow: 0 2px 8px rgba(244, 114, 182, 0.1);
        }

        .pink-input.error {
          border-color: #1C4024;
          background: linear-gradient(145deg, #ffffff, #ffffff);
        }

        .pink-input.error:focus {
          box-shadow: 0 0 0 4px rgba(248, 113, 113, 0.15);
          border-color: #1C4024;
        }

        .pink-input::placeholder {
          color: #1C4024;
        }

        .pink-label {
          position: absolute;
          left: 16px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 16px;
          color: #1C4024;
          pointer-events: none;
          transition: all 0.3s ease;
          background: linear-gradient(145deg, #ffffff, #ffffff);
          padding: 0 6px;
          border-radius: 4px;
          font-weight: 500;
        }

        .pink-input:focus + .pink-label,
        .pink-input:not(:placeholder-shown) + .pink-label {
          top: -2px;
          font-size: 12px;
          font-weight: 600;
          color: #1C4024;
          transform: translateY(0);
          background: linear-gradient(145deg, #ffffff, #ffffff);
          box-shadow: 0 2px 4px rgba(236, 72, 153, 0.1);
        }

        .pink-input.error:focus + .pink-label,
        .pink-input.error:not(:placeholder-shown) + .pink-label {
          color: #ef4444;
          background: linear-gradient(145deg, #ffffff, #ffffff);
        }

        .pink-error-message {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #ef4444;
          font-size: 14px;
          margin-top: 6px;
          margin-left: 4px;
          font-weight: 500;
        }

        .pink-error-message::before {
          content: "⚠️";
          font-size: 12px;
        }

        .pink-form-fields {
          width: 100%;
          margin: 24px 0;
        }

        /* Mejoras para el contenedor principal */
        .verify-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .verify-card {
          background: rgba(255, 255, 255, 0.95);
          padding: 2.5rem;
          border-radius: 20px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                      0 10px 10px -5px rgba(0, 0, 0, 0.04),
                      0 0 0 1px rgba(236, 72, 153, 0.05);
          width: 100%;
          max-width: 420px;
          position: relative;
          backdrop-filter: blur(10px);
          border: 1px solid rgb(76, 143, 63);
        }

        .verify-title {
          text-align: center;
          margin-bottom: 2rem;
          color: #1C4024;
          font-size: 1.75rem;
          font-weight: 700;
          background: linear-gradient(135deg, #1C4024, #1C4024);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* Responsive para móvil */
        @media (max-width: 768px) {
          .verify-card {
            margin: 20px;
            padding: 24px 20px;
            border-radius: 18px;
          }

          .verify-title {
            font-size: 1.5rem;
            margin: 16px 0 24px 0;
          }

          .pink-input {
            height: 54px;
            font-size: 16px;
            border-radius: 14px;
          }

          .pink-input:focus {
            transform: translateY(-0.5px);
          }

          .pink-form-fields {
            margin: 20px 0;
          }

          .pink-input-container {
            margin-bottom: 18px;
          }
        }

        /* Para dispositivos muy pequeños */
        @media (max-width: 480px) {
          .verify-wrapper {
            padding: 10px;
          }

          .verify-card {
            margin: 10px;
            padding: 20px 16px;
          }

          .pink-input {
            height: 52px;
            padding: 14px 18px 8px 18px;
            border-radius: 12px;
          }

          .pink-label {
            left: 18px;
          }
        }

        /* Mejora para accesibilidad */
        @media (prefers-reduced-motion: reduce) {
          .code-input {
            transition: none;
            animation: none;
          }
        }

        /* Dark mode para inputs de código */
        @media (prefers-color-scheme: dark) {
          .code-input {
            background: linear-gradient(145deg, rgba(45, 25, 35, 0.9), rgba(55, 30, 40, 0.8));
            border-color: #1C4024;
            color: #1C4024;
          }

          .code-input:focus {
            border-color: #1C4024;
            background: linear-gradient(145deg, rgba(55, 30, 40, 0.95), rgba(45, 25, 35, 0.9));
            box-shadow: 0 0 0 3px rgba(236, 72, 153, 0.2);
          }

          .code-label {
            color: #1C4024;
          }

          .code-input.error {
            border-color: #1C4024;
            background: linear-gradient(145deg, rgba(60, 30, 30, 0.9), rgba(70, 35, 35, 0.8));
          }
        }
      `}</style>
    </div>
  );
};

export default RecuperacionContra;
