<div align="center">

# TheraTrack

### Gestión clínica y deportiva en una única plataforma

Aplicación web desarrollada como Trabajo Fin de Grado en Ingeniería Informática.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](frontend/README.md)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js&logoColor=white)](backend/README.md)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?style=flat-square&logo=postgresql&logoColor=white)](backend/src/database/schema.sql)
[![Security](https://img.shields.io/badge/Seguridad-JWT%20%2B%20RLS-0F172A?style=flat-square)](docs/06-arquitectura/README.md)
[![TFG](https://img.shields.io/badge/TFG-Ingeniería%20Informática-2563EB?style=flat-square)](docs/memoria/TFG-Daniel-Lavin.pdf)

**Daniel Lavín Aguado**

</div>

![Panel principal de TheraTrack](docs/08-demostracion/capturas/02-dashboard.png)

## El proyecto

TheraTrack responde a una necesidad observada en una clínica que combina fisioterapia y preparación física. La información clínica, la agenda y la planificación deportiva se gestionaban mediante herramientas separadas, dificultando la coordinación entre profesionales y el seguimiento completo de cada paciente.

La solución centraliza estos procesos en una aplicación web segura, modular y orientada al trabajo diario de la clínica.

| Problema | Respuesta de TheraTrack |
|---|---|
| Información clínica y deportiva fragmentada | Expediente único de paciente |
| Gestión manual de citas y entrenamientos | Agenda y planificación integradas |
| Creación repetitiva de documentos | Generación automática de PDF |
| Falta de seguimiento posterior | Registro de dolor, esfuerzo y dificultad |
| Acceso a información sensible | JWT, roles y Row Level Security |
| Historiales extensos | Resumen clínico basado en reglas y métricas |

## Funcionalidades

| Gestión clínica | Planificación deportiva | Automatización |
|---|---|---|
| Expediente de pacientes | Catálogo de ejercicios | Generación de PDF |
| Historial y valoración | Entrenamientos personalizados | Envío por correo |
| Agenda de citas | Parámetros por ejercicio | Resumen clínico |
| Repositorio documental | Seguimiento post-sesión | URLs firmadas |

## Flujo principal

```text
Paciente
   ↓
Plan de entrenamiento
   ↓
Selección de ejercicios y parámetros
   ↓
Generación de PDF y envío
   ↓
Seguimiento post-sesión
   ↓
Actualización de métricas y resumen clínico
```

Este flujo está documentado de extremo a extremo:

[Caso de uso](docs/02-actores-casos-uso/README.md) ·
[Análisis](docs/04-analisis/README.md) ·
[Secuencia](docs/05-diseno/secuencias/generar-enviar-plantilla.png) ·
[Frontend](frontend/src/pages/PacienteDetalle.jsx) ·
[Backend](backend/src/controllers/entrenamientosController.js)

## Arquitectura

<div align="center">
  <img src="docs/06-arquitectura/arquitectura-sistema.png" alt="Arquitectura de TheraTrack" width="360">
</div>

| Componente | Tecnologías | Responsabilidad |
|---|---|---|
| Frontend | React 19, Vite, React Router | Interfaz y navegación |
| Backend | Node.js, Express 5 | API REST y lógica de aplicación |
| Persistencia | PostgreSQL, Supabase | Datos, índices y políticas RLS |
| Documentos | Supabase Storage | Almacenamiento clínico privado |
| Servicios | PDFKit, Nodemailer | PDF y correo electrónico |

## Documentación

La documentación sigue el proceso completo de ingeniería del software:

| | Área | Contenido |
|---:|---|---|
| 01 | [Modelo del dominio](docs/01-modelo-dominio/README.md) | Entidades y relaciones principales |
| 02 | [Actores y casos de uso](docs/02-actores-casos-uso/README.md) | Interacciones y funcionalidades |
| 03 | [Casos representativos](docs/03-casos-representativos/README.md) | Procesos funcionales completos |
| 04 | [Análisis](docs/04-analisis/README.md) | Necesidades, requisitos y actividades |
| 05 | [Diseño](docs/05-diseno/README.md) | Secuencias y base de datos |
| 06 | [Arquitectura](docs/06-arquitectura/README.md) | Capas, paquetes y despliegue |
| 07 | [Código fuente](docs/07-codigo-fuente/README.md) | Correspondencia entre diseño e implementación |
| 08 | [Aplicación](docs/08-demostracion/README.md) | Módulos y capturas del sistema |
| 09 | [Conclusiones](docs/09-conclusiones/README.md) | Resultados, limitaciones y evolución |

## Capturas

| Pacientes | Citas |
|---|---|
| ![Directorio de pacientes](docs/08-demostracion/capturas/03-pacientes.png) | ![Agenda de citas](docs/08-demostracion/capturas/04-citas.png) |

| Ejercicios | Documentación |
|---|---|
| ![Catálogo de ejercicios](docs/08-demostracion/capturas/06-ejercicios.png) | ![Repositorio documental](docs/08-demostracion/capturas/07-archivos.png) |

## Repositorio

```text
.
├── frontend/       Aplicación React
├── backend/        API, seguridad y persistencia
├── docs/           Documentación académica y técnica
│   ├── 01-modelo-dominio/
│   ├── 02-actores-casos-uso/
│   ├── 03-casos-representativos/
│   ├── 04-analisis/
│   ├── 05-diseno/
│   ├── 06-arquitectura/
│   ├── 07-codigo-fuente/
│   ├── 08-demostracion/
│   ├── 09-conclusiones/
│   └── memoria/
└── scripts/        Arranque local
```

## Ejecución local

### Requisitos

- Node.js 18 o superior.
- Acceso a una instancia PostgreSQL/Supabase.
- Credenciales de correo para el envío de entrenamientos.

### Configuración

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

En Windows también puede utilizarse [`scripts/iniciar.bat`](scripts/iniciar.bat).

- Aplicación: `http://localhost:5173`
- API: `http://localhost:3001/api`

## Recursos

[Documentación técnica](docs/README.md) ·
[Frontend](frontend/README.md) ·
[Backend](backend/README.md) ·
[Memoria completa](docs/memoria/TFG-Daniel-Lavin.pdf)

---

<div align="center">
Trabajo Fin de Grado · Ingeniería Informática
</div>
