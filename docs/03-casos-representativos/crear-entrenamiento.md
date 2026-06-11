# Crear entrenamiento y recoger seguimiento

## Objetivo

Permitir que un profesional cree una pauta personalizada, la entregue al paciente en PDF y recoja posteriormente su percepción de dolor, esfuerzo y dificultad.

## Flujo principal

1. El profesional abre la ficha de un paciente.
2. Selecciona ejercicios y define series, repeticiones y esfuerzo objetivo.
3. El frontend envía el entrenamiento a `POST /api/entrenamientos`.
4. El backend guarda entrenamiento y ejercicios dentro de una transacción.
5. El sistema genera el PDF y lo envía por correo.
6. El paciente abre el enlace de seguimiento incluido en la documentación.
7. El paciente registra resultados mediante `POST /api/seguimiento-completo`.
8. El profesional consulta la evolución y el resumen clínico.

## Trazabilidad

| Vista | Recurso |
|---|---|
| Caso de uso | [CU3: crear entrenamiento](../02-actores-casos-uso/diagramas/cu-03-crear-entrenamiento.png) |
| Actividad | [Generar y enviar plantilla](../04-analisis/actividades/generar-enviar-plantilla.png) |
| Secuencia | [Generar y enviar plantilla](../05-diseno/secuencias/generar-enviar-plantilla.png) |
| Frontend | [`PacienteDetalle.jsx`](../../frontend/src/pages/PacienteDetalle.jsx) |
| API | [`entrenamientosRoutes.js`](../../backend/src/routes/entrenamientosRoutes.js) |
| Negocio | [`entrenamientosController.js`](../../backend/src/controllers/entrenamientosController.js) |
| PDF | [`pdfGenerator.js`](../../backend/src/utils/pdfGenerator.js) |
| Correo | [`emailService.js`](../../backend/src/utils/emailService.js) |
| Seguimiento | [`seguimientoController.js`](../../backend/src/controllers/seguimientoController.js) |
| Persistencia | [`schema.sql`](../../backend/src/database/schema.sql) |

## Alternativas y errores

- Paciente inexistente: respuesta `404`.
- Datos obligatorios ausentes: respuesta `400`.
- Fallo de persistencia: rollback de la transacción.
- Paciente sin correo: el entrenamiento se guarda, pero no se envía.
- Fallo de PDF o correo: se registra el error sin perder el entrenamiento guardado.

[← Casos representativos](README.md) · [Ir al análisis →](../04-analisis/README.md)
