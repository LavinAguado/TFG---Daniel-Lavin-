# Guion de demostración

## Preparación previa

- Backend y frontend iniciados.
- Conexión a PostgreSQL comprobada.
- Usuario profesional disponible.
- Paciente de demostración con correo configurado.
- Al menos dos ejercicios en el catálogo.
- Pestañas abiertas: GitHub, IDE, aplicación y correo.

## Ejecución en 3 minutos

### 1. Contexto

Abrir la ficha del paciente y señalar que reúne datos clínicos, entrenamientos, archivos y resumen.

### 2. Prescripción

Crear un entrenamiento con dos ejercicios y parámetros diferentes. Explicar que el frontend construye un único payload.

### 3. Automatización

Guardar el entrenamiento. Mostrar el PDF generado y señalar que el correo se procesa después del guardado.

### 4. Participación del paciente

Abrir `/seguimiento/:id`, introducir dolor, esfuerzo y una valoración por ejercicio, y enviar.

### 5. Resultado

Regresar a la ficha y mostrar cómo los datos quedan disponibles para el profesional y alimentan el resumen clínico.

## Frase de cierre

“Este recorrido convierte una tarea manual y fragmentada en un proceso trazable que conecta prescripción, entrega y evaluación.”

[← Demostración](README.md)
