# Contexto y Reglas del Proyecto Backend (MACTI-API)

Este archivo contiene las pautas, arquitectura, tecnologías y reglas específicas para los agentes que trabajen en el backend del proyecto.

## 🛠️ Tecnologías y Herramientas

- **Lenguaje**: Python >= 3.12.
- **Gestión de Entorno y Dependencias**: [uv](https://astral.sh/uv/) (Astral).
- **Framework Web**: FastAPI (estándar).
- **Base de Datos**: PostgreSQL y SQLite.
  - El motor se inicializa de forma dinámica según la variable `DB_PROVIDER` (definida en el entorno).
  - ORM: SQLAlchemy 2.0 (declarative mapping).
  - Migraciones: Alembic (únicamente para PostgreSQL / producción).
- **Validación de Datos**: Pydantic v2 (esquemas y configuraciones).
- **Caché y Almacenamiento**: Redis (cliente asíncrono para cachear sesiones/estados).
- **Formateador y Linter**: Ruff (configurado en `pyproject.toml`).

---

## 📁 Estructura del Proyecto y Convenciones de Código

El código fuente principal se encuentra en [app/](app).

### Estructura de Directorios y Arquitectura (Variante de MVCS)

El backend sigue un patrón de diseño basado en una **variante de MVCS (Model-View-Controller-Service)** con agregados y modificaciones específicas:

1. **[app/core/](app/core)**:
   - Configuración global del sistema.
   - [db/](app/core/db): Inicialización de motores de bases de datos SQLite/PostgreSQL y configuración de Alembic.
     > [!IMPORTANT]
     > **No se deben generar migraciones para SQLite**. Dado que SQLite se utiliza únicamente para pruebas locales, para aplicar cambios de esquema simplemente se debe eliminar el archivo local de la base de datos (`macti.db`) y volver a crearlo al arrancar la aplicación.
   - [environment.py](app/core/environment.py): Centralización de variables de entorno mediante `pydantic-settings`.
     > [!IMPORTANT]
     > **Todas las nuevas variables de entorno** deben declararse de manera obligatoria tanto en `app/core/environment.py` como en [.env.example](.env.example).
   - [logging/](app/core/logging): Configuración del logger global (`loguru`).

2. **[app/shared/](app/shared)**:
   - Código, modelos y servicios reutilizables por múltiples módulos.
   - [models/](app/shared/models): Todos los modelos SQLAlchemy mapeados a tablas de base de datos.
     > [!IMPORTANT]
     > Los nuevos modelos de base de datos deben registrarse en [app/shared/models/__init__.py](app/shared/models/__init__.py) para que Alembic los detecte automáticamente al generar migraciones para PostgreSQL.
   - [services/](app/shared/services): Clientes para integraciones de bases de datos globales.
     > [!NOTE]
     > Actualmente, `redis_client` se encuentra en esta capa, lo cual es una colocación incorrecta que se corregirá en el futuro.
   - [dependencies/](app/shared/dependencies): Dependencias inyectables de FastAPI (por ejemplo, tokens de autenticación o sesiones de base de datos).

3. **[app/modules/](app/modules)**:
   - Módulos independientes organizados por funcionalidad del negocio (por ejemplo, `register`, `courses`, `nbgrader`).
   - Cada módulo sigue estrictamente la siguiente arquitectura:
     - [routes.py](app/modules/register/routes.py): Define las rutas del router de FastAPI, validaciones básicas y middlewares.
     - [schemas.py](app/modules/register/schemas.py): Esquemas Pydantic (`BaseModel`) para la validación de entrada/salida de datos de los endpoints.
     - [controllers/](app/modules/register/controllers): Clases controladoras que gestionan la lógica de orquestación, validación de negocio y manejo de excepciones HTTP.
     - [repositories/](app/modules/register/repositories): Capa encargada del acceso y manipulación de datos en la BD utilizando SQLAlchemy.
       > [!IMPORTANT]
       > **Todo manejo de la base de datos** debe ser realizado obligatoriamente a través de un **repository**. No se permite realizar consultas o escrituras directas de SQLAlchemy fuera de esta capa.
     - [use_cases/](app/modules/register/use_cases) (Opcional): Esta capa se utiliza estrictamente para centralizar funciones y lógica compartida que debe ser reutilizada por distintos controladores (no se comporta como la capa de casos de uso tradicional de Clean Architecture).
     - [services/](app/modules/register/services) (Opcional): Capa de servicios utilizada **únicamente para consumir APIs externas**. No se comporta como la capa de servicios convencional de un MVCS clásico; su propósito es simple, acotado y específico.

4. **[app/main.py](app/main.py)**:
   - Instancia y configura la aplicación FastAPI, registrando middlewares, lifespan (arranque/apagado de Redis) y routers.

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
3. **Variables de Entorno**: Registra cada nueva variable tanto en [app/core/environment.py](app/core/environment.py) como en [.env.example](.env.example).
4. **Interacción con la BD**: Encapsula todo acceso a base de datos en clases Repositorio dentro de la carpeta `repositories/` del módulo correspondiente.
5. **Migraciones SQLite**: No generes revisiones de Alembic para bases de datos SQLite locales. Si cambias el esquema localmente, elimina el archivo `macti.db` para que el sistema lo vuelva a crear limpio al iniciar.
6. **Manejo de Errores**: Lanza siempre excepciones `fastapi.HTTPException` con códigos de estado semánticos y detalles en formato de diccionario estructurado (por ejemplo, `{"error_code": "CODIGO", "message": "Detalle del error"}`).
7. **Formateo**: Sigue la ordenación de importaciones requerida por Ruff. Ejecuta `uv run ruff check --fix` y `uv run ruff format` después de editar archivos.
8. **No comentes innecesariamente**: Evita comentarios redundantes sobre los cambios en el código fuente. Escribe código autoexplicativo y prioriza docstrings claros y actualizados.
9. **Actualización de README**: Si las modificaciones del código afectan la estructura del proyecto, agregan variables de entorno o dependencias clave, o alteran los comandos de ejecución, se debe **actualizar el archivo README.md del backend** de forma mandatoria para reflejar dichos cambios.

---

## 🔄 Git y Control de Versiones

### Convención de Mensajes de Confirmación (Conventional Commits)
Los mensajes de commit deben seguir una estructura clara y estandarizada:
- **Estructura**: `<tipo>(<alcance opcional>): <descripción>` seguida de un cuerpo y pie de página si es necesario.
- **Tipos de Commit permitidos**:
  - `feat`: Añade una nueva característica o funcionalidad.
  - `fix`: Resuelve un error o bug.
  - `docs`: Modifica o añade documentación.
  - `style`: Cambios de estilo y formato (espacios, punto y coma, etc.) sin afectar el significado del código.
  - `refactor`: Reorganización de código que no corrige un error ni añade funcionalidad.
  - `perf`: Mejoras de rendimiento en el código.
  - `test`: Añade o corrige pruebas unitarias/de integración.
  - `build`: Cambios que afectan el sistema de compilación o dependencias externas.
  - `ci`: Cambios en la configuración de integración o despliegue continuo (CI/CD).
  - `chore`: Tareas de mantenimiento o configuración que no modifican código fuente de la app.
- **Idioma**: Los mensajes de confirmación deben redactarse obligatoriamente en **español**.
- **Tiempo verbal**: La descripción debe estar redactada en **tiempo pasado** (ej. `feat: se implementó inicio de sesión`, `fix: se corrigió error en base de datos`).
- **Cuerpo del mensaje**: Si hay varios cambios importantes, enuméralos en el cuerpo del mensaje de confirmación, ordenándolos de **mayor a menor importancia**.

### Pull Requests (PRs)
- Al crear una PR, es obligatorio incluir una descripción clara, estructurada e informativa que detalle con precisión todos los cambios realizados en la rama y el propósito de los mismos.
