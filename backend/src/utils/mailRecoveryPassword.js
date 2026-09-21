import nodemailer from "nodemailer";
import { config } from "../config.js";

// Configurar el transporter
// ¿Quién envía el correo?
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

// Función para enviar correos
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Tractor Import" <${config.smtp.user}>`,
      to,
      subject,
      text,
      html,
    });

    console.log('Mensaje enviado: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    throw error;
  }
};

// Función para generar el HTML del correo de recuperación de contraseña
const HTMLRecoveryEmail = (code) => {
  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tractor Import - Password Recovery</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            background-color: #CDDACC;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 15px;
        }
        
        .email-container {
            width: 100%;
            max-width: 720px;
        }
        
        .email-card {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px -12px rgba(28, 64, 36, 0.2);
            overflow: hidden;
            border: 1px solid rgba(76, 143, 63, 0.2);
        }
        
        .header-section {
            background: linear-gradient(135deg, #f0f5f0, #e2ebe2);
            padding: 40px 30px 35px;
            text-align: center;
            border-top: 4px solid #1C4024;
        }
        
        .brand-logo {
            font-family: 'Inter', sans-serif;
            font-size: 32px;
            font-weight: 800;
            color: #1C4024;
            margin-bottom: 12px;
            letter-spacing: 0.5px;
        }
        
        .main-title {
            font-size: 24px;
            font-weight: 700;
            color: #1C4024;
            margin-bottom: 6px;
        }
        
        .subtitle {
            font-size: 14px;
            color: #4C8F3F;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .content-section {
            padding: 35px 30px;
        }
        
        .welcome-message {
            background: #f8fafc;
            border-radius: 16px;
            padding: 28px;
            margin-bottom: 35px;
            border: 1px solid #CDDACC;
        }
        
        .language-block {
            margin-bottom: 16px;
        }
        
        .language-block:last-child {
            margin-bottom: 0;
        }
        
        .language-label {
            font-weight: 700;
            color: #1C4024;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        
        .language-text {
            color: #475569;
            line-height: 1.6;
            font-size: 16px;
        }
        
        .code-section {
            text-align: center;
            margin: 35px 0;
        }
        
        .code-container {
            background: linear-gradient(135deg, #4C8F3F, #1C4024) !important;
            border-radius: 16px;
            padding: 32px 28px;
            box-shadow: 0 15px 30px -8px rgba(28, 64, 36, 0.3);
            display: block !important;
            width: 100% !important;
            max-width: 320px !important;
            margin: 0 auto !important;
            text-align: center !important;
        }
        
        .code-label {
            color: #CDDACC !important;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 14px;
            display: block !important;
            text-align: center !important;
        }
        
        .verification-code {
            font-size: 38px;
            font-weight: 800;
            color: #ffffff !important;
            font-family: 'Courier New', Courier, monospace;
            letter-spacing: 6px;
            text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            background-color: transparent !important;
            display: block !important;
            width: 100% !important;
            text-align: center !important;
            line-height: 1.2 !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        
        .timer-section {
            background: #f0f5f0;
            border-radius: 16px;
            padding: 24px;
            margin: 35px 0;
            border-left: 4px solid #4C8F3F;
        }
        
        .timer-content {
            margin-bottom: 14px;
        }
        
        .timer-content:last-child {
            margin-bottom: 0;
        }
        
        .timer-label {
            font-weight: 700;
            color: #1C4024;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        
        .timer-text {
            color: #334155;
            line-height: 1.6;
            font-size: 15px;
        }
        
        .footer-section {
            background: #f8fafc;
            padding: 28px;
            text-align: center;
            border-top: 1px solid #CDDACC;
        }
        
        .support-info {
            margin-bottom: 14px;
        }
        
        .support-info:last-child {
            margin-bottom: 0;
        }
        
        .support-label {
            font-weight: 700;
            color: #1C4024;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }
        
        .support-text {
            color: #64748b;
            font-size: 15px;
            line-height: 1.6;
        }
        
        .support-link {
            color: #4C8F3F;
            text-decoration: none;
            font-weight: 700;
        }
        
        .support-link:hover {
            color: #1C4024;
        }

        /* Mobile optimizations */
        @media (max-width: 480px) {
            body { padding: 10px; }
            .header-section { padding: 25px 15px 20px; }
            .brand-logo { font-size: 22px; }
            .main-title { font-size: 16px; }
            .content-section { padding: 20px 15px; }
            .welcome-message { padding: 16px; }
            .timer-section { padding: 16px; }
            .footer-section { padding: 16px; }
            table[style*="max-width: 300px"] { max-width: 250px !important; }
            div[style*="font-size: 38px"] { font-size: 26px !important; letter-spacing: 3px !important; }
        }

        @media (max-width: 360px) {
            .brand-logo { font-size: 20px; }
            .main-title { font-size: 15px; }
            div[style*="font-size: 38px"] { font-size: 22px !important; letter-spacing: 2px !important; }
        }

        /* Larger screen optimizations */
        @media (min-width: 1024px) {
            .brand-logo {
                font-size: 40px;
            }

            .main-title {
                font-size: 30px;
            }

            .subtitle {
                font-size: 16px;
            }

            .language-text,
            .timer-text,
            .support-text {
                font-size: 18px;
            }

            div[style*="font-size: 38px"] { 
                font-size: 48px !important; 
                letter-spacing: 6px !important; 
            }

            table[style*="padding: 32px 28px"] td {
                padding: 48px 40px !important;
            }

            .welcome-message,
            .timer-section,
            .footer-section,
            .content-section {
                padding: 40px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-card">
            <div class="header-section">
                <div class="brand-logo">Tractor Import</div>
                <h1 class="main-title">Password Recovery | Recuperación de Contraseña</h1>
                <p class="subtitle">Secure Access | Acceso Seguro</p>
            </div>
            
            <div class="content-section">
                <div class="welcome-message">
                    <div class="language-block">
                        <div class="language-label">English</div>
                        <div class="language-text">
                            Hello! We received a request to reset your password. Use the verification code below to proceed with your account recovery.
                        </div>
                    </div>
                    <div class="language-block">
                        <div class="language-label">Español</div>
                        <div class="language-text">
                            ¡Hola! Hemos recibido una solicitud para restablecer tu contraseña. Usa el código de verificación a continuación para continuar con la recuperación de tu cuenta.
                        </div>
                    </div>
                </div>
                
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 35px 0;">
                    <tr>
                        <td align="center">
                            <table cellpadding="0" cellspacing="0" border="0" style="background: linear-gradient(135deg, #4C8F3F, #1C4024); background-color: #1C4024; border-radius: 16px; max-width: 320px; width: 100%;">
                                <tr>
                                    <td style="padding: 32px 28px; text-align: center;">
                                        <div style="color: #CDDACC; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; text-align: center;">
                                            Verification Code | Código de Verificación
                                        </div>
                                        <div style="font-size: 38px; font-weight: 800; color: #ffffff; font-family: 'Courier New', Courier, monospace; letter-spacing: 6px; text-align: center; margin: 0; padding: 0; line-height: 1.2;">
                                            ${code}
                                        </div>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
                
                <div class="timer-section">
                    <div class="timer-content">
                        <div class="timer-label">English</div>
                        <div class="timer-text">
                            This code is valid for the next <strong>15 minutes</strong>. If you didn't request this email, you can safely ignore it.
                        </div>
                    </div>
                    <div class="timer-content">
                        <div class="timer-label">Español</div>
                        <div class="timer-text">
                            Este código es válido por los próximos <strong>15 minutos</strong>. Si no solicitaste este correo, puedes ignorarlo de forma segura.
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="footer-section">
                <div class="support-info">
                    <div class="support-label">English</div>
                    <div class="support-text">
                        If you need further assistance, please contact our support team.
                    </div>
                </div>
                <div class="support-info">
                    <div class="support-label">Español</div>
                    <div class="support-text">
                        Si necesitas asistencia adicional, por favor contacta a nuestro equipo de soporte.
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `;
};

export { sendEmail, HTMLRecoveryEmail };