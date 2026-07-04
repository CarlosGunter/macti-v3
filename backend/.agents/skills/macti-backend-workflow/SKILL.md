---
name: macti-backend-workflow
description: Comandos de desarrollo, calidad de código (Ruff, docstrings), variables de entorno y manejo de excepciones HTTP en el backend. Usa este skill cuando necesites ejecutar el servidor de FastAPI, formatear el código con Ruff, añadir variables de entorno, documentar funciones con docstrings, o lanzar excepciones HTTP.
---

# Flujo de Trabajo y Reglas de Desarrollo del Backend

Este skill define los comandos cotidianos, convenciones de calidad del código y buenas prácticas para el desarrollo de la API.

## ⚡ Comandos Comunes
- **Ejecutar servidor local (FastAPI dev)**:
  ```bash
  uv run fastapi dev
  ```
- **Analizar código con Ruff (Linter)**:
  ```bash
  uv run ruff check
  ```
- **Formatear código con Ruff (Formatter)**:
  ```bash
  uv run ruff format
  ```
- **Ordenar importaciones y auto-corregir**:
  ```bash
  uv run ruff check --fix
  ```

## ⚠️ Reglas y Estándares de Codificación
1. **Docstrings Obligatorios**: Genera y mantén actualizados los docstrings en formato descriptivo para todas las funciones, clases y módulos nuevos o modificados.
2. **Variables de Entorno**: Cualquier nueva variable debe declararse e inicializarse obligatoriamente en `app/core/environment.py` mediante Pydantic y documentarse en el archivo [.env.example](../../../.env.example).
3. **Manejo de Errores**: Lanza excepciones de tipo `fastapi.HTTPException` con códigos de estado HTTP semánticos y detalles estructurados. Ejemplo:
   ```python
   raise HTTPException(
       status_code=status.HTTP_400_BAD_REQUEST,
       detail={"error_code": "RESOURCE_NOT_FOUND", "message": "El recurso especificado no existe."}
   )
   ```
4. **No comentar innecesariamente**: No dejes comentarios triviales en el código que expliquen los cambios. Escribe código autoexplicativo apoyado de docstrings profesionales.
5. **Actualización de Documentación**: Si agregas dependencias, modificas variables de entorno esenciales o cambias la estructura de ejecución, actualiza mandatoriamente el archivo [README.md](../../../README.md) del backend.
