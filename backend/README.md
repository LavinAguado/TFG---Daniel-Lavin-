# Backend de TheraTrack

## Responsabilidad

El backend expone la API REST, aplica autenticación y autorización, ejecuta la lógica de negocio, gestiona transacciones PostgreSQL e integra generación de PDF, correo y almacenamiento documental.

## Tecnologías

- Node.js
- Express 5
- PostgreSQL y Supabase
- JWT y bcrypt
- PDFKit
- Nodemailer
- Multer

## Organización

```text
src/
├── config/         PostgreSQL, Supabase y contexto RLS
├── controllers/    Casos de uso y lógica de aplicación
├── database/       Esquema, índices y políticas
├── middleware/     JWT, roles y subida de archivos
├── routes/         Contratos HTTP
├── utils/          PDF y correo
├── app.js          Composición de la API
└── server.js       Arranque del servidor
tests/              Prueba E2E
```

El proyecto aplica una separación **route → controller → database/service**. No existe una capa independiente de modelos ORM: el modelo persistente se expresa mediante SQL y consultas parametrizadas.

## API

| Área | Rutas principales |
|---|---|
| Autenticación | `POST /api/auth/login`, `POST /api/auth/register` |
| Pacientes | `GET/POST /api/pacientes`, `PUT/DELETE /api/pacientes/:id` |
| Citas | `GET/POST /api/citas`, `PUT/DELETE /api/citas/:id` |
| Ejercicios | `GET/POST /api/ejercicios`, `PUT/DELETE /api/ejercicios/:id` |
| Entrenamientos | `GET/POST /api/entrenamientos`, `GET /api/entrenamientos/:id/pdf` |
| Seguimiento | `POST /api/seguimiento-completo`, `GET /api/seguimiento/:id` |
| Resumen | `GET /api/resumen-ia/:paciente_id` |
| Archivos | `POST/GET /api/archivos/:paciente_id` |
| Administración | CRUD en `/api/admin/users` |

El nombre histórico `/resumen-ia` se mantiene por compatibilidad, aunque el algoritmo actual es determinista y basado en reglas.

## Seguridad

- Contraseñas cifradas con bcrypt.
- Tokens JWT para rutas privadas.
- Middleware de rol `admin` y `superadmin`.
- Consultas parametrizadas.
- Contexto de usuario PostgreSQL mediante `dbUtils.js`.
- Políticas Row Level Security para propiedad y acceso.
- URLs firmadas para archivos privados.

## Base de datos

El esquema incluye usuarios, pacientes, historial, citas, ejercicios, entrenamientos, relación entrenamiento-ejercicio, seguimientos y archivos.

- [Esquema completo](src/database/schema.sql)
- [Políticas RLS](src/database/rls_policies.sql)
- [DER académico](../docs/05-diseno/base-datos/diagrama-der.png)

## Caso conductor

`entrenamientosController.js`:

1. Valida paciente y fecha.
2. Abre una transacción.
3. Inserta entrenamiento y ejercicios.
4. Confirma la transacción.
5. Genera el PDF.
6. Busca la siguiente cita.
7. Envía el documento por correo si existe dirección.

El seguimiento público se guarda en otra transacción desde `seguimientoController.js`.

## Configuración y ejecución

Crear `.env` usando [`.env.example`](.env.example) como referencia:

```bash
npm install
npm run dev
```

Para ejecutar la prueba E2E:

```bash
npm run test:e2e
```

[← Portada de la defensa](../README.md) · [Código en el recorrido](../docs/07-codigo-fuente/README.md)
