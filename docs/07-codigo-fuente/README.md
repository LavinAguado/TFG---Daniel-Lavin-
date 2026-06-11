# 07. Código fuente

Este apartado sirve como lista de archivos que abrir en el IDE. No es necesario recorrer todo el proyecto: el caso conductor puede demostrarse con seis archivos.

## Recorrido recomendado

| Orden | Archivo | Qué explicar |
|---:|---|---|
| 1 | [`frontend/src/App.jsx`](../../frontend/src/App.jsx) | Rutas públicas y privadas |
| 2 | [`frontend/src/pages/PacienteDetalle.jsx`](../../frontend/src/pages/PacienteDetalle.jsx) | Construcción del entrenamiento |
| 3 | [`backend/src/app.js`](../../backend/src/app.js) | Composición de rutas y autenticación |
| 4 | [`backend/src/routes/entrenamientosRoutes.js`](../../backend/src/routes/entrenamientosRoutes.js) | Contrato HTTP |
| 5 | [`backend/src/controllers/entrenamientosController.js`](../../backend/src/controllers/entrenamientosController.js) | Transacción, PDF y correo |
| 6 | [`backend/src/database/schema.sql`](../../backend/src/database/schema.sql) | Persistencia y RLS |

## Otros puntos técnicos

- Seguridad: [`authMiddleware.js`](../../backend/src/middleware/authMiddleware.js)
- Contexto RLS: [`dbUtils.js`](../../backend/src/config/dbUtils.js)
- Generación documental: [`pdfGenerator.js`](../../backend/src/utils/pdfGenerator.js)
- Correo: [`emailService.js`](../../backend/src/utils/emailService.js)
- Seguimiento público: [`Seguimiento.jsx`](../../frontend/src/pages/Seguimiento.jsx)
- Resumen determinista: [`resumenController.js`](../../backend/src/controllers/resumenController.js)
- Pruebas E2E: [`e2e-backend.test.js`](../../backend/tests/e2e-backend.test.js)

## Índices completos

- [Documentación del frontend](../../frontend/README.md)
- [Documentación del backend y API](../../backend/README.md)

[← Arquitectura](../06-arquitectura/README.md) · [Siguiente: demostración →](../08-demostracion/README.md)
