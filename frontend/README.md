# Frontend de TheraTrack

## Responsabilidad

El frontend ofrece la interfaz web para profesionales y la vista pública de seguimiento. Presenta información de la API, gestiona navegación y autenticación local, y convierte los casos de uso en flujos interactivos.

## Tecnologías

- React 19
- Vite 8
- React Router 7
- Axios
- Tailwind CSS 4
- React Big Calendar
- Heroicons

## Estructura

```text
src/
├── components/    Componentes compartidos y protección de rutas
├── context/       Estado de autenticación
├── pages/         Pantallas asociadas a funcionalidades
├── services/      Cliente HTTP y envío del JWT
├── App.jsx        Definición de rutas
└── main.jsx       Punto de entrada
```

## Pantallas principales

| Pantalla | Caso de uso |
|---|---|
| `Login.jsx` | Autenticarse |
| `Dashboard.jsx` | Consultar situación diaria |
| `Pacientes.jsx` | Gestionar pacientes |
| `PacienteDetalle.jsx` | Consultar ficha y crear entrenamiento |
| `Citas.jsx` | Gestionar agenda |
| `Ejercicios.jsx` | Mantener catálogo |
| `Entrenamientos.jsx` | Consultar pautas |
| `Seguimiento.jsx` | Registrar seguimiento público |
| `Archivos.jsx` | Gestionar documentación |
| `SuperAdminPanel.jsx` | Gestionar profesionales |

## Componentes transversales

- `ProtectedRoute.jsx`: impide acceder a rutas privadas sin token.
- `MainLayout.jsx`: compone la estructura común.
- `Sidebar.jsx`: navegación y opciones según rol.
- `AuthContext.jsx`: persiste, decodifica y elimina el JWT.
- `services/api.js`: configura Axios y añade `Authorization: Bearer`.

## Caso conductor

La creación del entrenamiento comienza en `PacienteDetalle.jsx`. La pantalla obtiene pacientes y ejercicios, construye el payload y llama a `POST /entrenamientos`. El seguimiento se completa posteriormente desde la ruta pública `/seguimiento/:id`.

## Capturas relacionadas

- [Directorio de pacientes](../docs/08-demostracion/capturas/03-pacientes.png)
- [Entrenamientos](../docs/08-demostracion/capturas/05-entrenamientos.png)
- [Ejercicios](../docs/08-demostracion/capturas/06-ejercicios.png)

## Ejecución

```bash
npm install
npm run dev
```

La aplicación se abre normalmente en `http://localhost:5173` y consume la API en `http://localhost:3001/api`.

[← Portada de la defensa](../README.md) · [Código en el recorrido](../docs/07-codigo-fuente/README.md)
