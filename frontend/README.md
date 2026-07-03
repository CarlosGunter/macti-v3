# 📚 MACTI Frontend

> 🎓 **M**ateriales didácticos para **A**nálisis **C**omputacional **T**écnico y **I**nvestigación

Una plataforma educativa moderna construida con Next.js que alberga materiales didácticos, haciendo énfasis en ejemplos prácticos y aplicaciones de conceptos abstractos para cursos semestrales de Análisis Numérico y Ecuaciones Diferenciales.

## ✨ Características

- 🚀 **Next.js 15.5.3** - Framework React de última generación
- ⚡ **React 19** - UI declarativa y eficiente
- 🎨 **Tailwind CSS 4** - Estilos utilitarios modernos
- 📝 **TypeScript** - Tipado estático para mayor robustez
- 🔧 **ESLint** - Linting y análisis de código
- 📦 **pnpm** - Gestor de paquetes rápido y eficiente

## 🏗️ Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── [institute]/       # Rutas dinámicas por instituto
│   └── globals.css        # Estilos globales
├── domains/               # Dominios de negocio
│   ├── auth/             # Autenticación
│   └── home/             # Página principal
├── assets/               # Recursos estáticos
│   ├── image/           # Imágenes
│   └── logos/           # Logotipos
├── shared/              # Código compartido
│   ├── components/      # Componentes reutilizables
│   ├── config/         # Configuraciones
│   └── services/       # Servicios
└── lib/                # Utilidades y helpers
```

## 🚀 Inicio Rápido

### 📋 Prerrequisitos

- **Node.js** >= 18.17.0
- **pnpm** (recomendado) o npm

### 📦 Instalación de pnpm

Si no tienes pnpm instalado, puedes instalarlo de las siguientes maneras:

```powershell
# Usando npm
npm install -g pnpm

```
O visita la guía oficial completa: https://pnpm.io/installation

### 🔧 Instalación del Proyecto

1. **Clona el repositorio**
   ```powershell
   git clone https://github.com/CarlosGunter/macti-frontend
   cd macti-frontend
   ```

2. **Instala las dependencias**
   ```powershell
   pnpm install
   ```

3. **Inicia el servidor de desarrollo**
   ```powershell
   pnpm dev
   ```

4. **¡Abre tu navegador!** 🌐
   
   Visita [http://localhost:3000](http://localhost:3000) para ver la aplicación en funcionamiento.

## 📜 Scripts Disponibles

| Script | Descripción | Comando |
|--------|-------------|---------|
| 🔥 **dev** | Inicia el servidor de desarrollo | `pnpm dev` |
| 🏗️ **build** | Construye la aplicación para producción | `pnpm build` |
| 🚀 **start** | Inicia el servidor de producción | `pnpm start` |
| 🔍 **lint** | Ejecuta el linter de código | `pnpm lint` |
