# 08. Demostración de la solución

La demostración debe probar el caso conductor con datos preparados, evitando dedicar tiempo a tareas administrativas secundarias.

## Recorrido

1. Iniciar sesión como profesional.
2. Abrir el directorio y seleccionar un paciente con correo.
3. Crear un entrenamiento con dos ejercicios.
4. Mostrar el entrenamiento guardado y descargar su PDF.
5. Abrir el seguimiento público asociado.
6. Registrar dolor, esfuerzo y dificultad.
7. Volver a la ficha del paciente y mostrar el resumen.

[Abrir el guion detallado](guion-demo.md)

[Abrir el recorrido completo de 15 minutos](recorrido-15-minutos.md)

## Capturas

| Pantalla | Captura |
|---|---|
| Login | [Abrir](capturas/01-login.png) |
| Dashboard | [Abrir](capturas/02-dashboard.png) |
| Pacientes | [Abrir](capturas/03-pacientes.png) |
| Citas | [Abrir](capturas/04-citas.png) |
| Entrenamientos | [Abrir](capturas/05-entrenamientos.png) |
| Ejercicios | [Abrir](capturas/06-ejercicios.png) |
| Archivos | [Abrir](capturas/07-archivos.png) |
| Administración | [Abrir](capturas/08-administracion.png) |

## Plan de contingencia

Si falla la red, el correo o Supabase:

- Utilizar las capturas como evidencia visual.
- Mostrar el flujo en código y los diagramas de secuencia.
- Abrir el [PDF de prueba generado por el backend](../../backend/src/tests/test-output.pdf).
- Explicar qué operación externa falló sin ocultar el resultado local.

[← Código](../07-codigo-fuente/README.md) · [Siguiente: conclusiones →](../09-conclusiones/README.md)
