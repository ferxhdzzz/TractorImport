import React from "react";
import { useForm } from "react-hook-form"; // Para manejo y validación del formulario
import { useNavigate } from "react-router-dom"; // Para navegación programática
import useRecoverAdminPassword from "../hooks/recovery/useRecoverAdminPassword"; // Hook para lógica de recuperación
import Swal from "sweetalert2"; // Para alertas bonitas
import Logo from "../components/registro/logo/Logo"; // Componente logo reutilizable
import Button from "../components/registro/button/Button"; // Botón reutilizable
import BackArrow from "../components/registro/backarrow/BackArrow"; // Flecha para regresar atrás
import "../styles/VerificarCodigo.css"; // Estilos específicos para esta página

// Componente Input mejorado con tema verde
const GreenImprovedInput = React.forwardRef(({ 
  label, 
  type = "text", 
  error, 
  ...props 
}, ref) => {
  return (
    <div className="green-input-container">
      <div className="green-input-wrapper">
        <input
          ref={ref}
          type={type}
          className={`green-input ${error ? 'error' : ''}`}
          placeholder=" "
          {...props}
        />
        <label className="green-label">{label}</label>
      </div>
      {error && <span className="green-error-message">{error}</span>}
    </div>
  );
});

export default function VerificarCodigo() {
  // Hook de react-hook-form para registro, manejo de submit y errores
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Hook personalizado para verificar el código y estado de carga
  const { verifyCode, loading } = useRecoverAdminPassword();

  // Hook para navegación a otras rutas
  const navigate = useNavigate();

  // Función que se ejecuta al enviar el formulario
  const onSubmit = async (data) => {
    // Llama al hook verifyCode con el código ingresado
    const res = await verifyCode(data.code);

    // Si el mensaje de respuesta incluye "verificado", mostrar éxito y navegar a cambiar contraseña
    if (res.message?.includes("verificado")) {
      Swal.fire({
        title: "Código correcto",
        text: res.message,
        icon: "success",
        confirmButtonColor: "#4C8F3F",
      });
      navigate("/cambiar");
    } else {
      // Si no, mostrar error con mensaje recibido o genérico
      Swal.fire({
        title: "Error",
        text: res.message || "Código inválido.",
        icon: "error",
        confirmButtonColor: "#1C4024",
      });
    }
  };

  return (
    <div className="verify-wrapper">
      <div className="verify-card">
        {/* Botón para volver a la página anterior */}
        <BackArrow to="/recuperacion" />
        {/* Logo */}
        <Logo />

        {/* Título principal */}
        <h2 className="verify-title">Verificar Código</h2>

        {/* Formulario para ingresar el código de confirmación */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="green-form-fields">
            <GreenImprovedInput
              label="Código de confirmación"
              error={errors.code?.message}
              {...register("code", {
                required: "El código es obligatorio", // Validación: campo requerido
              })}
            />
          </div>

          {/* Botón que muestra estado de carga o texto normal */}
          <Button text={loading ? "Verificando..." : "Verificar →"} type="submit" />
        </form>
      </div>

      <style jsx>{`
        /* Estilos para los inputs verdes mejorados */
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
          padding: 16px 16px 8px 16px;
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
          border-color: #f87171;
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
        .verify-wrapper {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          background-color: #CDDACC;
        }

        .verify-card {
          background: rgba(255, 255, 255, 0.98);
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 
                      0 10px 10px -5px rgba(0, 0, 0, 0.04);
          width: 100%;
          max-width: 420px;
          position: relative;
          backdrop-filter: blur(10px);
          border: 1px solid #CDDACC;
        }

        .verify-title {
          text-align: center;
          margin-bottom: 2rem;
          color: #1C4024;
          font-size: 1.75rem;
          font-weight: 700;
        }

        /* Responsive para móvil */
        @media (max-width: 768px) {
          .verify-card {
            margin: 20px;
            padding: 24px 20px;
            border-radius: 14px;
          }

          .verify-title {
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
          .verify-wrapper {
            padding: 10px;
          }

          .verify-card {
            margin: 10px;
            padding: 20px 16px;
          }

          .green-input {
            height: 52px;
            padding: 14px 18px 8px 18px;
            border-radius: 10px;
          }

          .green-label {
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
            background: #1e293b;
            border-color: #4C8F3F;
            color: #f8fafc;
          }

          .code-input:focus {
            border-color: #1C4024;
            background: #0f172a;
            box-shadow: 0 0 0 3px rgba(76, 143, 63, 0.2);
          }

          .code-label {
            color: #CDDACC;
          }

          .code-input.error {
            border-color: #f87171;
            background: #451a1a;
          }
        }
      `}</style>
    </div>
  );
}