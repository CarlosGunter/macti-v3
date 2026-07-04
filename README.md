# 📚 MACTI (Monorepositorio)

> **M**ateriales didácticos para **A**nálisis **C**omputacional **T**écnico e **I**nvestigación.

Este repositorio es un monorrepo que alberga los componentes principales del proyecto MACTI, una plataforma educativa moderna diseñada para complementar cursos semestrales de Análisis Numérico y Ecuaciones Diferenciales mediante ejemplos prácticos y aplicaciones de conceptos abstractos.

---

## 🏗️ Estructura del Monorepositorio

El proyecto está estructurado como un monorrepo que contiene dos partes principales:

### 1. [📚 Frontend](./frontend)
Una aplicación web interactiva y moderna construida para ofrecer la mejor experiencia educativa.
- **Tecnologías clave**: Next.js 15.5, React 19, Tailwind CSS 4, TypeScript, pnpm.
- **Propósito**: Interfaz de usuario interactiva para visualización de materiales, simulaciones y administración del aprendizaje.
- **Instrucciones detalladas**: Consulta el [README de Frontend](./frontend/README.md) para detalles de instalación, scripts y desarrollo.

### 2. [🚀 Backend](./backend)
Una API de alto rendimiento que proporciona la lógica de negocio y los servicios necesarios.
- **Tecnologías clave**: FastAPI, Python 3, SQLite con SQLAlchemy 2, Keycloak, Moodle, uv.
- **Propósito**: Gestión de usuarios, autenticación integrada con Keycloak/Moodle y base de datos para la plataforma.
- **Instrucciones detalladas**: Consulta el [README de Backend](./backend/README.md) para la configuración del entorno, migraciones y ejecución de la API.

---

## ⚡ Requisitos del Sistema

Para el correcto funcionamiento local del monorrepo, asegúrate de tener instalado:

- **Node.js** (versión >= 18.17.0) junto con **pnpm** (para gestionar el Frontend).
- **Python** (versión >= 3.8) junto con **uv** (para gestionar el Backend de forma rápida).
- **Git** para el control de versiones.

---

## 🚀 Inicio Rápido (Desarrollo Local)

Para poner en marcha el proyecto de forma local:

### Paso 1: Clonar el proyecto
```bash
git clone https://github.com/CarlosGunter/macti-monorepo.git
cd macti-monorepo
```

### Paso 2: Iniciar el Frontend
En una terminal:
```bash
cd frontend
pnpm install
pnpm dev
```
La interfaz estará lista en [http://localhost:3000](http://localhost:3000).

### Paso 3: Iniciar el Backend
En otra terminal o pestaña:
```bash
cd backend
# Configura las variables de entorno en un archivo .env guiándote de .env.example
uv run fastapi dev
```
La API y su documentación interactiva (Swagger UI) estarán en [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 🤝 Flujo de Contribución

1. Crea una rama para tu feature o fix (`git checkout -b feature/nombre-feature`).
2. Sigue las guías de estilo y linters configurados en cada carpeta (Ruff en backend, Biome/ESLint en frontend).
3. Asegúrate de pasar los hooks de `pre-commit` antes de hacer push a tus cambios.
4. Abre un Pull Request describiendo tus aportes.

---

