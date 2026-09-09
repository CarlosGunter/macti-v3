# Contexto Global y Guía de Agentes - MACTI Monorepo

Este archivo provee el mapa de contexto global y las reglas de redirección para agentes de desarrollo que trabajan en este repositorio.

## 📁 Estructura del Repositorio

El proyecto está organizado como un monorrepocito que contiene dos aplicaciones principales:

1. **Backend**: API REST desarrollada con FastAPI y Python. Se encuentra en la carpeta [backend/](backend).
2. **Frontend**: Aplicación web desarrollada con Next.js y React/TypeScript. Se encuentra en la carpeta [frontend/](frontend).

---

## 🔍 Carga Dinámica de Contexto Mediante Skills (¡IMPORTANTE!)

Para evitar saturar la memoria y el contexto de la conversación con detalles innecesarios de todo el repositorio, **las reglas generales residen en los archivos AGENTS.md de cada capa, y los detalles complejos están divididos en Skills específicos** dentro de sus carpetas `.agents/skills/` correspondientes:

### Backend Skills:
- **Base de Datos y Modelos**: [macti-backend-db](backend/.agents/skills/macti-backend-db/SKILL.md) (PostgreSQL, SQLite, SQLAlchemy, Alembic, Repositorios).
- **Arquitectura**: [macti-backend-arch](backend/.agents/skills/macti-backend-arch/SKILL.md) (Rutas, Esquemas, Controladores, Módulos).
- **Git/Commits**: [macti-backend-git](backend/.agents/skills/macti-backend-git/SKILL.md) (Ramas, Commits convencionales, Pull Requests del backend).

### Frontend Skills:
- **Git/Commits**: [macti-frontend-git](frontend/.agents/skills/macti-frontend-git/SKILL.md) (Ramas, Commits convencionales, Pull Requests del frontend).

### Instrucciones para el Agente:
Cuando vayas a realizar modificaciones, tareas de investigación, depuración o desarrollo de nuevas funcionalidades:
1. **Identifica** el ámbito en el que vas a trabajar (`backend/` o `frontend/`) y la tarea específica (Base de Datos, Arquitectura, Flujo de Trabajo, Git, etc.).
2. **Lee de forma obligatoria** el Skill relevante utilizando la herramienta `view_file` al inicio de tu tarea si necesitas detalles sobre los estándares y convenciones específicos.
3. **No intentes leer todas las reglas de una sola vez**, utiliza únicamente los Skills necesarios para la tarea actual para optimizar el contexto.

## Commits
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