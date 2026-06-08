const PDFDocument = require('pdfkit');

/**
 * Genera un PDF rediseñado y profesional para los planes de entrenamiento de TheraTrack.
 * Incluye secciones de paciente, ejercicios detallados, próxima cita e instrucciones.
 */
const generateEntrenamientoPDF = (entrenamiento) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: 'Plan de Entrenamiento Personalizado',
          Author: 'TheraTrack',
          Subject: `Plan para ${entrenamiento.pacientes?.nombre || 'Paciente'}`,
        }
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      // --- PALETA DE COLORES (TheraTrack Premium) ---
      const COLORS = {
        PRIMARY: '#0f172a',    // Slate 900
        SECONDARY: '#0284c7',  // Sky 600
        ACCENT: '#38bdf8',     // Sky 400
        TEXT: '#334155',       // Slate 700
        LIGHT_TEXT: '#64748b', // Slate 500
        BG_LIGHT: '#f8fafc',   // Slate 50
        WHITE: '#ffffff',
        BORDER: '#e2e8f0'      // Slate 200
      };

      // --- HEADER ---
      doc.rect(0, 0, 612, 120).fill(COLORS.BG_LIGHT);
      
      doc
        .fontSize(28)
        .fillColor(COLORS.PRIMARY)
        .font('Helvetica-Bold')
        .text('THERA', 50, 45, { continued: true })
        .fillColor(COLORS.SECONDARY)
        .text('TRACK');

      doc
        .fontSize(10)
        .fillColor(COLORS.LIGHT_TEXT)
        .font('Helvetica-Bold')
        .text('PLAN DE ENTRENAMIENTO PERSONALIZADO', 50, 75, { characterSpacing: 1 });

      // Línea decorativa
      doc
        .moveTo(50, 100)
        .lineTo(150, 100)
        .strokeColor(COLORS.SECONDARY)
        .lineWidth(3)
        .stroke();

      doc.moveDown(4);

      // --- SECCIÓN: DATOS DEL PACIENTE Y PROFESIONAL ---
      const startY = doc.y;
      
      // Columna 1: Paciente
      doc
        .fontSize(9)
        .fillColor(COLORS.LIGHT_TEXT)
        .font('Helvetica-Bold')
        .text('PACIENTE', 50, startY);
      
      doc
        .fontSize(12)
        .fillColor(COLORS.PRIMARY)
        .font('Helvetica-Bold')
        .text(`${entrenamiento.pacientes?.nombre || ''} ${entrenamiento.pacientes?.apellidos || ''}`, 50, startY + 15);

      // Columna 2: Fecha
      doc
        .fontSize(9)
        .fillColor(COLORS.LIGHT_TEXT)
        .text('FECHA DE ASIGNACIÓN', 250, startY);
      
      doc
        .fontSize(12)
        .fillColor(COLORS.PRIMARY)
        .text(new Date(entrenamiento.fecha).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' }), 250, startY + 15);

      // Columna 3: Profesional
      doc
        .fontSize(9)
        .fillColor(COLORS.LIGHT_TEXT)
        .text('PROFESIONAL', 430, startY);
      
      doc
        .fontSize(12)
        .fillColor(COLORS.PRIMARY)
        .text(entrenamiento.usuarios?.nombre || 'Especialista TheraTrack', 430, startY + 15);

      doc.moveDown(3);

      // Notas del profesional (si existen)
      if (entrenamiento.notas) {
        doc
          .rect(50, doc.y, 495, 45)
          .fill(COLORS.BG_LIGHT);
        
        doc
          .fontSize(9)
          .fillColor(COLORS.SECONDARY)
          .font('Helvetica-Bold')
          .text('NOTAS CLÍNICAS:', 65, doc.y + 10);
        
        doc
          .fontSize(10)
          .fillColor(COLORS.TEXT)
          .font('Helvetica-Oblique')
          .text(entrenamiento.notas, 65, doc.y + 2);
        
        doc.moveDown(3);
      }

      // --- SECCIÓN: EJERCICIOS (CARD LAYOUT) ---
      doc
        .fontSize(14)
        .fillColor(COLORS.PRIMARY)
        .font('Helvetica-Bold')
        .text('PROGRAMA DE EJERCICIOS', 50);

      doc.moveDown(1);

      const ejercicios = entrenamiento.entrenamiento_ejercicios || [];

      ejercicios.forEach((ee, index) => {
        // Comprobar espacio para evitar cortes feos
        if (doc.y > 650) doc.addPage();

        const cardY = doc.y;
        
        // Card Background
        doc
          .roundedRect(50, cardY, 495, 80, 10)
          .fillAndStroke(COLORS.BG_LIGHT, COLORS.BORDER);

        // Número y Nombre
        doc
          .fontSize(14)
          .fillColor(COLORS.SECONDARY)
          .font('Helvetica-Bold')
          .text((index + 1).toString().padStart(2, '0'), 70, cardY + 20);

        doc
          .fontSize(12)
          .fillColor(COLORS.PRIMARY)
          .font('Helvetica-Bold')
          .text(ee.ejercicios?.nombre || 'Ejercicio', 105, cardY + 20);

        // Parámetros
        doc
          .fontSize(10)
          .fillColor(COLORS.TEXT)
          .font('Helvetica')
          .text('Series: ', 105, cardY + 45, { continued: true })
          .font('Helvetica-Bold').text(ee.series || '-', { continued: true })
          .font('Helvetica').text('  •  Reps: ', { continued: true })
          .font('Helvetica-Bold').text(ee.repeticiones || '-', { continued: true })
          .font('Helvetica').text('  •  Esfuerzo (RPE): ', { continued: true })
          .font('Helvetica-Bold').text(ee.esfuerzo ? `${ee.esfuerzo}/10` : '-');

        // Link Video
        if (ee.ejercicios?.video_url) {
          doc
            .fontSize(9)
            .fillColor(COLORS.SECONDARY)
            .font('Helvetica-Bold')
            .text('VER VIDEO GUÍA ↗', 430, cardY + 22, {
              link: ee.ejercicios.video_url,
              underline: true,
              align: 'right',
              width: 100
            });
        }

        doc.y = cardY + 95;
      });

      // --- SECCIÓN: PRÓXIMA CITA ---
      if (entrenamiento.proxima_cita && entrenamiento.proxima_cita.fecha) {
        if (doc.y > 700) doc.addPage();
        
        doc.moveDown(1);
        const citaY = doc.y;

        doc
          .roundedRect(50, citaY, 495, 60, 10)
          .fill('#f0f9ff'); // Sky 50

        doc
          .fontSize(10)
          .fillColor(COLORS.SECONDARY)
          .font('Helvetica-Bold')
          .text('PRÓXIMA SESIÓN PROGRAMADA', 70, citaY + 15);

        const fechaCita = new Date(entrenamiento.proxima_cita.fecha).toLocaleDateString('es-ES', {
          timeZone: 'Europe/Madrid',
          weekday: 'long', day: 'numeric', month: 'long'
        });
        const horaCita = new Date(entrenamiento.proxima_cita.fecha).toLocaleTimeString('es-ES', {
          timeZone: 'Europe/Madrid',
          hour: '2-digit', minute: '2-digit'
        });

        doc
          .fontSize(11)
          .fillColor(COLORS.PRIMARY)
          .text(`${fechaCita} a las ${horaCita}`, 70, citaY + 30, { continued: true })
          .fontSize(9)
          .fillColor(COLORS.LIGHT_TEXT)
          .font('Helvetica')
          .text(`  con ${entrenamiento.proxima_cita.profesional}`);
      }

      // --- SECCIÓN: INSTRUCCIONES Y SEGUIMIENTO ---
      doc.moveDown(3);
      if (doc.y > 650) doc.addPage();

      const footerBoxY = doc.y;
      doc
        .rect(50, footerBoxY, 495, 100)
        .fill(COLORS.PRIMARY);

      doc
        .fontSize(12)
        .fillColor(COLORS.WHITE)
        .font('Helvetica-Bold')
        .text('TU SEGUIMIENTO ES VITAL', 70, footerBoxY + 20);

      doc
        .fontSize(9)
        .fillColor(COLORS.ACCENT)
        .font('Helvetica')
        .text('Al finalizar tu rutina, por favor registra tus sensaciones en el enlace de abajo. Esto nos ayuda a ajustar tu tratamiento de forma precisa.', 70, footerBoxY + 40, { width: 350 });

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const trackingUrl = `${frontendUrl}/seguimiento/${entrenamiento.id}`;

      doc
        .fontSize(11)
        .fillColor(COLORS.WHITE)
        .font('Helvetica-Bold')
        .text('REGISTRAR MI FEEDBACK AQUÍ ↗', 70, footerBoxY + 70, {
          link: trackingUrl,
          underline: true
        });

      // --- FOOTER ---
      doc
        .fontSize(8)
        .fillColor(COLORS.LIGHT_TEXT)
        .font('Helvetica')
        .text('TheraTrack - Sistema de Gestión de Fisioterapia Avanzada', 50, 780, { align: 'center' });

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateEntrenamientoPDF };
