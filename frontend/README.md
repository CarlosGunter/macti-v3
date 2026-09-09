# 📚 MACTI Frontend

> 🎓 **M**ateriales didácticos para **A**nálisis **C**omputacional **T**écnico y **I**nvestigación

Una plataforma web moderna y dashboard centralizado construido con Next.js que consolida la administración de usuarios, la gestión de cursos y el flujo de aprendizaje de MACTI, ofreciendo soporte multitenant y acceso a materiales didácticos, simulaciones y cuadernos interactivos para cursos de Análisis Numérico y Ecuaciones Diferenciales.

---

## ✨ Tecnologías y Herramientas

- **Framework**: Next.js 16 (App Router)
- **UI & React**: React 19 y Tailwind CSS 4
- **Lenguaje**: TypeScript
- **Gestión de Estado**: Zustand
- **Peticiones y Servidor**: TanStack React Query
- **Autenticación**: Better Auth
- **Linter & Formateador**: Biome (más rápido y estricto que ESLint/Prettier)
- **Gestor de Paquetes**: [pnpm](https://pnpm.io/installation)

---

## 🏗️ Estructura del Proyecto

La estructura de código dentro del directorio `src/` está organizada de la siguiente manera:

```
src/
├── app/                    # App Router de Next.js (Rutas y vistas multitenant)
│   ├── [institute]/       # Rutas dinámicas basadas en el instituto
│   └── globals.css        # Estilos globales y tokens de Tailwind CSS v4
├── domains/               # Lógica y dominios de negocio (DDD)
│   ├── courses/          # Gestión y catálogo de cursos
│   ├── register/         # Solicitudes y registro de usuarios
│   └── users/            # Perfiles y administración de roles
├── infra/                 # Infraestructura, adaptadores y persistencia
│   ├── auth/             # Fábrica y cliente de Better Auth (OIDC Keycloak)
│   └── db/               # Persistencia de sesiones (PostgreSQL / SQLite)
├── assets/                # Recursos estáticos locales (logos institucionales)
└── shared/                # Código reutilizable y transversal
    ├── components/       # Componentes UI con identidad MACTI (common, feedback, ui)
    ├── shadcn/           # Primitivos atómicos y accesibles de Shadcn / Radix UI
    ├── config/           # Configuraciones y constantes globales
    ├── providers/        # Proveedores de contexto de React y React Query
    └── utils/            # Funciones auxiliares puras (processFetch, tryCatch)
```

---

## 🚀 Inicio Rápido

### Prerrequisitos

- **Node.js** >= 18.17.0
- [**pnpm**](https://pnpm.io/installation) (Gestor de paquetes obligatorio)

### 1. Instalar Dependencias
Se debe utilizar exclusivamente `pnpm` para la gestión de dependencias del frontend:
```bash
pnpm install
```

### 2. Ejecutar el Proyecto
Para iniciar el servidor de desarrollo local:
```bash
pnpm dev
```

El servidor estará corriendo en [http://127.0.0.1:3000/macti](http://127.0.0.1:3000/macti).

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

---

## 📚 Documentación Técnica Adicional

Para más detalles sobre los estándares y decisiones arquitectónicas, consulta las guías en el directorio `docs/`:
- 🏛️ [Arquitectura del Frontend](docs/arquitectura-frontend.md)
- 🌐 [Variables de Entorno](docs/variables-entorno.md)
- 🧩 [Guía de Creación y Uso de Componentes (Shared & Shadcn)](docs/guia-componentes-y-shadcn.md)
- 🌐 [Guía de Creación de Servicios y Validaciones](docs/guia-creacion-servicios.md)
- 🛠️ [Utilidades Compartidas (`tryCatch` y `processFetch`)](docs/utils.md)
- 🕒 [Autenticación OIDC y Base de Datos de Sesiones](docs/autenticacion-y-base-de-datos.md)
- 🛡️ [Middleware de Enrutamiento y Autenticación (`proxy.ts`)](docs/proxy.md)
- 🛣️ [Enrutamiento con Base Path (`NEXT_PUBLIC_BASE_PATH`)](docs/basepath.md)
- 🔄 [Pipeline de CI/CD y Despliegue en Kubernetes](docs/cicd-pipeline.md)
- 🐳 [Generación de Imágenes Docker](docs/generacion-imagenes.md)
- 📋 [Requerimientos del Frontend](docs/requerimientos-frontend.md)
