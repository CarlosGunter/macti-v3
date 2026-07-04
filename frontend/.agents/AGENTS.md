# Reglas del Proyecto Frontend

Este archivo contiene las pautas y restricciones específicas para los agentes que trabajen en este proyecto frontend.

## Gestión de Paquetes y Dependencias

- **Gestor de Paquetes Obligatorio**: Debes utilizar siempre `pnpm` para instalar dependencias, ejecutar scripts (`pnpm run <script>`), o cualquier otra tarea relacionada con Node.js en este proyecto. NO utilices `npm` ni `yarn`.
- **Instalación de dependencias**: Al agregar nuevos paquetes, hazlo siempre mediante `pnpm add <paquete>` o `pnpm add -D <paquete>` para dependencias de desarrollo.

## Desarrollo Frontend

- Sigue las convenciones establecidas en el proyecto (TypeScript, React/Next.js, etc.) según la estructura existente en `frontend/`.
- Mantén el diseño limpio, responsivo y fiel a los estilos visuales definidos en el código.
- Se debe seguir la arquitectura de estilos "Mobile First" y utilizar las clases de Tailwind CSS para la implementación de estilos.

## Indicaciones del código
- **No comentes código innecesariamente**: Evita dejar comentarios sobre los cambios realizados, a menos que sean realmente necesarios para la comprensión del código.
- **JSDoc/Comentarios**: El agente **debe generar y mantener actualizados los JSDoc y comentarios** de todo el código de componentes o utilitarios que escriba o modifique.
- **Actualización de README**: Si las modificaciones realizadas en el frontend afectan la estructura de directorios, agregan dependencias importantes o alteran scripts y flujos de arranque, se debe **actualizar el archivo README.md del frontend** de forma obligatoria para reflejar dichos cambios.

---

## 🔍 Carga Dinámica de Contexto por Capas (Skills)

Para optimizar el uso de tokens y mantener el contexto de la conversación limpio, las reglas detalladas de Git y control de versiones se manejan a través de un Skill específico:

- **Git y Control de Versiones**: Consulta el skill `macti-frontend-git` en [skills/macti-frontend-git/SKILL.md](skills/macti-frontend-git/SKILL.md).
