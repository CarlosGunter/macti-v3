---
name: macti-frontend-arch
description: Arquitectura de componentes React, TypeScript, Next.js, calidad de código y documentación JSDoc en el frontend. Usa este skill cuando crees o edites componentes visuales, páginas de Next.js, hooks, utilidades o escribas documentación JSDoc.
---

# Arquitectura, Estilo y Calidad de Código Frontend

Este skill documenta los principios de diseño de interfaz, arquitectura de componentes y reglas de documentación para la aplicación Frontend.

## 📐 Desarrollo y Estructura
- **Tecnologías principales**: TypeScript, React, Next.js.
- **Coherencia**: Sigue la estructura de directorios y organización de componentes establecida en [frontend/](../../..).
- **Diseño**: Mantén interfaces visuales limpias, totalmente responsivas y fieles al sistema de diseño definido en el proyecto.

## 📝 Documentación y Limpieza del Código
1. **JSDoc Mandatorio**: Genera y mantén actualizados los comentarios de JSDoc para todas las clases, funciones, componentes de React y utilitarios creados o modificados.
2. **Sin comentarios innecesarios**: Evita incluir explicaciones informales o redundantes en el código sobre los cambios que realizas. Prioriza el código autoexplicativo y JSDoc.
3. **Actualización de Documentación**: Si añades dependencias esenciales, modificas scripts de compilación, o cambias la estructura de carpetas, debes actualizar de forma mandatoria el archivo [README.md](../../../README.md) del frontend.
