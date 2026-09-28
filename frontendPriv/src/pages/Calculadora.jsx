import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/CalculadoraTI.css";

export default function CalculadoraTI() {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState("");
  const [calculo, setCalculo] = useState(null);

  const truncarDecimales = (num) => Math.trunc(num * 100) / 100;

  const formatearMoneda = (num) => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    let limpiador = value.replace(/[^0-9.]/g, "");

    let partes = limpiador.split(".");
    if (partes.length > 2) {
      limpiador = partes[0] + "." + partes.slice(1).join("");
    }

    if (limpiador === "") {
      setInputValue("");
      setCalculo(null);
      return;
    }

    let parteEntera = partes[0];
    let parteDecimal = partes.length > 1 ? "." + partes[1] : "";

    if (parteEntera !== "") {
      parteEntera = Number(parteEntera).toLocaleString("en-US");
    }

    const valorFormateado = parteEntera + parteDecimal;
    setInputValue(valorFormateado);

    calcularProceso(limpiador);
  };

  const calcularProceso = (rawVal) => {
    const precioInicial = parseFloat(rawVal);

    if (isNaN(precioInicial) || precioInicial < 0) {
      setCalculo(null);
      return;
    }

    const recargo10 = precioInicial * 0.10;
    const precioCon10 = precioInicial + recargo10;

    const tps5 = precioCon10 * 0.05;
    const impuesto9975 = precioCon10 * 0.09975;
    const totalPaso2 = precioCon10 + tps5 + impuesto9975;

    const resultadoFinal = totalPaso2 / 1.39;

    setCalculo({
      precioInicialTruncado: truncarDecimales(precioInicial),
      recargo10Truncado: truncarDecimales(recargo10),
      p1Truncado: truncarDecimales(precioCon10),
      tps5Truncado: truncarDecimales(tps5),
      impuesto9975Truncado: truncarDecimales(impuesto9975),
      p2Truncado: truncarDecimales(totalPaso2),
      finalTruncado: truncarDecimales(resultadoFinal),
    });
  };

  return (
    <div className="calc-page-wrapper">
      <div className="calc-card-container">
        {/* Header con botón "Volver" */}
        <div className="calc-header" style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            style={{
              position: "absolute",
              left: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.25)",
              color: "#ffffff",
              borderRadius: "20px",
              padding: "6px 14px",
              fontSize: "0.85rem",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.12)";
            }}
            title="Volver al Dashboard"
          >
            Volver
          </button>

          <h1 className="calc-title">Calculadora de Tractor Import</h1>
          <p className="calc-subtitle">Calculadora específica para Tractor Import</p>
        </div>

        {/* Formulario */}
        <div className="calc-body">
          {/* Campo de Entrada */}
          <div className="calc-input-group">
            <label htmlFor="precioInicial" className="calc-label">
              Precio Inicial de la Maquinaria ($)
            </label>
            <div className="calc-input-wrapper">
              <span className="calc-currency-symbol">$</span>
              <input
                type="text"
                id="precioInicial"
                placeholder="Ej. 10,000.00"
                value={inputValue}
                onChange={handleInputChange}
                className="calc-input"
              />
            </div>
          </div>

          {/* Desglose de Pasos */}
          {calculo ? (
            <div className="calc-results-container">
              <h2 className="calc-section-title">Proceso paso a paso</h2>

              {/* Paso 1 */}
              <div className="calc-step-card">
                <div className="calc-step-header">
                  <span className="calc-step-name">Paso 1: Recargo del 10%</span>
                  <span className="calc-step-value">
                    ${formatearMoneda(calculo.p1Truncado)}
                  </span>
                </div>
                <p className="calc-step-desc">
                  ${formatearMoneda(calculo.precioInicialTruncado)} + 10% ($
                  {formatearMoneda(calculo.recargo10Truncado)})
                </p>
              </div>

              {/* Paso 2 */}
              <div className="calc-step-card">
                <div className="calc-step-header">
                  <span className="calc-step-name">
                    Paso 2: Impuestos (5% TPS + 9.975%)
                  </span>
                  <span className="calc-step-value">
                    ${formatearMoneda(calculo.p2Truncado)}
                  </span>
                </div>
                <p className="calc-step-desc">
                  Subtotal (${formatearMoneda(calculo.p1Truncado)}) + 5% TPS ($
                  {formatearMoneda(calculo.tps5Truncado)}) + 9.975% ($
                  {formatearMoneda(calculo.impuesto9975Truncado)})
                </p>
              </div>

              {/* Paso 3 / Resultado Final */}
              <div className="calc-final-card">
                <div className="calc-final-flex">
                  <div>
                    <span className="calc-section-title">
                      Paso 3: Conversión Final (÷ 1.39)
                    </span>
                    <p className="calc-step-desc">Total dividido entre 1.39</p>
                  </div>
                  <div>
                    <span className="calc-final-value">
                      ${formatearMoneda(calculo.finalTruncado)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="calc-empty-state">
              Ingresa un precio arriba para ver el cálculo automático en tiempo real.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="calc-footer">by fer</div>
      </div>
    </div>
  );
}