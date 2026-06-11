# 02. Actores y casos de uso

## Actores

| Actor | Papel en el sistema |
|---|---|
| Superadministrador | Gestiona profesionales y dispone de acceso global |
| Profesional | Trabaja como fisioterapeuta o entrenador según su campo `tipo` |
| Paciente | Recibe el entrenamiento y completa el seguimiento público |
| Sistema | Genera PDF, envía correo, persiste datos y calcula resúmenes |

En la implementación, fisioterapeuta y entrenador son especializaciones funcionales del profesional: comparten el rol técnico `admin`, mientras `tipo` identifica su especialidad.

## Casos de uso principales

| Código | Caso | Diagrama |
|---|---|---|
| CU1 | Gestionar paciente | [Abrir](diagramas/cu-01-gestionar-paciente.png) |
| CU2 | Gestionar citas | [Abrir](diagramas/cu-02-gestionar-citas.png) |
| CU3 | Crear entrenamiento | [Abrir](diagramas/cu-03-crear-entrenamiento.png) |
| CU4 | Generar plantilla PDF | [Abrir](diagramas/cu-04-generar-plantilla.png) |
| CU5 | Enviar entrenamiento | [Abrir](diagramas/cu-05-enviar-entrenamiento.png) |
| CU6 | Registrar seguimiento | [Abrir](diagramas/cu-06-registrar-seguimiento.png) |

## Flujo funcional integrado

Los casos CU3, CU4, CU5 y CU6 forman un único recorrido de valor: el profesional prescribe un entrenamiento y obtiene posteriormente información sobre su ejecución.

![Crear entrenamiento](diagramas/cu-03-crear-entrenamiento.png)

[← Modelo del dominio](../01-modelo-dominio/README.md) · [Siguiente: caso representativo →](../03-casos-representativos/README.md)
