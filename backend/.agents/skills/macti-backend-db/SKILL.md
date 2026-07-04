---
name: macti-backend-db
description: Reglas y contexto para base de datos (PostgreSQL y SQLite), modelos SQLAlchemy y migraciones Alembic. Usa este skill cuando trabajes con modelos de base de datos, relaciones de tablas, migraciones, repositorios o configuraciones de base de datos del backend.
---

# Gestión de Base de Datos (MACTI-API)

Este skill define la configuración, herramientas y reglas específicas para la interacción con la base de datos y la gestión de modelos y migraciones en el backend.

## 🛠️ Tecnologías y Configuración
- **Motores**: PostgreSQL (producción/staging) y SQLite (desarrollo local).
- **Inicialización**: Dinámica según la variable de entorno `DB_PROVIDER`.
- **ORM**: SQLAlchemy 2.0 (declarative mapping) con inyección de sesión asíncrona.
- **Migraciones**: Alembic (exclusivo para PostgreSQL).

## 📁 Archivos Relacionados
- [app/core/db/](../../../app/core/db): Inicialización del motor y configuración de sesión.
- [app/shared/models/](../../../app/shared/models): Modelos declarativos SQLAlchemy mapeados a las tablas.
- [app/shared/models/__init__.py](../../../app/shared/models/__init__.py): Registro de modelos para auto-detección de Alembic.

## ⚠️ Reglas Obligatorias
1. **No generar migraciones para SQLite**: SQLite se utiliza únicamente para pruebas y desarrollo local. Para aplicar cambios de esquema locales, elimina el archivo `macti.db` para que el sistema lo vuelva a crear limpio al arrancar.
2. **Registro de modelos**: Todos los nuevos modelos deben registrarse en [app/shared/models/__init__.py](../../../app/shared/models/__init__.py) de forma obligatoria.
3. **Capa de Repositorio**: Todo acceso a la base de datos (lecturas, escrituras, consultas complejas) debe realizarse a través de un **Repository** en la carpeta `repositories/` del módulo correspondiente. Está prohibido realizar consultas directas de SQLAlchemy en controladores u otras capas.
