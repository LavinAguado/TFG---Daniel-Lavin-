const PDFDocument = require('pdfkit');

/**
 * Genera un PDF con los datos de un entrenamiento.
 */
const generateEntrenamientoPDF = (entrenamiento) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: 'Plan de Entrenamiento',
          Author: 'TheraTrack',
          Subject: `Entrenamiento para ${entrenamiento.pacientes?.nombre || 'Paciente'}`,
        }
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const COLOR_PRIMARY = '#0f172a';    // Slate 900
      const COLOR_ACCENT = '#0284c7';     // Sky 600
      const COLOR_TEXT = '#334155';       // Slate 700
      const COLOR_LIGHT = '#94a3b8';      // Slate 400
      const COLOR_BG = '#f8fafc';         // Slate 50

      // --- CABECERA ---
      doc
        .fontSize(28)
        .fillColor(COLOR_PRIMARY)
        .font('Helvetica-Bold')
        .text('THERATRACK', { align: 'left', continued: true })
        .fillColor(COLOR_ACCENT)
        .text(' PLAN');

      doc.moveDown(0.2);

      doc
        .fontSize(10)
        .fillColor(COLOR_LIGHT)
        .font('Helvetica')
        .text('Guía de ejercicios personalizada para tu recuperación.');

      doc.moveDown(1.5);

      // --- DATOS PACIENTE ---
      const nombre = `${entrenamiento.pacientes?.nombre || ''} ${entrenamiento.pacientes?.apellidos || ''}`;
      const fecha = new Date(entrenamiento.fecha).toLocaleDateString('es-ES', { 
        day: 'numeric', month: 'long', year: 'numeric' 
      });

      doc
        .fontSize(12)
        .fillColor(COLOR_PRIMARY)
        .font('Helvetica-Bold')
        .text('DETALLES DEL PACIENTE');

      doc.moveDown(0.5);

      doc
        .fontSize(10)
        .fillColor(COLOR_TEXT)
        .font('Helvetica-Bold')
        .text('Nombre: ', { continued: true })
        .font('Helvetica').text(nombre)
        .font('Helvetica-Bold')
        .text('Fecha asignada: ', { continued: true })
        .font('Helvetica').text(fecha);

      if (entrenamiento.notas) {
        doc.moveDown(0.5);
        doc
          .font('Helvetica-Bold')
          .text('Notas del profesional: ', { continued: true })
          .font('Helvetica-Oblique').text(entrenamiento.notas);
      }

      doc.moveDown(2);

      // --- TABLA DE EJERCICIOS ---
      doc
        .fontSize(12)
        .fillColor(COLOR_PRIMARY)
        .font('Helvetica-Bold')
        .text('LISTA DE EJERCICIOS');

      doc.moveDown(1);

      const ejercicios = entrenamiento.entrenamiento_ejercicios || [];

      ejercicios.forEach((ee, index) => {
        const yStart = doc.y;

        // Cuadro de fondo para el ejercicio
        doc
          .rect(50, yStart - 5, 495, 65)
          .fill(COLOR_BG);

        doc
          .fontSize(11)
          .fillColor(COLOR_PRIMARY)
          .font('Helvetica-Bold')
          .text(`${index + 1}. ${ee.ejercicios?.nombre || 'Ejercicio'}`, 65, yStart + 5);

        doc
          .fontSize(9)
          .fillColor(COLOR_TEXT)
          .font('Helvetica')
          .text(`Series: `, 65, yStart + 25, { continued: true })
          .font('Helvetica-Bold').text(ee.series || '-', { continued: true })
          .font('Helvetica').text('  |  Repeticiones: ', { continued: true })
          .font('Helvetica-Bold').text(ee.repeticiones || '-', { continued: true })
          .font('Helvetica').text('  |  Esfuerzo (RPE): ', { continued: true })
          .font('Helvetica-Bold').text(ee.esfuerzo ? `${ee.esfuerzo}/10` : '-');

        // Enlace al video
        if (ee.ejercicios?.video_url) {
          doc
            .fontSize(9)
            .fillColor(COLOR_ACCENT)
            .font('Helvetica-Bold')
            .text('▶ Ver video demostrativo', 65, yStart + 42, {
              link: ee.ejercicios.video_url,
              underline: true
            });
        } else {
          doc
            .fontSize(9)
            .fillColor(COLOR_LIGHT)
            .font('Helvetica-Oblique')
            .text('No hay video disponible', 65, yStart + 42);
        }

        doc.moveDown(2.5);
      });

      // --- PIE DE PÁGINA CON ENLACE DE SEGUIMIENTO ---
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      const trackingUrl = `${frontendUrl}/seguimiento/${entrenamiento.id}`;

      // Ir al final de la página si queda poco espacio
      if (doc.y > 700) doc.addPage();

      doc.moveDown(2);

      doc
        .rect(50, doc.y, 495, 60)
        .fill(COLOR_PRIMARY);

      doc
        .fontSize(11)
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .text('¡TU OPINIÓN ES IMPORTANTE!', 65, doc.y + 15, { align: 'center' });

      doc
        .fontSize(9)
        .fillColor('#cbd5e1')
        .font('Helvetica')
        .text('Haz clic aquí para completar tu seguimiento después de entrenar:', { align: 'center' });

      doc
        .fontSize(10)
        .fillColor('#38bdf8')
        .font('Helvetica-Bold')
        .text('REGISTRAR MI FEEDBACK', {
          align: 'center',
          link: trackingUrl,
          underline: true
        });

      doc.end();

    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateEntrenamientoPDF };
