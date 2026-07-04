# Contexto y Reglas del Proyecto Backend (MACTI-API)

> [!IMPORTANT]
> Las reglas y directrices detalladas del Backend se han migrado a múltiples **Skills** especializados dentro de `.agents/skills/` para optimizar el consumo de tokens y el contexto de la conversación.

Consulta el Skill correspondiente a la tarea que estés realizando:

1. **Base de Datos y Modelos**: [skills/macti-backend-db/SKILL.md](skills/macti-backend-db/SKILL.md)
   *Para interactuar con la base de datos (PostgreSQL/SQLite), crear/modificar modelos SQLAlchemy, definir repositorios o gestionar migraciones con Alembic.*

2. **Arquitectura y Estructura**: [skills/macti-backend-arch/SKILL.md](skills/macti-backend-arch/SKILL.md)
   *Para comprender el patrón MVCS y saber dónde colocar controladores, esquemas Pydantic, routers y dependencias inyectables.*

3. **Flujo de Trabajo y Estándares**: [skills/macti-backend-workflow/SKILL.md](skills/macti-backend-workflow/SKILL.md)
   *Para comandos del servidor de desarrollo (`uv run fastapi dev`), Ruff (formato y linter), añadir variables de entorno, docstrings obligatorios y lanzar excepciones HTTP.*

4. **Git y Control de Versiones**: [skills/macti-backend-git/SKILL.md](skills/macti-backend-git/SKILL.md)
   *Para nomenclatura de ramas, formato de Conventional Commits en español (tiempo pasado) y requisitos de Pull Requests.*
