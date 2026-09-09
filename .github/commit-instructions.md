# Instrucciones de Generación de Mensajes de Commit para GitHub Copilot

Siempre que generes un mensaje de commit para este repositorio, debes seguir estrictamente las siguientes directrices basadas en las reglas del proyecto:

## 1. Formato y Estructura (Conventional Commits)

El mensaje debe respetar la estructura estándar:

```text
<tipo>(<alcance opcional>): <descripción>

[cuerpo del mensaje opcional]
```

- **Línea de título**: Concisa, directa y clara.
- **Alcance (scope)** *(opcional)*: Identifica el módulo, paquete o capa afectada (por ejemplo: `backend`, `frontend`, `courses`, `auth`, `db`, `ci`).
- **Separación**: Deja siempre una línea en blanco entre el título y el cuerpo del commit si incluyes cuerpo.

---

## 2. Tipos de Commit Permitidos

Utiliza exclusivamente uno de los siguientes tipos:

| Tipo | Descripción |
| :--- | :--- |
| `feat` | Añade una nueva característica o funcionalidad. |
| `fix` | Resuelve un error o bug. |
| `docs` | Modifica o añade documentación (README, docstrings, comentarios). |
| `style` | Cambios de formato y estilo de código (espacios, indentación, comas) sin alterar la lógica. **No aplica** para diseño visual o estilos CSS/Tailwind. |
| `refactor` | Reorganización o reestructuración de código sin corregir bugs ni añadir funcionalidades. |
| `perf` | Mejoras y optimizaciones de rendimiento. |
| `test` | Añade, actualiza o corrige pruebas automatizadas. |
| `build` | Cambios que afectan el sistema de compilación, empaquetado o dependencias externas (ej. `uv`, `pyproject.toml`, `package.json`, `pnpm-lock.yaml`). |
| `ci` | Modificaciones en integración o despliegue continuo (GitHub Actions, pipelines, workflows). |
| `chore` | Tareas de mantenimiento, configuración de herramientas o tareas misceláneas. |

---

## 3. Reglas Lingüísticas Obligatorias

- **Idioma**: Español únicamente.
- **Tiempo Verbal**: Pasado en tercera persona impersonal o reflexivo (ejemplo: `se implementó...`, `se corrigió...`, `se actualizó...`).
  - ❌ **Incorrecto** (infinitivo): `feat: agregar autenticación con jwt`
  - ❌ **Incorrecto** (imperativo / presente): `feat: agrega autenticación con jwt`
  - ❌ **Incorrecto** (inglés): `feat: add jwt authentication`
  - ✅ **Correcto** (pasado): `feat(auth): se implementó autenticación con jwt`

---

## 4. Estructura del Cuerpo del Mensaje

- Si el cambio involucra múltiples modificaciones o requiere explicación detallada, utiliza una lista con viñetas en el cuerpo.
- Ordena los puntos de **mayor a menor relevancia**.

---

## 5. Ejemplos

### Ejemplo simple:
```text
fix(db): se corrigió error de concurrencia en la sesión de base de datos
```

### Ejemplo con alcance y cuerpo detallado:
```text
feat(courses): se implementó endpoint para listar cursos matriculados

- Se agregó el controlador `user_enrolled_courses` con validación de roles.
- Se implementó la consulta en el repositorio correspondiente.
- Se agregaron los esquemas Pydantic para la respuesta serializada.
```

### Ejemplo de mantenimiento/chore:
```text
chore(config): se actualizaron variables de entorno para el entorno local
```
