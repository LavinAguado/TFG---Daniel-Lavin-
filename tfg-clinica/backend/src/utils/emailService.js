const nodemailer = require('nodemailer');

const CLINIC_TIME_ZONE = 'Europe/Madrid';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Envía un plan de entrenamiento por email al paciente.
 * 
 * @param {string} email - Email del paciente
 * @param {string} nombre - Nombre del paciente
 * @param {Buffer} pdfBuffer - Buffer del PDF generado
 */
/**
 * @param {Object|null} proximaCita - Objeto con { fecha, profesional } o null
 */
const sendTrainingEmail = async (email, nombre, pdfBuffer, proximaCita = null) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ [EMAIL] EMAIL_USER o EMAIL_PASS no configurados. Saltando envío de correo.');
    return;
  }

  // Bloque de próxima cita para el email
  let citaHtml = '';
  if (proximaCita) {
    const fecha = new Date(proximaCita.fecha);
    const fechaStr = fecha.toLocaleDateString('es-ES', {
      timeZone: CLINIC_TIME_ZONE,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const horaStr = fecha.toLocaleTimeString('es-ES', {
      timeZone: CLINIC_TIME_ZONE,
      hour: '2-digit',
      minute: '2-digit'
    });
    citaHtml = `
      <div style="margin-top:28px;padding:20px 24px;background:#f0f9ff;border-left:4px solid #0ea5e9;border-radius:8px;">
        <p style="margin:0 0 6px;font-size:13px;font-weight:700;color:#0369a1;text-transform:uppercase;letter-spacing:.5px;">📅 Recordatorio de tu próxima cita</p>
        <p style="margin:0;font-size:15px;color:#0f172a;"><strong>Fecha:</strong> ${fechaStr}</p>
        <p style="margin:4px 0 0;font-size:15px;color:#0f172a;"><strong>Hora:</strong> ${horaStr}</p>
        <p style="margin:4px 0 0;font-size:15px;color:#0f172a;"><strong>Profesional:</strong> ${proximaCita.profesional}</p>
      </div>
    `;
  }

  const mailOptions = {
    from: `"TheraTrack" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Tu nuevo plan de entrenamiento - TheraTrack`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#1e293b;">
        <div style="background:#0f172a;padding:28px 32px;border-radius:12px 12px 0 0;">
          <h1 style="margin:0;font-size:22px;color:#ffffff;">💪 TheraTrack</h1>
          <p style="margin:4px 0 0;font-size:14px;color:#94a3b8;">Tu plataforma de seguimiento clínico</p>
        </div>
        <div style="background:#ffffff;padding:32px;border:1px solid #e2e8f0;border-top:none;border-radius:0 0 12px 12px;">
          <p style="font-size:16px;margin:0 0 12px;">Hola <strong>${nombre}</strong>,</p>
          <p style="font-size:15px;color:#475569;margin:0;">Tu profesional ha preparado un nuevo <strong>plan de entrenamiento personalizado</strong> para ti. Lo encontrarás adjunto a este correo en formato PDF.</p>
          <p style="font-size:15px;color:#475569;margin:16px 0 0;">¡Mucho ánimo con la recuperación! Recuerda seguir las indicaciones y contactar con tu profesional ante cualquier duda.</p>
          ${citaHtml}
          <hr style="border:none;border-top:1px solid #f1f5f9;margin:28px 0;" />
          <p style="font-size:12px;color:#94a3b8;margin:0;">Este correo ha sido generado automáticamente por TheraTrack. Por favor, no respondas a este mensaje.</p>
        </div>
      </div>
    `,
    attachments: [
      {
        filename: 'plan_entrenamiento.pdf',
        content: pdfBuffer
      }
    ]
  };

  try {
    console.log(`📧 [EMAIL] Intentando enviar email a: ${email}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [EMAIL] Email enviado con éxito: ${info.messageId}`);
    return info;
  } catch (err) {
    console.error('❌ [EMAIL] Error al enviar email:', err.message);
    // No lanzamos el error para no romper el flujo principal
  }
};

module.exports = { sendTrainingEmail };
