# TheraTrack

## Defensa del Trabajo Fin de Grado

**TheraTrack** es una aplicación web para centralizar la gestión clínica y deportiva de una clínica de fisioterapia y preparación física. Este repositorio está organizado como soporte principal de la defensa: permite recorrer el problema, el análisis, el diseño, la arquitectura, el código y la aplicación sin utilizar una presentación tradicional.

> Autor: Daniel Lavín Aguado  
> Titulación: Grado en Ingeniería Informática

![Dashboard de TheraTrack](docs/08-demostracion/capturas/02-dashboard.png)

## Problema identificado

La clínica utilizaba herramientas separadas para historiales, citas y planificación deportiva. Esto provocaba información fragmentada, tareas administrativas repetidas, dificultad para revisar la evolución completa del paciente y generación manual de entrenamientos.

## Solución desarrollada

TheraTrack reúne en una única plataforma:

- Expediente clínico y deportivo del paciente.
- Agenda de citas y profesionales.
- Catálogo de ejercicios y creación de entrenamientos.
- Generación de PDF y envío por correo.
- Seguimiento post-sesión de dolor, esfuerzo y dificultad.
- Repositorio documental.
- Resumen clínico determinista basado en métricas y reglas.
- Autenticación JWT, roles y políticas PostgreSQL RLS.

## Recorrido de la defensa

La navegación recomendada sigue exactamente la narrativa académica:

| Paso | Apartado | Pregunta que responde |
|---:|---|---|
| 1 | [Modelo del dominio](docs/01-modelo-dominio/README.md) | ¿Qué conceptos forman el sistema? |
| 2 | [Actores y casos de uso](docs/02-actores-casos-uso/README.md) | ¿Quién utiliza la solución y para qué? |
| 3 | [Casos representativos](docs/03-casos-representativos/README.md) | ¿Cómo se resuelve el flujo principal? |
| 4 | [Análisis](docs/04-analisis/README.md) | ¿Qué requisitos y procesos se identificaron? |
| 5 | [Diseño](docs/05-diseno/README.md) | ¿Cómo se modelaron interacciones y datos? |
| 6 | [Arquitectura](docs/06-arquitectura/README.md) | ¿Cómo se distribuyen las responsabilidades? |
| 7 | [Código fuente](docs/07-codigo-fuente/README.md) | ¿Dónde se materializan las decisiones? |
| 8 | [Demostración](docs/08-demostracion/README.md) | ¿Cómo funciona la solución? |
| 9 | [Conclusiones](docs/09-conclusiones/README.md) | ¿Qué se consiguió y qué queda por mejorar? |

## Caso conductor

El hilo principal de la exposición es:

**Seleccionar paciente → crear entrenamiento → generar PDF → enviar por correo → registrar seguimiento post-sesión.**

Este caso conecta el dominio, los actores, los diagramas, la API, la persistencia y la interfaz:

1. [Descripción del caso representativo](docs/03-casos-representativos/crear-entrenamiento.md)
2. [Diagrama de actividad](docs/04-analisis/actividades/generar-enviar-plantilla.png)
3. [Diagrama de secuencia](docs/05-diseno/secuencias/generar-enviar-plantilla.png)
4. [Código frontend](frontend/src/pages/PacienteDetalle.jsx)
5. [Código backend](backend/src/controllers/entrenamientosController.js)
6. [Guion de demostración](docs/08-demostracion/guion-demo.md)

## Arquitectura general

![Arquitectura del sistema](docs/06-arquitectura/arquitectura-sistema.png)

- **Frontend:** SPA en React 19 y Vite.
- **Backend:** API REST en Node.js y Express 5.
- **Persistencia:** PostgreSQL alojado en Supabase.
- **Servicios:** Supabase Storage, PDFKit y Nodemailer.
- **Seguridad:** JWT, bcrypt y Row Level Security.

## Acceso rápido

- [Índice técnico de documentación](docs/README.md)
- [Frontend](frontend/README.md)
- [Backend y API](backend/README.md)
- [Esquema SQL](backend/src/database/schema.sql)
- [Memoria completa en PDF](docs/memoria/TFG-Daniel-Lavin.pdf)
- [Memoria original por capítulos](docs/memoria/README.md)
- [Capturas de la aplicación](docs/08-demostracion/README.md#capturas)

## Ejecución local

1. Crear `backend/.env` a partir de [`backend/.env.example`](backend/.env.example).
2. Instalar dependencias con `npm install` en `backend/` y `frontend/`.
3. Ejecutar [`scripts/iniciar-defensa.bat`](scripts/iniciar-defensa.bat) en Windows.
4. Abrir `http://localhost:5173`.

También puede iniciarse manualmente con `npm run dev` dentro de cada proyecto. La API utiliza `http://localhost:3001` cuando `PORT=3001`.

---

[Comenzar la defensa: modelo del dominio →](docs/01-modelo-dominio/README.md)
