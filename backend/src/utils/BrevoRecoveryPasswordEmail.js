// Archivo: RecoveryPassword.js

import fetch from "node-fetch";

// Aqui colocar la API KEY que obtuvieron de Brevo
const apiKey = process.env.BREVO_API_KEY;
console.log("Mi API Key de Brevo es:", process.env.BREVO_API_KEY);

const RecoveryPassword = async function enviarCorreo(email, code) {
  const response = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
      accept: "application/json",
      "api-key": apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sender: { name: "Tractor Import", email: "lovercotes@gmail.com" }, // Correo registrado en Brevo
      to: [{ email: email }],
      subject: "Recuperación de Contraseña - Tractor Import",
      htmlContent: `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tractor Import - Recuperación de Contraseña</title>
</head>
<body style="font-family: 'Inter', sans-serif; background: #CDDACC; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 15px; margin: 0;">
    <div class="email-container" style="width: 100%; max-width: 720px; margin: 0 auto;">
        <div class="email-card" style="background: white; border-radius: 20px; box-shadow: 0 20px 40px -12px rgba(28, 64, 36, 0.2); overflow: hidden; border: 1px solid rgba(76, 143, 63, 0.2);">
            
            <div class="header-section" style="background: linear-gradient(135deg, #f0f5f0, #e2ebe2); padding: 40px 30px 35px; text-align: center; border-top: 4px solid #1C4024;">
                <div class="brand-logo" style="font-family: 'Inter', sans-serif; font-size: 32px; font-weight: 800; color: #1C4024; margin-bottom: 12px; letter-spacing: 0.5px;">
                    Tractor Import
                </div>
                <h1 class="main-title" style="font-size: 24px; font-weight: 700; color: #1C4024; margin-bottom: 6px;">
                    Password Recovery | Recuperación de Contraseña
                </h1>
                <p class="subtitle" style="font-size: 14px; color: #4C8F3F; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; margin: 0;">
                    Secure Access | Acceso Seguro
                </p>
            </div>
            
            <div class="content-section" style="padding: 35px 30px;">
                <div class="welcome-message" style="background: #f8fafc; border-radius: 16px; padding: 28px; margin-bottom: 35px; border: 1px solid #CDDACC;">
                    <div class="language-block" style="margin-bottom: 16px;">
                        <div class="language-label" style="font-weight: 700; color: #1C4024; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                            English
                        </div>
                        <div class="language-text" style="color: #475569; line-height: 1.6; font-size: 16px;">
                            Hello! We received a request to reset your password. Use the verification code below to proceed with your account recovery.
                        </div>
                    </div>
                    <div class="language-block" style="margin-bottom: 0;">
                        <div class="language-label" style="font-weight: 700; color: #1C4024; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                            Español
                        </div>
                        <div class="language-text" style="color: #475569; line-height: 1.6; font-size: 16px;">
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
                
                <div class="timer-section" style="background: #f0f5f0; border-radius: 16px; padding: 24px; margin: 35px 0; border-left: 4px solid #4C8F3F;">
                    <div class="timer-content" style="margin-bottom: 14px;">
                        <div class="timer-label" style="font-weight: 700; color: #1C4024; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                            English
                        </div>
                        <div class="timer-text" style="color: #334155; line-height: 1.6; font-size: 15px;">
                            This code is valid for the next <strong>15 minutes</strong>. If you didn't request this email, you can safely ignore it.
                        </div>
                    </div>
                    <div class="timer-content" style="margin-bottom: 0;">
                        <div class="timer-label" style="font-weight: 700; color: #1C4024; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                            Español
                        </div>
                        <div class="timer-text" style="color: #334155; line-height: 1.6; font-size: 15px;">
                            Este código es válido por los próximos <strong>15 minutos</strong>. Si no solicitaste este correo, puedes ignorarlo de forma segura.
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="footer-section" style="background: #f8fafc; padding: 28px; text-align: center; border-top: 1px solid #CDDACC;">
                <div class="support-info" style="margin-bottom: 14px;">
                    <div class="support-label" style="font-weight: 700; color: #1C4024; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                        English
                    </div>
                    <div class="support-text" style="color: #64748b; font-size: 15px; line-height: 1.6;">
                        If you need further assistance, please contact our support team at
                        <a href="mailto:lovercotes@gmail.com" class="support-link" style="color: #4C8F3F; text-decoration: none; font-weight: 700;">lovercotes@gmail.com</a>
                    </div>
                </div>
                <div class="support-info" style="margin-bottom: 0;">
                    <div class="support-label" style="font-weight: 700; color: #1C4024; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                        Español
                    </div>
                    <div class="support-text" style="color: #64748b; font-size: 15px; line-height: 1.6;">
                        Si necesitas asistencia adicional, por favor contacta a nuestro equipo de soporte en
                        <a href="mailto:lovercotes@gmail.com" class="support-link" style="color: #4C8F3F; text-decoration: none; font-weight: 700;">lovercotes@gmail.com</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</body>
</html>
    `,
    }),
  });

  const data = await response.json();
  console.log(data);
  console.log("Mi API Key de Brevo es:", process.env.BREVO_API_KEY);
};

export default RecoveryPassword;