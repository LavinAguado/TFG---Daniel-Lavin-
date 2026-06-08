# TheraTrack - Sistema de Gestión Integral para Clínica de Fisioterapia y Preparación Física

<p align="center">
  <img src="Capitulos%20Entregas/Fotos-TFG/Cap4/2.png" alt="TheraTrack Logo" width="100%" style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); margin-bottom: 20px;">
</p>

<p align="center">
  <a href="#-información-académica">
    <img src="https://img.shields.io/badge/TFG-Ingeniería_Informática-blue?style=for-the-badge&logo=education&logoColor=white" alt="TFG Ingeniería Informática">
  </a>
  <a href="#-arquitectura-del-sistema">
    <img src="https://img.shields.io/badge/Arquitectura-Node.js_%7C_React_%7C_PostgreSQL-green?style=for-the-badge&logo=node.js&logoColor=white" alt="Arquitectura">
  </a>
  <a href="#-tecnologías-utilizadas">
    <img src="https://img.shields.io/badge/Seguridad-JWT_&_RLS-orange?style=for-the-badge&logo=json-web-tokens&logoColor=white" alt="Seguridad">
  </a>
</p>

---

## 🎓 Información Académica

Este repositorio contiene el código fuente y la documentación del **Trabajo de Fin de Grado (TFG)** desarrollado para la obtención del título de **Graduado en Ingeniería Informática**.

| Campo | Detalle |
| :--- | :--- |
| **Título del Proyecto** | Sistema de Gestión Integral para Clínica de Fisioterapia y Preparación Física (TheraTrack) |
| **Autor** | Daniel Lavín Aguado |
| **Titulación** | Grado en Ingeniería Informática |
| **Área Tecnológica** | Ingeniería del Software, Desarrollo Web, Bases de Datos Relacionales |
| **Entidad Académica** | Facultad de Informática |

---

## 📝 Descripción del Proyecto

**TheraTrack** es una solución web de gestión interna diseñada para optimizar los procesos de una clínica multidisciplinar que ofrece servicios conjuntos de **fisioterapia y preparación física**. Su propósito principal es centralizar toda la información clínica y deportiva bajo una única plataforma, facilitando la comunicación y coordinación asistencial entre los distintos perfiles profesionales (fisioterapeutas y entrenadores) y automatizando flujos de trabajo clave.

---

## 🔍 Problema Identificado

En la práctica clínica habitual de centros pequeños o medianos de salud y deporte, la gestión se realiza frecuentemente a través de herramientas no integradas o procesos manuales. Esto acarrea varias problemáticas operativas:
* **Fragmentación de la Información:** Datos clínicos e historiales de fisioterapia almacenados en soportes independientes de las planificaciones y rutinas deportivas de los preparadores físicos.
* **Duplicidad de Tareas Administrativas:** Entrada de datos duplicada para el registro del mismo paciente en múltiples sistemas.
* **Dificultad en el Monitoreo Continuo:** Ausencia de un canal ágil y estructurado para registrar la percepción de esfuerzo (RPE), nivel de dolor o incidencias físicas del paciente tras cada entrenamiento o sesión de recuperación.
* **Sobrecarga en la Generación Documental:** Elaboración manual de documentos de rutinas y envíos individuales por correo electrónico a cada paciente.

---

## 💡 Solución Propuesta

**TheraTrack** unifica la gestión clínica y deportiva mediante un entorno web seguro e intuitivo:
* **Expediente Único de Paciente:** Acceso centralizado a datos personales, antecedentes médicos, lesiones, citas, entrenamientos activos y documentos adjuntos.
* **Planificación Deportiva y Banco de Ejercicios:** Un catálogo de ejercicios completamente editable que permite componer rutinas personalizadas de manera rápida y estructurada.
* **Automatización de Entregables:** Generación instantánea en el backend de fichas de entrenamiento en PDF estructurado y envío automático mediante correo electrónico.
* **Módulo de Seguimiento Post-Sesión:** Captura del feedback del paciente directamente en cada sesión programada (nivel de dolor, percepción de esfuerzo RPE, comentarios).
* **Resumen Clínico Inteligente:** Algoritmo dinámico que sintetiza el historial, la evolución y las respuestas de seguimiento del paciente para ofrecer resúmenes rápidos a los especialistas.

---

## 🎯 Objetivos Principales

1. **Centralizar la información:** Unificar los historiales clínicos y los datos de entrenamiento deportivo en un único expediente digital.
2. **Optimizar la gestión diaria:** Ofrecer un módulo de citas dinámico en forma de calendario visual para administrar agendas eficientemente.
3. **Automatizar procesos:** Generar PDFs personalizados de los planes de entrenamiento y enviarlos por correo electrónico de manera automática.
4. **Habilitar el feedback dinámico:** Permitir que los pacientes reporten su evolución y esfuerzo post-sesión, registrando métricas cuantitativas y cualitativas de dolor y dificultad.
5. **Asegurar los datos clínicos:** Implementar un control estricto de accesos mediante roles estructurados (Administrador/Profesional) y tokenización JWT.

---

## 🏗️ Arquitectura del Sistema

La solución implementa una arquitectura cliente-servidor distribuida en tres capas principales que garantizan la separación de responsabilidades, seguridad de la información y modularidad:

```
                  ┌──────────────────────────────────────────┐
                  │            Capa de Presentación          │
                  │              (React + Vite)              │
                  └────────────────────┬─────────────────────┘
                                       │
                               HTTPS / JSON (JWT)
                                       │
                  ┌────────────────────▼─────────────────────┐
                  │          Capa de Lógica de Negocio       │
                  │             (Node.js + Express)          │
                  └────────────────────┬─────────────────────┘
                                       │
                              Consultas SQL / API
                                       │
                  ┌────────────────────▼─────────────────────┐
                  │            Capa de Persistencia          │
                  │         (PostgreSQL + Supabase)          │
                  └──────────────────────────────────────────┘
```

### Detalle de la Arquitectura
* **Presentación:** SPA responsiva y dinámica desarrollada con React 18, empaquetada con Vite y estilizada mediante Tailwind CSS v4.
* **Lógica de Negocio:** API REST implementada con Node.js y Express. Se encarga de la lógica de pacientes, la agenda de citas, la estructuración de PDFs con plantillas personalizadas y el envío de correos.
* **Persistencia y Almacenamiento:** PostgreSQL alojado sobre la infraestructura en la nube de Supabase. El repositorio documental de pacientes se apoya en Supabase Storage con generación de URLs firmadas temporales para salvaguardar la privacidad de documentos médicos.

---

## 🛠️ Tecnologías Utilizadas

### Frontend (Presentación)
* **React 18:** Biblioteca para la construcción de interfaces de usuario mediante componentes reutilizables.
* **Vite:** Herramienta de compilación ultrarrápida para desarrollo web.
* **React Router Dom:** Gestión de rutas declarativas del lado del cliente.
* **Tailwind CSS v4:** Framework de diseño utilitario para interfaces fluidas, modernas y responsivas.
* **Heroicons:** Biblioteca de iconos vectoriales limpios y consistentes.

### Backend (Lógica)
* **Node.js:** Entorno de ejecución de JavaScript del lado del servidor.
* **Express:** Framework web minimalista para la estructuración de la API REST.
* **Multer:** Middleware para el procesamiento y subida segura de archivos en memoria.
* **Nodemailer:** Módulo de envío de correos electrónicos desde el servidor.

### Persistencia y Seguridad
* **PostgreSQL:** Sistema de gestión de bases de datos relacionales.
* **Supabase & Storage:** Infraestructura Backend-as-a-Service para base de datos PostgreSQL en la nube y repositorio de ficheros.
* **JSON Web Tokens (JWT):** Estándar abierto para la autenticación y autorización segura basada en tokens.
* **Bcrypt:** Algoritmo de hash criptográfico para el almacenamiento seguro de contraseñas.
* **Políticas RLS (Row Level Security):** Seguridad a nivel de fila en PostgreSQL para aislar los datos.

---

## 📊 Diagramas y Diseño Técnico (UML)

Para profundizar en el diseño e ingeniería del software desarrollado, se pueden inspeccionar los diagramas técnicos incluidos en la memoria de la titulación:

<details>
<summary><b>📂 Diagramas de Comportamiento (Casos de Uso e Interacción)</b></summary>

* **Casos de Uso:**
  * [Gestión de Pacientes](./Capitulos%20Entregas/Fotos-TFG/Cap2/Caso%20de%20uso%201.png)
  * [Gestión de Citas](./Capitulos%20Entregas/Fotos-TFG/Cap2/Caso%20de%20uso%202.png)
  * [Crear Entrenamiento](./Capitulos%20Entregas/Fotos-TFG/Cap2/Caso%20de%20uso%203.png)
  * [Generar Plantilla](./Capitulos%20Entregas/Fotos-TFG/Cap2/Caso%20de%20uso%204.png)
  * [Enviar Entrenamiento](./Capitulos%20Entregas/Fotos-TFG/Cap2/Caso%20de%20uso%205.png)
  * [Registrar Seguimiento](./Capitulos%20Entregas/Fotos-TFG/Cap2/Caso%20de%20uso%206.png)
* **Diagramas de Actividades:**
  * [Actividad: Crear Paciente](./Capitulos%20Entregas/Fotos-TFG/Cap%203/Diagramas%20de%20Actividades/Crearpaciente.png)
  * [Actividad: Crear Ejercicio](./Capitulos%20Entregas/Fotos-TFG/Cap%203/Diagramas%20de%20Actividades/CrearEjecicio.png)
  * [Actividad: Generar y enviar plantilla](./Capitulos%20Entregas/Fotos-TFG/Cap%203/Diagramas%20de%20Actividades/Generar%20yenviar%20plantilla.png)
  * [Actividad: Seguimiento post sesión](./Capitulos%20Entregas/Fotos-TFG/Cap%203/Diagramas%20de%20Actividades/Seguimiento%20post%20sesion.png)
* **Diagramas de Secuencia:**
  * [Secuencia: Crear Paciente](./Capitulos%20Entregas/Fotos-TFG/Cap%203/Diagrama%20de%20Secuencias/Secuencia-CrearPaciente.png)
  * [Secuencia: Crear Entrenamiento](./Capitulos%20Entregas/Fotos-TFG/Cap%203/Diagrama%20de%20Secuencias/Secuencia-CrearEntrenamiento.png)
  * [Secuencia: Plantilla de Entrenamiento](./Capitulos%20Entregas/Fotos-TFG/Cap%203/Diagrama%20de%20Secuencias/Secuencia-Plantilla.png)
  * [Secuencia: Seguimiento post sesión](./Capitulos%20Entregas/Fotos-TFG/Cap%203/Diagrama%20de%20Secuencias/Secuencia-PostSesion.png)

</details>

<details>
<summary><b>📂 Diagramas Estructurales y de Base de Datos</b></summary>

* **Estructura de la Aplicación:**
  * [Arquitectura del Sistema](./Capitulos%20Entregas/Fotos-TFG/Cap%203/Arquitectura%20del%20sistema.png)
  * [Diagrama de Paquetes](./Capitulos%20Entregas/Fotos-TFG/Cap%203/DiagramaPaquetes.png)
  * [Diagrama de Despliegue](./Capitulos%20Entregas/Fotos-TFG/Cap%203/DiagramaDespliegue.png)
  * [Diagrama de Clases UML](./Capitulos%20Entregas/Fotos-TFG/Cap%203/Diagrama%20de%20clases.png)
  * [Diagrama de Objetos UML](./Capitulos%20Entregas/Fotos-TFG/Cap%203/Diagrama%20de%20objetos.png)
* **Persistencia (BBDD):**
  * [Diagrama Entidad-Relación (DER)](./Capitulos%20Entregas/Fotos-TFG/Cap%203/Diagrama%20der.png)
  * [Modelo Físico de Base de Datos](./Capitulos%20Entregas/Fotos-TFG/Cap%203/Modelo%20fisico%20bases.png)

</details>

---

## 🖥️ Módulos y Funcionalidades Destacadas (Capturas de Pantalla)

### 1. Control de Acceso y Seguridad
El módulo de login implementa autenticación robusta mediante JWT con control de acceso basado en roles diferenciados (SuperAdministrador y Administrador) para proteger la información médica confidencial.
<p align="center">
  <img src="Capitulos%20Entregas/Fotos-TFG/Cap4/1.png" alt="Inicio de Sesión" width="80%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
</p>

### 2. Panel de Control Dinámico (Dashboard)
Una interfaz centralizada que ofrece al profesional una visión general diaria en tiempo real: número de pacientes activos, citas del día y próximos eventos clínicos de forma intuitiva.
<p align="center">
  <img src="Capitulos%20Entregas/Fotos-TFG/Cap4/2.png" alt="Dashboard Principal" width="80%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
</p>

### 3. Directorio de Pacientes
Registro digital completo de los pacientes con buscador en tiempo real. Cada ficha individual consolida antecedentes médicos, motivos de consulta, valoraciones y toda la evolución clínica y deportiva.
<p align="center">
  <img src="Capitulos%20Entregas/Fotos-TFG/Cap4/3.png" alt="Directorio de Pacientes" width="80%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
</p>

### 4. Agenda y Gestión de Citas
Calendario visual interactivo estructurado por días, semanas y meses que permite agendar sesiones asociando paciente, profesional de la clínica y especialidad requerida.
<p align="center">
  <img src="Capitulos%20Entregas/Fotos-TFG/Cap4/4.png" alt="Gestión de Citas" width="80%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
</p>

### 5. Planificador de Entrenamientos Personalizados
Módulo de creación rápida de rutinas deportivas y terapéuticas. Los profesionales seleccionan ejercicios del banco de recursos y asignan parámetros personalizados de series, repeticiones y observaciones.
<p align="center">
  <img src="Capitulos%20Entregas/Fotos-TFG/Cap4/5.png" alt="Registro de Entrenamientos" width="80%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
</p>

### 6. Catálogo de Ejercicios
Base de datos editable de ejercicios de rehabilitación y entrenamiento. Cada ejercicio incorpora descripción técnica detallada, parámetros sugeridos y enlaces directos a vídeos multimedia de demostración.
<p align="center">
  <img src="Capitulos%20Entregas/Fotos-TFG/Cap4/6.png" alt="Catálogo de Ejercicios" width="80%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
</p>

### 7. Repositorio Documental Clínico
Sistema para la carga e inspección de archivos PDF e imágenes vinculados a cada paciente (informes externos, radiografías, consentimientos). Genera URLs firmadas de Supabase Storage para máxima confidencialidad.
<p align="center">
  <img src="Capitulos%20Entregas/Fotos-TFG/Cap4/7.png" alt="Repositorio Documental" width="80%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
</p>

### 8. Panel de Administración de Personal
Espacio restringido a SuperAdministradores para gestionar la plantilla médica de la clínica, dando de alta a nuevos profesionales y asignándoles roles (entrenador o fisioterapeuta).
<p align="center">
  <img src="Capitulos%20Entregas/Fotos-TFG/Cap4/8.png" alt="Panel de Administración" width="80%" style="border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
</p>

---

## 🧭 Navegación del Repositorio

Puedes navegar por los diferentes componentes y códigos fuente del proyecto utilizando los siguientes enlaces relativos:

* **[🖥️ Frontend (Interfaz de Usuario)](./tfg-clinica/frontend):** Código fuente de la SPA construida en React, con rutas de navegación, hooks personalizados, componentes comunes y estilos de Tailwind CSS.
* **[⚙️ Backend (Servidor de API)](./tfg-clinica/backend):** Lógica del lado del servidor construida con Node.js y Express, incluyendo controladores de negocio, rutas de endpoints, middlewares de autenticación JWT y configuración de base de datos.
* **[📄 Documentación / Memoria](./Capitulos%20Entregas):** Capítulos redactados del proyecto de fin de grado:
  * [Capítulo 1: Introducción y Justificación](./Capitulos%20Entregas/Capitulo%201.md)
  * [Capítulo 2: Requisitos y Casos de Uso](./Capitulos%20Entregas/Capitulo%202.md)
  * [Capítulo 3: Diseño del Sistema y UML](./Capitulos%20Entregas/Capitulo%203.md)
  * [Capítulo 4: Solución Propuesta](./Capitulos%20Entregas/Capitulo%204.md)
  * [Capítulo 5: Conclusiones y Trabajo Futuro](./Capitulos%20Entregas/Capitulo%205.md)

---

## 🚀 Instalación y Ejecución Local

Para levantar el proyecto TheraTrack en un entorno local de desarrollo:

### Pre-requisitos
* Node.js (v16 o superior) instalado en el equipo.
* Una instancia de base de datos PostgreSQL configurada (o proyecto en Supabase).

### Configuración Rápida (Windows)
El proyecto incluye un script automatizado para iniciar de forma concurrente ambos servidores en ventanas independientes:
1. Haz doble clic en el archivo **`iniciar.bat`** situado en `tfg-clinica/iniciar.bat`.
2. El script abrirá de forma automática las dependencias necesarias.
3. Accede al Frontend en [http://localhost:5173](http://localhost:5173) y a la API en [http://localhost:3001](http://localhost:3001).

### Configuración Manual

#### 1. Servidor Backend
```bash
cd tfg-clinica/backend
npm install
# Crea un archivo .env basándote en la plantilla y rellena tus claves de base de datos y JWT
npm run dev
```

#### 2. Servidor Frontend
```bash
cd tfg-clinica/frontend
npm install
npm run dev
```
Accede desde tu navegador preferido a la dirección local que indique la consola (por defecto [http://localhost:5173](http://localhost:5173)).
