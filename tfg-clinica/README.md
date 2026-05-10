# TheraTrack

TheraTrack es una aplicación web avanzada para la gestión clínica y deportiva, diseñada para optimizar el seguimiento de pacientes, la planificación de entrenamientos y la toma de decisiones basada en datos.

## 🚀 Características Principales

- **Panel de Control Dinámico (Dashboard)**: Visualización en tiempo real del número de pacientes, agenda del día y próximos eventos clínicos con un diseño premium.
- **Gestión Avanzada de Profesionales**: Panel "SuperAdmin" para administrar el acceso de la plantilla médica, dividida en perfiles especializados (Fisioterapeutas y Entrenadores).
- **Directorio de Pacientes y Citas**: Base de datos de pacientes con buscador integrado y sistema de agenda inteligente interconectada.
- **Repositorio Documental Clínico**: Sistema seguro de subida y almacenamiento de archivos (PDF, imágenes) vinculado a cada paciente. Utiliza Supabase Storage con generación de URLs temporales (Signed URLs) para máxima privacidad.
- **Planificador de Entrenamientos**: Creación de rutinas personalizadas de rehabilitación o mejora física, asignación rápida de catálogo de ejercicios y sistema de *feedback* (RPE - Percepción de Esfuerzo).
- **Resumen Clínico Inteligente**: Generación de informes automáticos y consejos basados en la evolución del dolor y el rendimiento del paciente en las sesiones, procesado mediante Inteligencia Artificial.
- **Seguridad y Accesos**: Arquitectura de seguridad de grado médico. El sistema integra autenticación segura por JWT combinada con políticas RLS (Row Level Security) nativas en la base de datos y el almacenamiento en la nube, garantizando un acceso estanco a la información confidencial.

## 🛠️ Tecnologías Empleadas

- **Frontend**: React 18, Vite, React Router, Tailwind CSS v4, Heroicons.
- **Backend**: Node.js, Express, Multer (procesamiento en RAM).
- **Base de Datos & Almacenamiento**: PostgreSQL, Supabase, Supabase Storage.
- **Seguridad**: JSON Web Tokens (JWT), encriptación bcrypt, PostgreSQL RLS.

## 📦 Instalación y Ejecución Local

Para levantar el proyecto en un entorno de desarrollo:

### 1. Backend (API & Base de Datos)
1. Navega al directorio del servidor: `cd backend`
2. Instala las dependencias: `npm install`
3. Configura las variables de entorno en el archivo `.env` (puertos, claves de Supabase, JWT secret, etc.)
4. Inicia el servidor de desarrollo: `npm run dev` (o `node src/server.js`)

### 2. Frontend (Interfaz Web)
1. Abre una nueva terminal y navega al directorio del cliente: `cd frontend`
2. Instala las dependencias: `npm install`
3. Inicia la aplicación: `npm run dev`
4. Accede a la plataforma web a través del navegador (por defecto en `http://localhost:5173`)

---
*Proyecto desarrollado como Trabajo de Fin de Grado (TFG) por Daniel Lavín.*
