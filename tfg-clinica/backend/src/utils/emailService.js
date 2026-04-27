const nodemailer = require('nodemailer');

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
const sendTrainingEmail = async (email, nombre, pdfBuffer) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️ [EMAIL] EMAIL_USER o EMAIL_PASS no configurados. Saltando envío de correo.');
    return;
  }

  const mailOptions = {
    from: `"TheraTrack" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `Tu nuevo plan de entrenamiento - TheraTrack`,
    text: `Hola ${nombre},\n\nAdjuntamos tu nuevo plan de entrenamiento personalizado. ¡Mucho ánimo con la recuperación!\n\nSaludos,\nEl equipo de TheraTrack`,
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
