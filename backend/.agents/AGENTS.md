# Contexto y Reglas del Proyecto Backend (MACTI-API)

Este archivo contiene las pautas, tecnologías y reglas específicas para los agentes que trabajen en el backend del proyecto.

## 🛠️ Tecnologías y Herramientas

- **Lenguaje**: Python >= 3.12.
- **Gestión de Entorno y Dependencias**: [uv](https://astral.sh/uv/) (Astral).
- **Framework Web**: FastAPI (estándar).
- **Formateador y Linter**: Ruff (configurado en `pyproject.toml`).

---

## ⚡ Comandos Comunes y Flujo de Trabajo

### Iniciar el Servidor de Desarrollo
Para arrancar la API con recarga automática para desarrollo local, se utiliza la CLI de FastAPI:
```bash
uv run fastapi dev
```

### Gestión de Base de Datos y Migraciones con Alembic (PostgreSQL)
- **Generar una nueva migración automáticamente**:
  ```bash
  uv run alembic revision --autogenerate -m "descripción de la migración"
  ```
- **Aplicar migraciones pendientes**:
  ```bash
  uv run alembic upgrade head
  ```

### Calidad y Formato del Código
- **Analizar el código (linter)**:
  ```bash
  uv run ruff check
  ```
- **Formatear el código**:
  ```bash
  uv run ruff format
  ```

---

## ⚠️ Reglas para Agentes de IA

1. **Usa siempre la CLI de FastAPI**: Utiliza `uv run fastapi dev` para ejecutar la aplicación en entorno local.
2. **Docstrings**: El agente **debe generar y mantener actualizados los docstrings** de todo el código que escriba o modifique, asegurando una correcta documentación de funciones, clases y módulos.
3. **Variables de Entorno**: Registra cada nueva variable tanto en [app/core/environment.py](../app/core/environment.py) como en [.env.example](../.env.example).
4. **Formateo**: Sigue la ordenación de importaciones requerida por Ruff. Ejecuta `uv run ruff check --fix` y `uv run ruff format` después de editar archivos.
5. **No comentes innecesariamente**: Evita comentarios redundantes sobre los cambios en el código fuente. Escribe código autoexplicativo y prioriza docstrings claros y actualizados.
6. **Actualización de README**: Si las modificaciones del código afectan la estructura del proyecto, agregan variables de entorno o dependencias clave, o alteran los comandos de ejecución, se debe **actualizar el archivo README.md del backend** de forma mandatoria para reflejar dichos cambios.

---

## 🔍 Carga Dinámica de Contexto por Capas (Skills)

Para optimizar el uso de tokens y mantener el contexto de la conversación limpio, los detalles de la base de datos, arquitectura y control de versiones se manejan a través de Skills específicos:

- **Base de Datos y Modelos**: Consulta el skill `macti-backend-db` en [skills/macti-backend-db/SKILL.md](skills/macti-backend-db/SKILL.md).
- **Arquitectura MVCS**: Consulta el skill `macti-backend-arch` en [skills/macti-backend-arch/SKILL.md](skills/macti-backend-arch/SKILL.md).
- **Git y Control de Versiones**: Consulta el skill `macti-backend-git` en [skills/macti-backend-git/SKILL.md](skills/macti-backend-git/SKILL.md).
