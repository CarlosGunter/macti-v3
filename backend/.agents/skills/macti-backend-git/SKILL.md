---
name: macti-backend-git
description: Reglas de Git, Conventional Commits y Pull Requests para los cambios en el Backend. Usa este skill cuando prepares confirmaciones de cambios (commits), crees ramas o prepares solicitudes de cambios (Pull Requests) para la API del backend.
---

# Control de Versiones y Git para Backend

Este skill documenta las reglas estrictas de control de versiones y confirmación de cambios para el repositorio en su sección de Backend.

## 🔄 Flujo de Trabajo en Git
- **Git Branching**: Utiliza ramas de trabajo limpias, semánticas y enfocadas a una sola tarea o módulo (ej. `feature/courses-endpoints` o `bugfix/fix-auth-token`).

## 📝 Convención de Commits (Conventional Commits)
Los mensajes de commit deben seguir estrictamente el estándar de Conventional Commits:

- **Estructura**:
  ```
  <tipo>(<alcance opcional>): <descripción>
  
  [cuerpo del mensaje opcional]
  ```
- **Tipos Permitidos**:
  - `feat`: Nueva funcionalidad.
  - `fix`: Resolución de un bug.
  - `docs`: Modificación o adición de documentación.
  - `style`: Formato del código (espacios, comas) sin afectar comportamiento.
  - `refactor`: Reorganización de código sin añadir características ni resolver bugs.
  - `perf`: Optimización de rendimiento.
  - `test`: Adición o corrección de pruebas unitarias/de integración.
  - `build`: Cambios en el sistema de compilación o dependencias de Python/uv.
  - `ci`: Configuración de integración o despliegue continuo (GitHub Actions, etc.).
  - `chore`: Tareas de configuración o mantenimiento general.

- **Idioma Obligatorio**: Español.
- **Tiempo Verbal**: Pasado (ej. `feat: se implementó inicio de sesión`, `fix: se corrigió error en base de datos`).
- **Cuerpo**: Si existen múltiples cambios, enuméralos en orden de mayor a menor relevancia.

## 🔀 Pull Requests (PRs)
- Redactar una descripción clara, concisa y estructurada que detalle los cambios introducidos, el motivo del cambio y los pasos de prueba ejecutados para validar el funcionamiento.
