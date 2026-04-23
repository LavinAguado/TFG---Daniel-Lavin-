/**
 * pdfGenerator.js
 * 
 * Utilidad para generar PDFs de planes de entrenamiento.
 * 
 * IMPORTANTE: Este documento PDF será entregado al paciente como guía
 * de su plan de entrenamiento personalizado.
 * 
 * FUTURO: Esta utilidad está preparada para integración con email.
 * La función devuelve un Buffer que puede adjuntarse directamente
 * a un correo electrónico usando nodemailer (ya instalado en el proyecto).
 * Ejemplo futuro:
 *   const pdfBuffer = await generateEntrenamientoPDF(entrenamiento);
 *   await transporter.sendMail({
 *     to: paciente.email,
 *     subject: 'Tu plan de entrenamiento',
 *     attachments: [{ filename: 'entrenamiento.pdf', content: pdfBuffer }]
 *   });
 * 
 * IMPORTANTE: En una fase posterior se implementará Row Level Security (RLS)
 * para restringir acceso a nivel de base de datos.
 * No implementar RLS todavía.
 */

const PDFDocument = require('pdfkit');

/**
 * Genera un PDF con los datos de un entrenamiento.
 * 
 * @param {Object} entrenamiento - Objeto con datos completos del entrenamiento
 * @param {Object} entrenamiento.pacientes - Datos del paciente { nombre, apellidos }
 * @param {string} entrenamiento.fecha - Fecha del entrenamiento (ISO string)
 * @param {string} entrenamiento.notas - Notas del entrenamiento
 * @param {Array}  entrenamiento.entrenamiento_ejercicios - Lista de ejercicios asignados
 * @returns {Promise<Buffer>} Buffer del PDF generado
 */
const generateEntrenamientoPDF = (entrenamiento) => {
  return new Promise((resolve, reject) => {
    try {
      console.log('📄 [PDF] Iniciando generación de PDF...');

      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: 'Plan de Entrenamiento',
          Author: 'Clínica - Sistema de Gestión',
          Subject: `Entrenamiento del paciente ${entrenamiento.pacientes?.nombre || 'N/A'}`,
          Creator: 'TFG Clínica Backend'
        }
      });

      const chunks = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        console.log(`📄 [PDF] PDF generado correctamente (${(pdfBuffer.length / 1024).toFixed(1)} KB)`);
        resolve(pdfBuffer);
      });
      doc.on('error', (err) => {
        console.error('❌ [PDF] Error al generar PDF:', err);
        reject(err);
      });

      // ─── COLORES ─────────────────────────────────────────
      const COLOR_PRIMARY = '#1a365d';    // Azul oscuro
      const COLOR_SECONDARY = '#2b6cb0';  // Azul medio
      const COLOR_ACCENT = '#3182ce';     // Azul accent
      const COLOR_TEXT = '#2d3748';        // Gris oscuro
      const COLOR_LIGHT_TEXT = '#718096';  // Gris claro
      const COLOR_BG_HEADER = '#ebf4ff';  // Fondo azul claro
      const COLOR_BG_ROW_ALT = '#f7fafc'; // Fondo fila alterna
      const COLOR_LINE = '#cbd5e0';       // Línea separadora

      // ─── CABECERA ────────────────────────────────────────
      doc
        .fontSize(24)
        .fillColor(COLOR_PRIMARY)
        .font('Helvetica-Bold')
        .text('PLAN DE ENTRENAMIENTO', { align: 'center' });

      doc.moveDown(0.3);

      doc
        .fontSize(10)
        .fillColor(COLOR_SECONDARY)
        .font('Helvetica')
        .text('Clínica - Sistema de Gestión de Pacientes', { align: 'center' });

      doc.moveDown(0.5);

      // Línea decorativa
      const lineY = doc.y;
      doc
        .strokeColor(COLOR_ACCENT)
        .lineWidth(2)
        .moveTo(50, lineY)
        .lineTo(545, lineY)
        .stroke();

      doc.moveDown(1);

      // ─── AVISO: DOCUMENTO PARA EL PACIENTE ───────────────
      const avisoY = doc.y;
      doc
        .rect(50, avisoY, 495, 35)
        .fill(COLOR_BG_HEADER);

      doc
        .fontSize(9)
        .fillColor(COLOR_SECONDARY)
        .font('Helvetica-BoldOblique')
        .text(
          '⚕ Este documento será entregado al paciente como guía de su plan de entrenamiento personalizado.',
          60, avisoY + 11,
          { width: 475, align: 'center' }
        );

      doc.y = avisoY + 45;
      doc.moveDown(0.5);

      // ─── DATOS DEL PACIENTE ──────────────────────────────
      const paciente = entrenamiento.pacientes;
      const nombrePaciente = paciente
        ? `${paciente.nombre || ''} ${paciente.apellidos || ''}`.trim()
        : 'No especificado';

      // Formatear fecha
      let fechaFormateada = 'No especificada';
      if (entrenamiento.fecha) {
        try {
          const fecha = new Date(entrenamiento.fecha);
          fechaFormateada = fecha.toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          // Capitalizar primera letra
          fechaFormateada = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
        } catch {
          fechaFormateada = entrenamiento.fecha;
        }
      }

      doc
        .fontSize(11)
        .fillColor(COLOR_PRIMARY)
        .font('Helvetica-Bold')
        .text('DATOS DEL ENTRENAMIENTO', 50);

      doc.moveDown(0.3);

      // Línea fina
      doc
        .strokeColor(COLOR_LINE)
        .lineWidth(0.5)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc.moveDown(0.5);

      // Campos
      const drawField = (label, value) => {
        const yPos = doc.y;
        doc
          .fontSize(10)
          .fillColor(COLOR_LIGHT_TEXT)
          .font('Helvetica-Bold')
          .text(`${label}:`, 60, yPos, { continued: true, width: 100 });
        doc
          .fillColor(COLOR_TEXT)
          .font('Helvetica')
          .text(`  ${value}`, { width: 400 });
        doc.moveDown(0.2);
      };

      drawField('Paciente', nombrePaciente);
      drawField('Fecha', fechaFormateada);

      if (entrenamiento.notas) {
        drawField('Notas', entrenamiento.notas);
      }

      doc.moveDown(1);

      // ─── TABLA DE EJERCICIOS ─────────────────────────────
      const ejercicios = entrenamiento.entrenamiento_ejercicios || [];

      doc
        .fontSize(11)
        .fillColor(COLOR_PRIMARY)
        .font('Helvetica-Bold')
        .text('EJERCICIOS ASIGNADOS', 50);

      doc.moveDown(0.3);

      doc
        .strokeColor(COLOR_LINE)
        .lineWidth(0.5)
        .moveTo(50, doc.y)
        .lineTo(545, doc.y)
        .stroke();

      doc.moveDown(0.5);

      if (ejercicios.length === 0) {
        doc
          .fontSize(10)
          .fillColor(COLOR_LIGHT_TEXT)
          .font('Helvetica-Oblique')
          .text('No hay ejercicios asignados a este entrenamiento.', 60);
      } else {
        // Columnas de la tabla
        const tableLeft = 55;
        const colWidths = { num: 30, nombre: 220, series: 60, reps: 75, esfuerzo: 75 };
        const rowHeight = 25;

        // Cabecera de la tabla
        const headerY = doc.y;
        doc
          .rect(tableLeft - 5, headerY, 490, rowHeight)
          .fill(COLOR_PRIMARY);

        doc
          .fontSize(9)
          .fillColor('#ffffff')
          .font('Helvetica-Bold');

        let xOffset = tableLeft;
        doc.text('#', xOffset, headerY + 8, { width: colWidths.num, align: 'center' });
        xOffset += colWidths.num;
        doc.text('Ejercicio', xOffset, headerY + 8, { width: colWidths.nombre, align: 'left' });
        xOffset += colWidths.nombre;
        doc.text('Series', xOffset, headerY + 8, { width: colWidths.series, align: 'center' });
        xOffset += colWidths.series;
        doc.text('Repeticiones', xOffset, headerY + 8, { width: colWidths.reps, align: 'center' });
        xOffset += colWidths.reps;
        doc.text('Esfuerzo', xOffset, headerY + 8, { width: colWidths.esfuerzo, align: 'center' });

        doc.y = headerY + rowHeight;

        // Filas de datos
        ejercicios.forEach((ee, index) => {
          const rowY = doc.y;
          const isAlt = index % 2 === 1;

          // Comprobar si hay espacio suficiente, si no, nueva página
          if (rowY + rowHeight > 750) {
            doc.addPage();
            doc.y = 50;
          }

          const currentRowY = doc.y;

          // Fondo alterno
          if (isAlt) {
            doc
              .rect(tableLeft - 5, currentRowY, 490, rowHeight)
              .fill(COLOR_BG_ROW_ALT);
          }

          // Línea inferior de fila
          doc
            .strokeColor(COLOR_LINE)
            .lineWidth(0.3)
            .moveTo(tableLeft - 5, currentRowY + rowHeight)
            .lineTo(tableLeft + 485, currentRowY + rowHeight)
            .stroke();

          const nombreEjercicio = ee.ejercicios?.nombre || 'Sin nombre';
          const series = ee.series != null ? ee.series.toString() : '-';
          const repeticiones = ee.repeticiones != null ? ee.repeticiones.toString() : '-';
          const esfuerzo = ee.esfuerzo != null ? `${ee.esfuerzo}/10` : '-';

          doc
            .fontSize(9)
            .fillColor(COLOR_TEXT)
            .font('Helvetica');

          xOffset = tableLeft;
          doc.text((index + 1).toString(), xOffset, currentRowY + 8, { width: colWidths.num, align: 'center' });
          xOffset += colWidths.num;

          doc.font('Helvetica-Bold');
          doc.text(nombreEjercicio, xOffset, currentRowY + 8, { width: colWidths.nombre, align: 'left' });

          doc.font('Helvetica');
          xOffset += colWidths.nombre;
          doc.text(series, xOffset, currentRowY + 8, { width: colWidths.series, align: 'center' });
          xOffset += colWidths.series;
          doc.text(repeticiones, xOffset, currentRowY + 8, { width: colWidths.reps, align: 'center' });
          xOffset += colWidths.reps;
          doc.text(esfuerzo, xOffset, currentRowY + 8, { width: colWidths.esfuerzo, align: 'center' });

          doc.y = currentRowY + rowHeight;
        });

        doc.moveDown(0.5);

        // Resumen
        doc
          .fontSize(9)
          .fillColor(COLOR_LIGHT_TEXT)
          .font('Helvetica-Oblique')
          .text(`Total de ejercicios: ${ejercicios.length}`, tableLeft);
      }

      // ─── PIE DE PÁGINA ──────────────────────────────────
      doc.moveDown(2);

      const footerLineY = doc.y;
      doc
        .strokeColor(COLOR_LINE)
        .lineWidth(0.5)
        .moveTo(50, footerLineY)
        .lineTo(545, footerLineY)
        .stroke();

      doc.moveDown(0.5);

      const now = new Date();
      const generadoEl = now.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }) + ' ' + now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });

      doc
        .fontSize(8)
        .fillColor(COLOR_LIGHT_TEXT)
        .font('Helvetica')
        .text(`Documento generado el: ${generadoEl}`, 50, doc.y, { align: 'center' });

      doc.moveDown(0.3);

      doc
        .fontSize(8)
        .fillColor(COLOR_ACCENT)
        .font('Helvetica-Oblique')
        .text('📧 Preparado para envío por email al paciente.', { align: 'center' });

      // Finalizar documento
      doc.end();

    } catch (err) {
      console.error('❌ [PDF] Error fatal en generación de PDF:', err);
      reject(err);
    }
  });
};

module.exports = {
  generateEntrenamientoPDF
};
