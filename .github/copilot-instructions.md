# GitHub Copilot Instructions - MACTI Monorepo

Este repositorio contiene pautas y estándares definidos para el desarrollo de software y control de versiones.

## Convención de Commits

Al generar mensajes de commit o asistir con control de versiones (Git), sigue estrictamente las reglas descritas a continuación (y en [.github/commit-instructions.md](commit-instructions.md)):

### Formato (Conventional Commits)
```text
<tipo>(<alcance opcional>): <descripción>

[cuerpo del mensaje opcional]
```

### Tipos Permitidos
- `feat`: Añade una nueva característica o funcionalidad.
- `fix`: Resuelve un error o bug.
- `docs`: Modifica o añade documentación.
- `style`: Cambios de formato y estilo de código (espacios, comas, etc.) sin cambiar la semántica del código. **No aplica** para modificaciones visuales de estilos (CSS, SCSS, Tailwind, etc.).
- `refactor`: Reorganización de código sin corregir un error ni añadir funcionalidad.
- `perf`: Mejoras de rendimiento.
- `test`: Añade o corrige pruebas.
- `build`: Cambios que afectan el sistema de empaquetado o dependencias externas (ej. uv, pyproject.toml, package.json, pnpm-lock.yaml).
- `ci`: Cambios en la configuración de integración o despliegue continuo (CI/CD, GitHub Actions).
- `chore`: Tareas de mantenimiento o configuración general.

### Reglas Lingüísticas
- **Idioma Obligatorio**: Español.
- **Tiempo Verbal**: Pasado en tercera persona impersonal/reflexivo (ej. `se implementó inicio de sesión`, `se corrigió error en base de datos`). Nunca infinitivo ni imperativo.
- **Cuerpo**: Si existen múltiples cambios, enuméralos en una lista de viñetas en orden de mayor a menor relevancia.
