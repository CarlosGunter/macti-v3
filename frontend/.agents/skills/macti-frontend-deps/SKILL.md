---
name: macti-frontend-deps
description: Reglas de gestión de paquetes y dependencias en el Frontend mediante pnpm. Usa este skill cuando necesites instalar paquetes, actualizar dependencias o ejecutar scripts de npm/Node.js en el frontend.
---

# Gestión de Paquetes y Dependencias (Frontend)

Este skill define la herramienta autorizada y las directrices para manejar paquetes de dependencias de Node.js en el frontend.

## 🛠️ Gestor de Paquetes Obligatorio
- **Herramienta**: Debes utilizar **siempre** `pnpm`. Está estrictamente prohibido utilizar `npm` o `yarn`.
- **Instalar dependencias**:
  - Dependencias de producción: `pnpm add <nombre_paquete>`
  - Dependencias de desarrollo: `pnpm add -D <nombre_paquete>`
- **Ejecutar scripts**:
  - Para correr comandos del `package.json`, utiliza `pnpm run <script>` (o `pnpm <script>` si es soportado por pnpm).
