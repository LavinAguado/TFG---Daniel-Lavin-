# Síntesis de requisitos

## Requisitos funcionales

| Grupo | Capacidades |
|---|---|
| Acceso | Autenticación, autorización y gestión de profesionales |
| Pacientes | Alta, consulta, edición, baja e historial |
| Citas | Calendario, asignación y control de solapamientos |
| Ejercicios | Catálogo editable con descripción y vídeo |
| Entrenamientos | Composición de pautas personalizadas |
| Automatización | PDF y envío por correo |
| Seguimiento | Dolor, esfuerzo, dificultad y comentarios |
| Documentación | Archivos asociados al paciente |
| Resumen | Síntesis determinista de evolución y métricas |

## Requisitos no funcionales

- **Seguridad:** JWT, bcrypt, roles y RLS.
- **Usabilidad:** interfaz web con navegación consistente.
- **Mantenibilidad:** frontend y backend separados por responsabilidades.
- **Compatibilidad:** navegadores modernos sin instalación cliente.
- **Escalabilidad:** módulos funcionales y API REST.
- **Privacidad:** acceso autenticado y URLs firmadas para documentos.

## Restricciones

- Aplicación académica orientada inicialmente a uso interno.
- Despliegue real y pruebas masivas quedan fuera del alcance.
- El resumen clínico utiliza reglas deterministas, no un modelo de IA externo.

[← Análisis](README.md)
