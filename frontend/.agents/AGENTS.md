# Reglas del Proyecto Frontend

Este archivo contiene las pautas y restricciones específicas para los agentes que trabajen en este proyecto frontend.

## Gestión de Paquetes y Dependencias

- **Gestor de Paquetes Obligatorio**: Debes utilizar siempre `pnpm` para instalar dependencias, ejecutar scripts (`pnpm run <script>`), o cualquier otra tarea relacionada con Node.js en este proyecto. NO utilices `npm` ni `yarn`.
- **Instalación de dependencias**: Al agregar nuevos paquetes, hazlo siempre mediante `pnpm add <paquete>` o `pnpm add -D <paquete>` para dependencias de desarrollo.

## Desarrollo Frontend

- Sigue las convenciones establecidas en el proyecto (TypeScript, React/Next.js, etc.) según la estructura existente en `frontend/`.
- Mantén el diseño limpio, responsivo y fiel a los estilos visuales definidos en el código.

## Indicaciones del código
- **No comentes código innecesariamente**: Evita dejar comentarios sobre los cambios realizados, a menos que sean realmente necesarios para la comprensión del código.
- **JSDoc/Comentarios**: El agente **debe generar y mantener actualizados los JSDoc y comentarios** de todo el código de componentes o utilitarios que escriba o modifique.
- **Actualización de README**: Si las modificaciones realizadas en el frontend afectan la estructura de directorios, agregan dependencias importantes o alteran scripts y flujos de arranque, se debe **actualizar el archivo README.md del frontend** de forma obligatoria para reflejar dichos cambios.

## 🔄 Git y Control de Versiones

### Convención de Mensajes de Confirmación (Conventional Commits)
Los mensajes de commit deben seguir una estructura clara y estandarizada:
- **Estructura**: `<tipo>(<alcance opcional>): <descripción>` seguida de un cuerpo y pie de página si es necesario.
- **Tipos de Commit permitidos**:
  - `feat`: Añade una nueva característica o funcionalidad.
  - `fix`: Resuelve un error o bug.
  - `docs`: Modifica o añade documentación.
  - `style`: Cambios de estilo y formato (espacios, formateo de código, punto y coma, etc.) sin afectar el comportamiento o semántica del código. Esto nunca aplica para cambios en los estilos visuales de la aplicación (CSS, SCSS, Tailwind, etc.).
  - `refactor`: Reorganización de código que no corrige un error ni añade funcionalidad.
  - `perf`: Mejoras de rendimiento.
  - `test`: Añade o corrige pruebas.
  - `build`: Cambios que afectan el sistema de empaquetado o dependencias externas (ej. configuraciones de pnpm).
  - `ci`: Cambios en la configuración de integración o despliegue continuo (CI/CD).
  - `chore`: Tareas de mantenimiento o configuración del proyecto.
- **Idioma**: Los mensajes de confirmación deben redactarse obligatoriamente en **español**.
- **Tiempo verbal**: La descripción debe estar redactada en **tiempo pasado** (ej. `feat: se implementó inicio de sesión`, `fix: se corrigió error en base de datos`).
- **Cuerpo del mensaje**: Si hay varios cambios importantes, enuméralos en el cuerpo del mensaje de confirmación, ordenándolos de **mayor a menor importancia**.

### Pull Requests (PRs)
- Al crear una PR, es obligatorio incluir una descripción clara, estructurada e informativa que detalle con precisión todos los cambios realizados en la rama y el propósito de los mismos.
