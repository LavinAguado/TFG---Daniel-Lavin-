<p align="center">

<a href="#31-introducción-al-análisis-y-diseño">
  <img src="https://img.shields.io/badge/Introducción-1f2937?style=for-the-badge&logo=bookstack&logoColor=white">
</a>

<a href="#32-diagramas-de-comportamiento">
  <img src="https://img.shields.io/badge/Diagramas_de_Comportamiento-374151?style=for-the-badge&logo=workflow&logoColor=white">
</a>

<a href="#321-diagrama-de-actividades">
  <img src="https://img.shields.io/badge/Actividades-4b5563?style=for-the-badge&logo=graph&logoColor=white">
</a>

<a href="#322-casos-de-uso">
  <img src="https://img.shields.io/badge/Casos_de_Uso-6b7280?style=for-the-badge&logo=uml&logoColor=white">
</a>

<a href="#323-diagramas-de-secuencia-y-comunicación">
  <img src="https://img.shields.io/badge/Secuencia_y_Comunicación-9ca3af?style=for-the-badge&logo=buffer&logoColor=white">
</a>

<a href="#33-diagramas-estructurales">
  <img src="https://img.shields.io/badge/Diagramas_Estructurales-111827?style=for-the-badge&logo=grid&logoColor=white">
</a>

<a href="#34-diseño-de-la-base-de-datos">
  <img src="https://img.shields.io/badge/Base_de_Datos-374151?style=for-the-badge&logo=postgresql&logoColor=white">
</a>

</p>

---

# Capítulo 3 - Análisis y Diseño

# 3.1 Introducción al análisis y diseño

Este capítulo busca crear el diseño del sistema con las metas que fijamos en la parte previa. Aquí se explican los diversos puntos que forman la idea técnica, junto con cómo funciona el equipo y el modo en que se guardan los datos.

Para esto, se usan varios planos con lenguaje UML que dejan ver de modo claro las tareas del sistema, el trato con los usuarios y la forma general de todo el plan.

También, se añade el modelo de la base de datos que sostiene los datos que usa el programa.

El desarrollo de este capítulo se organiza en tres grandes bloques: diagramas de comportamiento, diagramas estructurales y diseño de la base de datos, proporcionando una visión completa del sistema desde el punto de vista técnico.

---

# 3.2 Diagramas de comportamiento

# 3.2.1 Diagrama de Actividades

Los diagramas de actividades permiten representar el flujo de ejecución de los principales procesos del sistema, mostrando de forma secuencial las acciones realizadas tanto por los usuarios como por el propio sistema. Estos diagramas resultan especialmente útiles para comprender el comportamiento dinámico de la aplicación y la interacción entre los distintos módulos funcionales.

A continuación, se presentan los diagramas de actividades asociados a los procesos más relevantes del sistema, definidos a partir de los requisitos funcionales establecidos en el capítulo anterior.

## Diagramas de actividades

![Crear Paciente](./Fotos-TFG/Cap%203/Diagramas%20de%20Actividades/Crearpaciente.png)
![Crear Ejercicio](./Fotos-TFG/Cap%203/Diagramas%20de%20Actividades/CrearEjecicio.png)
![Generar y enviar plantilla](./Fotos-TFG/Cap%203/Diagramas%20de%20Actividades/Generar%20yenviar%20plantilla.png)
![Seguimiento post sesion](./Fotos-TFG/Cap%203/Diagramas%20de%20Actividades/Seguimiento%20post%20sesion.png)

---

# 3.2.2 Casos de uso

## Escenarios

Los escenarios describen de forma detallada el flujo de ejecución de los principales casos de uso del sistema, representando situaciones reales de interacción entre los usuarios y la aplicación. Estos escenarios permiten complementar los diagramas de actividades, proporcionando una visión más descriptiva de los procesos definidos.

A continuación, se presentan los escenarios asociados a los procesos más relevantes del sistema.

### Crear Paciente
![Crear Paciente (Admin)](./Fotos-TFG/Cap%203/Diagramas%20casos%20de%20uso/CrearPacienteadmin.png)
### Crear Entrenamiento
![Crear Entrenamiento](./Fotos-TFG/Cap%203/Diagramas%20casos%20de%20uso/CrearEntrenamiento.png)
### Generar Plantilla
![Generar Plantilla](./Fotos-TFG/Cap%203/Diagramas%20casos%20de%20uso/GenerarPlantilla.png)
### Seguimiento post - entreno
![Post Sesion](./Fotos-TFG/Cap%203/Diagramas%20casos%20de%20uso/PostSesion.png)



---

# Historias de Usuario

## Gestión de pacientes

- HU1: Como administrador, quiero gestionar los pacientes (CRUD) para mantener actualizada su información.
- HU2: Como fisioterapeuta, quiero consultar la información de los pacientes para conocer su estado clínico.

## Gestión de citas

- HU3: Como administrador, quiero gestionar las citas (CRUD) para organizar la agenda de la clínica.

## Historial clínico

- HU4: Como fisioterapeuta, quiero gestionar el historial clínico para registrar la evolución del paciente.

## Ejercicios

- HU5: Como entrenador, quiero gestionar los ejercicios (CRUD) para disponer de un banco de recursos actualizado.

## Entrenamientos

- HU6: Como entrenador, quiero crear entrenamientos para planificar la actividad física del paciente.
- HU7: Como entrenador, quiero generar plantillas automáticamente para ahorrar tiempo en tareas repetitivas.

## Automatización

- HU8: Como sistema, quiero enviar automáticamente los entrenamientos para garantizar que el paciente los reciba.
- HU9: Como sistema, quiero generar un resumen del paciente para facilitar la revisión de su información.

## Seguimiento

- HU10: Como paciente, quiero registrar mi seguimiento para informar sobre mi evolución.
- HU11: Como profesional, quiero consultar el seguimiento para ajustar el tratamiento del paciente.

---

# Tareas del Programador

Las tareas del programador representan la descomposición técnica de las funcionalidades del sistema a partir de las historias de usuario definidas previamente. Estas tareas permiten trasladar los requisitos funcionales a acciones concretas de desarrollo, facilitando la implementación del sistema mediante una organización estructurada del trabajo.

Para su definición, se han agrupado las tareas en función de los distintos módulos del sistema, diferenciando entre frontend, backend y base de datos.

## 1. Gestión de pacientes

### Backend
- Implementar endpoint para CRUD de pacientes
- Validar datos del paciente
- Gestionar lógica de negocio

### Base de datos
- Crear tabla pacientes
- Definir relaciones con historial clínico

### Frontend
- Crear formulario de alta de paciente
- Crear vista de listado de pacientes
- Implementar edición de datos

---

## 2. Gestión de citas

### Backend
- Implementar endpoints para CRUD de citas
- Gestionar disponibilidad

### Base de datos
- Crear tabla citas
- Relacionar con pacientes y usuarios

### Frontend
- Crear calendario de citas
- Formulario de creación/modificación

---

## 3. Historial clínico

### Backend
- Implementar gestión del historial
- Asociar historial a paciente

### Base de datos
- Crear tabla historial_clinico

### Frontend
- Vista de historial del paciente
- Formulario de actualización

---

## 4. Ejercicios

### Backend
- Implementar CRUD de ejercicios
- Gestionar recursos multimedia (links)

### Base de datos
- Crear tabla ejercicios

### Frontend
- Listado de ejercicios
- Formulario de creación/edición

---

## 5. Entrenamientos

### Backend
- Implementar creación de entrenamientos
- Asociar ejercicios a entrenamientos

### Base de datos
- Crear tabla entrenamientos
- Crear tabla intermedia entrenamiento_ejercicios

### Frontend
- Interfaz de selección de ejercicios
- Configuración de parámetros

---

## 6. Generación de plantillas (PDF)

### Backend
- Implementar generación de PDF
- Integrar librería de generación documental

### Sistema
- Automatizar generación de documento

---

## 7. Envío de correos

### Backend
- Integrar servicio de email (ej. Nodemailer)
- Implementar envío automático

---

## 8. Seguimiento post-sesión

### Backend
- Implementar recepción de formularios
- Registrar datos de seguimiento

### Base de datos
- Crear tabla seguimiento

### Frontend
- Crear formulario externo
- Confirmación de envío

---

## 9. Sistema de notificaciones

### Backend
- Detectar nuevos seguimientos
- Notificar al profesional

---

## 10. Seguridad

### Backend
- Implementar autenticación con JWT
- Cifrado de contraseñas

### Base de datos
- Tabla usuarios y roles

---

# 3.2.3 Diagramas de Secuencia y Comunicación

Los diagramas de secuencia permiten representar la interacción entre los distintos componentes del sistema a lo largo del tiempo, mostrando cómo se intercambian los mensajes entre los actores, el frontend, el backend y otros servicios.

Estos diagramas resultan especialmente útiles para comprender el flujo interno de las operaciones del sistema y la forma en la que se gestionan las solicitudes y respuestas entre los distintos módulos.

A continuación, se presentan los diagramas de secuencia correspondientes a los procesos más relevantes del sistema.

![Secuencia Crear Paciente](./Fotos-TFG/Cap%203/Diagrama%20de%20Secuencias/Secuencia-CrearPaciente.png)
![Secuencia Crear Entrenamiento](./Fotos-TFG/Cap%203/Diagrama%20de%20Secuencias/Secuencia-CrearEntrenamiento.png)
![Secuencia Plantilla](./Fotos-TFG/Cap%203/Diagrama%20de%20Secuencias/Secuencia-Plantilla.png)
![Secuencia Post Sesion](./Fotos-TFG/Cap%203/Diagrama%20de%20Secuencias/Secuencia-PostSesion.png)

---

# 3.3 Diagramas estructurales

# 3.3.1 Arquitectura del sistema

La arquitectura del sistema define la estructura general de la solución propuesta, identificando los principales componentes y la forma en la que interactúan entre sí. En este caso, se ha optado por una arquitectura cliente-servidor basada en tecnologías web modernas, que permite garantizar la escalabilidad, mantenibilidad y separación de responsabilidades.

El sistema se compone de tres capas principales: una capa de presentación desarrollada en React, una capa de lógica de negocio implementada en Node.js con Express, y una capa de persistencia de datos basada en PostgreSQL.

![Arquitectura del sistema](./Fotos-TFG/Cap%203/Arquitectura%20del%20sistema.png)

---

# 3.3.2 Diagrama de Despliegue

El diagrama de despliegue representa la distribución física del sistema, mostrando los nodos hardware y los componentes software desplegados en cada uno de ellos. Este diagrama permite visualizar cómo se ejecuta la aplicación en un entorno real.

![Diagrama de Despliegue](./Fotos-TFG/Cap%203/DiagramaDespliegue.png)

---

# 3.3.3 Diagrama de Paquetes

El diagrama de paquetes permite organizar el sistema en módulos lógicos, facilitando la comprensión de su estructura interna y la separación de responsabilidades entre los distintos componentes.

![Diagrama de Paquetes](./Fotos-TFG/Cap%203/DiagramaPaquetes.png)

---

# 3.3.4 Diagrama de Clases

![Diagrama de Clases](./Fotos-TFG/Cap%203/Diagrama%20de%20clases.png)

---

# 3.3.5 Diagrama de Objetos

![Diagrama de Objetos](./Fotos-TFG/Cap%203/Diagrama%20de%20objetos.png)

---

# 3.4 Diseño de la base de datos

# 3.4.1 Modelo Lógico

![Modelo Lógico (DER)](./Fotos-TFG/Cap%203/Diagrama%20der.png)

---

# 3.4.2 Modelo Físico

![Modelo Físico](./Fotos-TFG/Cap%203/Modelo%20fisico%20bases.png)