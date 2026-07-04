---
name: macti-frontend-git
description: Reglas de Git, Conventional Commits y Pull Requests para los cambios en el Frontend. Usa este skill cuando prepares confirmaciones de cambios (commits), crees ramas o prepares solicitudes de cambios (Pull Requests) para la aplicación frontend.
---

# Control de Versiones y Git para Frontend

Este skill documenta las reglas estrictas de control de versiones y confirmación de cambios para el repositorio en su sección de Frontend.

## 🔄 Flujo de Trabajo en Git
- **Git Branching**: Utiliza ramas de trabajo limpias, semánticas y enfocadas a una sola tarea o módulo (ej. `feature/user-profile` o `bugfix/fix-navbar-spacing`).

## 📝 Convención de Commits (Conventional Commits)
Los mensajes de commit deben seguir estrictamente el estándar de Conventional Commits:

- **Estructura**:
  ```
  <tipo>(<alcance opcional>): <descripción>
  
  [cuerpo del mensaje opcional]
  ```
- **Tipos de Commit permitidos**:
  - `feat`: Añade una nueva característica o funcionalidad.
  - `fix`: Resuelve un error o bug.
  - `docs`: Modifica o añade documentación.
  - `style`: Cambios de formato y estilo de código (espacios, comas, etc.) sin cambiar la semántica del código. **No aplica** para modificaciones visuales de estilos (CSS, SCSS, Tailwind, etc.).
  - `refactor`: Reorganización de código sin corregir un error ni añadir funcionalidad.
  - `perf`: Mejoras de rendimiento.
  - `test`: Añade o corrige pruebas.
  - `build`: Cambios que afectan el sistema de empaquetado o dependencias externas (ej. pnpm-lock.yaml).
  - `ci`: Cambios en la configuración de integración o despliegue continuo (CI/CD).
  - `chore`: Tareas de mantenimiento o configuración general del frontend.

- **Idioma Obligatorio**: Español.
- **Tiempo Verbal**: Pasado (ej. `feat: se implementó inicio de sesión`, `fix: se corrigió error en base de datos`).
- **Cuerpo**: Si existen múltiples cambios, enuméralos en orden de mayor a menor relevancia.

## 🔀 Pull Requests (PRs)
- Redactar una descripción clara, concisa y estructurada que detalle los cambios introducidos, el motivo del cambio y los pasos de prueba ejecutados para validar el funcionamiento.
