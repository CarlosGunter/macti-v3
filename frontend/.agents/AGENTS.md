# Reglas del Proyecto

Este archivo contiene las pautas y restricciones específicas para los agentes que trabajen en este proyecto frontend.

## Gestión de Paquetes y Dependencias

- **Gestor de Paquetes Obligatorio**: Debes utilizar siempre `pnpm` para instalar dependencias, ejecutar scripts (`pnpm run <script>`), o cualquier otra tarea relacionada con Node.js en este proyecto. NO utilices `npm` ni `yarn`.
- **Instalación de dependencias**: Al agregar nuevos paquetes, hazlo siempre mediante `pnpm add <paquete>` o `pnpm add -D <paquete>` para dependencias de desarrollo.

## Desarrollo Frontend

- Sigue las convenciones establecidas en el proyecto (TypeScript, React/Vite, etc.) según la estructura existente en `frontend/`.
- Mantén el diseño limpio, responsivo y fiel a los estilos visuales definidos en el código.

## Indicaciones del código
- **No comentes código innecesariamente**: Evita dejar comentarios sobre los cambios realizados, a menos que sean realmente necesarios para la comprensión del código.
- **Documentación**: Asegúrate de documentar y mantener actualizadas las funciones y componentes importantes, especialmente aquellos que forman parte de la API pública del proyecto. Utiliza comentarios JSDoc para funciones y componentes.

## Git y Control de Versiones
- **Utiliza conventional commits**: Sigue las convenciones de mensajes de commit para mantener un historial claro y comprensible.
- **PRs con Descripción Clara**: Al crear Pull Requests, proporciona una descripción detallada de los cambios realizados, incluyendo el propósito y cualquier contexto relevante.
