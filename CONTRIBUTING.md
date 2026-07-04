# 🧭 Guía de Contribución del Monorepositorio

Este proyecto utiliza un flujo de trabajo basado en **Git** y **GitHub** con integración mediante *Pull Requests (PRs)*. Al ser un monorepositorio, el objetivo es mantener un historial limpio, estable y colaborativo tanto en el `frontend` como en el `backend`.

---

## 🪴 Ramas principales

El desarrollo se organiza en torno a las siguientes ramas principales:

| Rama | Descripción |
|------|--------------|
| `main` | Versión estable del proyecto en producción. Solo se actualiza mediante merges desde `dev`. |
| `dev` | Rama base de desarrollo. Recibe **únicamente merges** desde ramas `feature/*` y `fix/*`. |
| `feature/*` | Ramas creadas para implementar nuevas funcionalidades (ej. `feature/autenticacion-keycloak`). |
| `fix/*` | Ramas creadas para correcciones de bugs o mejoras menores (ej. `fix/alineacion-boton`). |

---

## 🚀 Flujo de Trabajo para Desarrolladores

### 1️⃣ Crear una nueva rama
Antes de comenzar a programar, asegúrate de actualizar tu rama `dev` local y crear tu rama de trabajo a partir de ella:

```bash
# Cambiar a la rama de desarrollo
git checkout dev

# Traer los últimos cambios
git pull origin dev

# Crear tu rama de funcionalidad
git checkout -b feature/nombre-funcionalidad

# O para correcciones de bugs
git checkout -b fix/nombre-correccion
```

### 2️⃣ Realizar cambios y commits estructurados
Realiza tus cambios enfocándote en commits pequeños y con una sola responsabilidad. Te sugerimos seguir la convención de [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` para nuevas características.
- `fix:` para corrección de bugs.
- `docs:` para cambios en la documentación.
- `style:` para cambios estéticos que no afectan la lógica.
- `refactor:` para cambios de código que no corrigen bugs ni añaden características.

```bash
git add .
git commit -m "feat: agregar validación de sesión de usuario"
```

### 3️⃣ Asegurar la calidad del código (Linters y Formateadores)
Antes de enviar tus aportaciones, debes asegurarte de cumplir con las reglas de estilo y calidad de cada componente:

#### 🐍 Backend (Python)
- **Herramientas**: Ruff (linter/formatter) y Pyright (tipo estático).
- **Pre-commit**: Contamos con ganchos de git configurados en el archivo raíz `.pre-commit-config.yaml`.
- **Instalación y ejecución de pre-commit**:
  ```bash
  # Instalar los hooks de pre-commit (desde el backend usando uv)
  uv run pre-commit install
  
  # Ejecutar los hooks manualmente sobre todos los archivos
  uv run pre-commit run --all-files
  ```

#### ⚛️ Frontend (Next.js & TypeScript)
- **Herramientas**: Biome y ESLint.
- **Validación**:
  ```bash
  cd frontend
  # Ejecutar linter
  pnpm lint
  ```

### 4️⃣ Mantener la rama actualizada
La rama `dev` remota puede cambiar mientras estás trabajando. Para evitar conflictos difíciles al integrar, mantén tu rama al día:

```bash
# Asegúrate de estar en tu rama de trabajo
git checkout feature/nombre-funcionalidad

# Traer e integrar los cambios de dev
git pull origin dev
```
*Si surgen conflictos, resuélvelos localmente antes de continuar.*

### 5️⃣ Crear el Pull Request (PR) hacia `dev`
Una vez termines y verifiques localmente que todo funciona y los linters pasan con éxito, sube tu rama y abre un PR:

```bash
# Sube tus cambios al repositorio remoto
git push origin feature/nombre-funcionalidad
```

> [!IMPORTANT]
> - Asegúrate de que el destino del PR sea siempre la rama `dev`.
> - **Nunca** hagas un merge directo a `main` o cruces fusiones entre ramas de características (`feature/*`).

### 6️⃣ Revisión, Aprobación y Limpieza
1. Tu PR será revisado por otros miembros del equipo.
2. Tras la aprobación y el merge a `dev`, puedes limpiar tus ramas locales:
   ```bash
   # Cambiar a dev y actualizarla
   git checkout dev
   git pull origin dev
   
   # Eliminar la rama local de trabajo ya integrada
   git branch -d feature/nombre-funcionalidad
   ```

---
