# 🚀 MACTI API

> Una API desarrollada con FastAPI para la gestión de cuentas de usuario, identidades y recursos académicos integrada con Keycloak y Moodle en la UNAM.

---

## 🛠️ Tecnologías y Herramientas

- **Framework**: FastAPI (estándar)
- **Gestión de Entorno y Dependencias**: [uv](https://astral.sh/uv/) (Astral)
- **Base de Datos**: PostgreSQL (producción) y SQLite (desarrollo local)
  - Mapeado con SQLAlchemy 2.0.
  - Migraciones gestionadas por Alembic (únicamente para PostgreSQL / producción).
- **Validación de Datos**: Pydantic v2 (esquemas y configuraciones)
- **Servidor**: FastAPI CLI / Uvicorn
- **Caché y Almacenamiento**: Redis (cliente asíncrono)
- **Linter y Formateo**: Ruff
- **Control de Calidad**: Pre-commit hooks (configurados localmente)

---

## 📁 Estructura del Proyecto (Variante de MVCS)

El backend está diseñado bajo una arquitectura modular y desacoplada basada en una **variante de MVCS** con las siguientes carpetas principales dentro de `app/`:

```
backend/
├── app/                           # Código fuente principal
│   ├── main.py                    # Punto de entrada y ciclo de vida de la aplicación
│   │
│   ├── core/                      # Configuración central del sistema
│   │   ├── db/                    # Motores de base de datos sqlite y postgres
│   │   ├── environment.py         # Centralización de variables de entorno (Pydantic Settings)
│   │   └── logging/               # Configuración del logger global (Loguru)
│   │
│   ├── shared/                    # Código y dependencias compartidos
│   │   ├── models/                # Modelos SQLAlchemy globales (Registrados en __init__.py)
│   │   ├── services/              # Clientes de uso global (como redis_client)
│   │   └── dependencies/          # Inyección de dependencias de FastAPI (sesión de BD, Auth)
│   │
│   └── modules/                   # Módulos de funcionalidad independientes
│       ├── register/              # Módulo de registro (Ejemplo)
│       │   ├── routes.py          # Enrutadores, endpoints y dependencias
│       │   ├── schemas.py         # Validación de datos de petición y respuesta (Pydantic)
│       │   ├── controllers/       # Controladores de la lógica de negocio y excepciones HTTP
│       │   ├── repositories/      # Capa de base de datos dedicada (SQLAlchemy)
│       │   ├── use_cases/         # (Opcional) Funciones y lógica reutilizable entre controladores
│       │   └── services/          # (Opcional) Consumo de APIs externas únicamente
│       └── courses/               # Módulo de cursos
```

---

## 🚀 Instalación y Configuración Local

### Prerrequisitos

- Python >= 3.12
- [uv](https://astral.sh/uv/) (gestor de paquetes de Python)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/CarlosGunter/macti-monorepo
cd macti-monorepo/backend
```

### 2. Configuración de Variables de Entorno
Copia el archivo de ejemplo y configura tus variables:
```bash
cp .env.example .env
```
> [!IMPORTANT]
> **Cualquier nueva variable de entorno** que sea requerida por el backend debe declararse obligatoriamente tanto en `app/core/environment.py` como en `.env.example`.

### 3. Ejecutar el Proyecto
Para iniciar el servidor de desarrollo utilizando la CLI de FastAPI con recarga automática:
```bash
uv run fastapi dev
```

Si deseas modificar el puerto o la dirección host:
```bash
uv run fastapi dev --host 0.0.0.0 --port 8000
```

---

## 🔧 Desarrollo y Reglas de Calidad

Los cambios realizados en esta capa deben cumplir estrictamente las normas descritas en [backend/.agents/AGENTS.md](.agents/AGENTS.md):
- **Acceso a Base de Datos**: Todo manejo de datos de SQLAlchemy debe estar encapsulado en un **Repository** dentro del módulo correspondiente. No se permite realizar consultas directas de base de datos en controladores o rutas.
- **SQLite (Desarrollo)**: **No se deben generar archivos de migración de Alembic para SQLite**. Si realizas cambios en los modelos para tu entorno local de pruebas, simplemente elimina el archivo local `macti.db` para que el sistema cree la base de datos limpia al iniciar la app.
- **Servicios**: La capa de `services` en los módulos se reserva **exclusivamente para el consumo de APIs externas** (no se utiliza como servicios clásicos de MVCS).
- **Docstrings**: Es mandatorio **generar y mantener actualizados los docstrings** para documentar todas las clases, métodos y funciones del código.
- **Formateo**: Ejecuta `uv run ruff check --fix` y `uv run ruff format` para verificar que el código cumple con los estándares de estilo antes de hacer commit.
- **Commits**: Los mensajes de confirmación deben redactarse en **español**, en **tiempo pasado** y utilizando la convención de **Conventional Commits** ordenando los cambios en el cuerpo por orden de importancia.