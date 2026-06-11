# 07. Código fuente

La implementación mantiene una separación clara entre interfaz, contratos HTTP, lógica de aplicación, servicios y persistencia.

## Trazabilidad de la solución

| Capa | Archivo | Responsabilidad |
|---|---|---|
| Navegación | [`frontend/src/App.jsx`](../../frontend/src/App.jsx) | Rutas públicas y privadas |
| Interfaz | [`frontend/src/pages/PacienteDetalle.jsx`](../../frontend/src/pages/PacienteDetalle.jsx) | Ficha clínica y creación de entrenamientos |
| Composición API | [`backend/src/app.js`](../../backend/src/app.js) | Middlewares y módulos de rutas |
| Contrato HTTP | [`entrenamientosRoutes.js`](../../backend/src/routes/entrenamientosRoutes.js) | Endpoints de entrenamiento |
| Aplicación | [`entrenamientosController.js`](../../backend/src/controllers/entrenamientosController.js) | Transacción, PDF y correo |
| Persistencia | [`schema.sql`](../../backend/src/database/schema.sql) | Tablas, relaciones, índices y RLS |

## Componentes técnicos

| Área | Implementación |
|---|---|
| Autenticación y roles | [`authMiddleware.js`](../../backend/src/middleware/authMiddleware.js) |
| Contexto de seguridad RLS | [`dbUtils.js`](../../backend/src/config/dbUtils.js) |
| Generación documental | [`pdfGenerator.js`](../../backend/src/utils/pdfGenerator.js) |
| Correo electrónico | [`emailService.js`](../../backend/src/utils/emailService.js) |
| Seguimiento público | [`Seguimiento.jsx`](../../frontend/src/pages/Seguimiento.jsx) |
| Resumen determinista | [`resumenController.js`](../../backend/src/controllers/resumenController.js) |
| Pruebas E2E | [`e2e-backend.test.js`](../../backend/tests/e2e-backend.test.js) |

## Proyectos

- [Frontend](../../frontend/README.md)
- [Backend y API](../../backend/README.md)

[← Arquitectura](../06-arquitectura/README.md) · [Siguiente: aplicación →](../08-demostracion/README.md)
