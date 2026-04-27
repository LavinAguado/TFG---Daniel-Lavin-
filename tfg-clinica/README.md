# TheraTrack

TheraTrack es una aplicación avanzada para la gestión clínica y deportiva, diseñada para optimizar el seguimiento de pacientes, la planificación de entrenamientos y la toma de decisiones basada en datos.

## 🚀 Características Principales
- **Gestión de Pacientes y Citas**: Directorio profesional y agenda inteligente.
- **Planificador de Entrenamientos**: Creación de rutinas personalizadas con métricas de esfuerzo (RPE).
- **Resumen Clínico Inteligente**: Generación de informes automáticos mediante un sistema determinista basado en reglas que analiza historial y métricas sin dependencia de servicios externos.
- **Seguridad de Grado Médico**: Implementación de Row Level Security (RLS) en Supabase para asegurar que cada profesional solo acceda a sus propios datos.
- **Evolución Visual**: Panel de métricas con análisis de dolor y esfuerzo (RPE) en tiempo real.

## 🛠️ Tecnologías
- **Frontend**: React 18, Vite, Tailwind CSS v4.
- **Backend**: Node.js, Express, PostgreSQL (Supabase).
- **Seguridad**: Autenticación JWT + PostgreSQL RLS (Row Level Security).


## 📦 Instalación y Ejecución

### 1. Backend
1. Entra en `backend/`
2. Instala dependencias: `npm install`
3. Configura el archivo `.env`
4. Inicia: `npm start`

### 2. Frontend
1. Entra en `frontend/`
2. Instala dependencias: `npm install`
3. Inicia: `npm run dev`

### 3. Verificación (Tests)
1. Con el backend en ejecución, abre otra terminal en `backend/`
2. Ejecuta: `npm run test:e2e`


---
*Proyecto desarrollado como Trabajo de Fin de Grado (TFG) por Daniel Lavín.*
