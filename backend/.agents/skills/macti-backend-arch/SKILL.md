---
name: macti-backend-arch
description: Arquitectura de la API (variante de MVCS) y estructura de directorios en app/. Usa este skill cuando crees o modifiques endpoints, controladores, esquemas Pydantic, inyección de dependencias o agregues nuevos módulos al backend.
---

# Arquitectura y Estructura del Backend (MACTI-API)

El backend sigue un patrón de diseño basado en una **variante de MVCS (Model-View-Controller-Service)**. Este skill detalla la estructura y convenciones del código.

## 📁 Estructura del Proyecto

El código fuente principal se encuentra en [app/](../../../app).

### 1. [app/core/](../../../app/core)
- Configuración global del sistema.
- [db/](../../../app/core/db): Inicialización de bases de datos.
- [environment.py](../../../app/core/environment.py): Configuración de variables de entorno con `pydantic-settings`.
- [logging/](../../../app/core/logging): Logger global (`loguru`).

### 2. [app/shared/](../../../app/shared)
- Componentes compartidos y reutilizables.
- [models/](../../../app/shared/models): Modelos SQLAlchemy.
- [services/](../../../app/shared/services): Clientes globales (ej. `redis_client`).
- [dependencies/](../../../app/shared/dependencies): Dependencias inyectables de FastAPI (sesión de BD, tokens, etc.).

### 3. [app/modules/](../../../app/modules)
Módulos independientes organizados por dominio de negocio (ej. `register`, `courses`). Cada módulo sigue la siguiente estructura:
- **`routes.py`**: Define los endpoints de FastAPI, rutas y middlewares locales.
- **`schemas.py`**: Esquemas de Pydantic (`BaseModel`) para validación de entrada/salida.
- **`controllers/`**: Manejo de la lógica de orquestación, validación de negocio y excepciones HTTP.
- **`repositories/`**: Acceso directo y manipulación de la base de datos utilizando SQLAlchemy. (Obligatorio para interactuar con la BD).
- **`use_cases/`** *(Opcional)*: Centralización de funciones y lógica compartida entre diferentes controladores.
- **`services/`** *(Opcional)*: Consumo y comunicación con APIs o servicios externos únicamente.

### 4. [app/main.py](../../../app/main.py)
- Instanciación de FastAPI, configuración de middlewares globales, lifespans (Redis) y registro de routers de módulos.
