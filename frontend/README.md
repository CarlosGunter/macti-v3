# 📚 MACTI Frontend

> 🎓 **M**ateriales didácticos para **A**nálisis **C**omputacional **T**écnico y **I**nvestigación

Una plataforma educativa moderna construida con Next.js que alberga materiales didácticos, haciendo énfasis en ejemplos prácticos y aplicaciones de conceptos abstractos para cursos semestrales de Análisis Numérico y Ecuaciones Diferenciales.

---

## ✨ Tecnologías y Herramientas

- **Framework**: Next.js 16 (App Router)
- **UI & React**: React 19 y Tailwind CSS 4
- **Lenguaje**: TypeScript
- **Gestión de Estado**: Zustand
- **Peticiones y Servidor**: TanStack React Query
- **Autenticación**: Better Auth
- **Linter & Formateador**: Biome (más rápido y estricto que ESLint/Prettier)
- **Gestor de Paquetes**: pnpm

---

## 🏗️ Estructura del Proyecto

La estructura de código dentro del directorio `src/` está organizada de la siguiente manera:

```
src/
├── app/                    # App Router de Next.js (Rutas y vistas)
│   ├── [institute]/       # Rutas dinámicas basadas en el instituto
│   └── globals.css        # Estilos globales y Tailwind CSS
├── domains/               # Lógica y dominios de negocio
│   ├── auth/             # Módulo de autenticación y lógica asociada
│   └── home/             # Componentes y lógica de la página de inicio
├── assets/               # Recursos estáticos locales
│   ├── image/           # Imágenes generales
│   └── logos/           # Logotipos institucionales
├── shared/              # Código reutilizable y compartido
│   ├── components/      # Componentes UI reutilizables (shadcn/radix)
│   ├── config/         # Configuraciones globales
│   └── services/       # Clientes de APIs y llamadas de red
└── lib/                # Utilidades, clases helpers y formateadores
```

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** >= 18.17.0
- **pnpm** (Gestor de paquetes obligatorio)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/CarlosGunter/macti-monorepo
cd macti-monorepo/frontend
```

### 2. Instalar Dependencias
Se debe utilizar exclusivamente `pnpm` para la gestión de dependencias del frontend:
```bash
pnpm install
```

### 3. Ejecutar el Proyecto
Para iniciar el servidor de desarrollo local:
```bash
pnpm dev
```

El servidor estará corriendo en [http://localhost:3000](http://localhost:3000).

---

## 📜 Scripts Disponibles

| Script | Descripción | Comando |
|--------|-------------|---------|
| `dev` | Inicia el servidor de desarrollo | `pnpm dev` |
| `build` | Compila la aplicación optimizada para producción | `pnpm build` |
| `start` | Inicia el servidor de Next.js en producción | `pnpm start` |
| `lint` | Ejecuta Biome para analizar y formatear el código | `pnpm lint` |

---

## 🔧 Desarrollo y Reglas de Calidad

Cualquier cambio realizado en este repositorio debe respetar las directivas especificadas en [frontend/.agents/AGENTS.md](.agents/AGENTS.md):
- **Docstrings & Comentarios**: Es mandatorio documentar componentes y funciones importantes utilizando JSDoc.
- **Formateo**: Ejecuta `pnpm lint` antes de realizar tus confirmaciones para corregir el estilo del código con Biome.
- **Mensajes de Commit**: Deben redactarse obligatoriamente en **español**, en **tiempo pasado** y seguir la convención de **Conventional Commits** sin omitir detalles de los cambios realizados.
