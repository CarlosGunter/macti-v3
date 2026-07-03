# Contexto Global y Guía de Agentes - MACTI Monorepo

Este archivo provee el mapa de contexto global y las reglas de redirección para agentes de desarrollo que trabajan en este repositorio.

## 📁 Estructura del Repositorio

El proyecto está organizado como un monorrepocito que contiene dos aplicaciones principales:

1. **Backend**: API REST desarrollada con FastAPI y Python. Se encuentra en la carpeta [backend/](backend).
2. **Frontend**: Aplicación web desarrollada con Next.js y React/TypeScript. Se encuentra en la carpeta [frontend/](frontend).

---

## 🔍 Carga Dinámica de Contexto por Capas (¡IMPORTANTE!)

Para evitar saturar la memoria y el contexto de la conversación con detalles innecesarios de todo el repositorio, **cada capa mantiene sus propias reglas y contexto en su respectiva carpeta `.agents/`**:

- **Contexto y Reglas del Backend**: Ubicado en [backend/.agents/AGENTS.md](backend/.agents/AGENTS.md).
- **Contexto y Reglas del Frontend**: Ubicado en [frontend/.agents/AGENTS.md](frontend/.agents/AGENTS.md).

### Instrucciones para el Agente:
Cuando vayas a realizar modificaciones, tareas de investigación, depuración o desarrollo de nuevas funcionalidades en una capa específica:
1. **Identifica** en qué directorio vas a trabajar (`backend/` o `frontend/`).
2. **Lee obligatoriamente** el archivo `AGENTS.md` correspondiente a esa capa utilizando la herramienta `view_file` al inicio de tu tarea.
3. **Sigue** los estándares de codificación, convenciones de estructura de archivos y comandos específicos documentados en dicho archivo.

---

## 🔄 Flujo de Trabajo Global y Control de Versiones

- **Git Branching**: Mantén ramas de trabajo limpias y enfocadas a una sola tarea o módulo.
- **Reglas de Commits y PRs**: Cada capa específica en su `AGENTS.md` correspondiente describe las convenciones obligatorias para mensajes de confirmación y Pull Requests.
