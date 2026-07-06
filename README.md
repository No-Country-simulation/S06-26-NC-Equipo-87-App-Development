# OpsCore - Operations Consulting

OpsCore es una plataforma de gestión operacional diseñada para digitalizar el reporte, seguimiento y análisis de incidentes en entornos industriales/planta. Reemplaza el flujo actual basado en WhatsApp y Excel, permitiendo que los operadores reporten fallas desde una aplicación móvil, los supervisores las asignen a técnicos y los gerentes monitoreen métricas y causas raíz desde un dashboard web.

## Objetivos

* **Reducir el tiempo de respuesta** ante incidentes operativos.
* **Dar trazabilidad completa** al ciclo de vida de un incidente (Reportado → Asignado → En proceso → Cerrado).
* **Identificar patrones de causa raíz** para prevenir fallas recurrentes.
* **Sustituir el registro manual** (Excel/WhatsApp) por datos estructurados y auditables.
* **Ofrecer métricas** de tiempo de respuesta y tasa de resolución en tiempo real.

## Roles del Sistema

| Rol | Plataforma | Función Principal |
| :--- | :--- | :--- |
| **Operador** | Móvil | Reportar incidentes |
| **Supervisor** | Móvil / Web | Asignar técnicos a tickets |
| **Técnico** | Móvil | Atender y cerrar tickets |
| **Gerente** | Web | Monitorear KPIs y causas raíz |

## Estructura del Proyecto

* **`api/`**: Backend REST API construido en C# + ASP.NET Core (.NET 10), con base de datos PostgreSQL.
* **`web/`**: Dashboard web construido en React + Vite + TypeScript.
* **`mobile/`**: Aplicación móvil construida en React Native + Expo + TypeScript.
* **`infra/`**: Configuración de infraestructura.
* **`docs/`**: Documentación del proyecto.

## Comandos de Ejecución

### API Backend
Para iniciar el backend REST API en C# + ASP.NET Core (.NET 10):
```bash
cd api/src
dotnet run
```

### Dashboard Web
Para iniciar el panel web en React + Vite + TypeScript:
```bash
cd web
npm install
npm run dev
```

### Aplicación Móvil
Para iniciar la aplicación móvil en React Native + Expo + TypeScript:
```bash
cd mobile
npm install
npm run start
```

