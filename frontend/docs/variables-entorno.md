# 🌐 Variables de Entorno - MACTI Frontend

> **Framework**: Next.js 16 (App Router) | **Entornos**: Local (.env.local), Docker, Kubernetes | **Librería de Autenticación**: Better Auth | **Proveedor SSO**: Keycloak OIDC

---

## 📑 Tabla de Contenidos

1. [Introducción y Filosofía de Configuración](#1-📌-introducción-y-filosofía-de-configuración)
2. [Ciclo de Vida y Momentos de Inyección: Build-Time vs. Runtime](#2-⚙️-ciclo-de-vida-y-momentos-de-inyección-build-time-vs-runtime)
3. [Catálogo Completo de Variables de Entorno](#3-📊-catálogo-completo-de-variables-de-entorno)
   - [3.1 Enrutamiento, URLs Base y Proxy](#31-enrutamiento-urls-base-y-proxy)
   - [3.2 Persistencia y Base de Datos de Sesiones](#32-persistencia-y-base-de-datos-de-sesiones)
   - [3.3 Autenticación Global y Better Auth](#33-autenticación-global-y-better-auth)
   - [3.4 Multitenancy e Identidad Federada OIDC Keycloak](#34-multitenancy-e-identidad-federada-oidc-keycloak)
   - [3.5 Variables del Sistema y Operativas](#35-variables-del-sistema-y-operativas)
4. [Módulos del Sistema y Uso de Variables](#4-🏢-módulos-del-sistema-y-uso-de-variables)
5. [Guía de Configuración por Entornos](#5-🚀-guía-de-configuración-por-entornos)
   - [5.1 Desarrollo Local (.env.local)](#51-desarrollo-local-envlocal)
   - [5.2 Imagen Docker (Dockerfile)](#52-imagen-docker-dockerfile)
   - [5.3 Despliegue en Kubernetes (ConfigMap & Secret)](#53-despliegue-en-kubernetes-configmap--secret)
6. [Matriz de Trazabilidad y Relación con la Documentación Existente](#6-🔗-matriz-de-trazabilidad-y-relación-con-la-documentación-existente)
7. [Buenas Prácticas y Seguridad](#7-🛡️-buenas-prácticas-y-seguridad)

---

## 1. 📌 Introducción y Filosofía de Configuración

En el desarrollo de **MACTI**, la configuración del entorno sigue estrictamente las directrices del principio **The Twelve-Factor App (Factor III: Configuración en el Entorno)**. Toda la parametrización que varía entre entornos de ejecución (desarrollo local, pruebas, integración continua y clústeres de producción en Kubernetes) se almacena y administra mediante variables de entorno, manteniendo el código base completamente desacoplado y agnóstico a la infraestructura.

### Principios Fundamentales:

1. **Separación Estricta de Ámbitos (Cliente vs. Servidor)**:
   - **Variables Públicas de Cliente (`NEXT_PUBLIC_*`)**: Aquellas requeridas por el navegador web (ej. URL base pública, identificadores de cliente público OIDC).
   - **Variables Privadas de Servidor**: Credenciales, cadenas de conexión y secretos que **bajo ninguna circunstancia** deben transmitirse al navegador del usuario (ej. `DATABASE_URL`, secretos de cliente Keycloak, llaves criptográficas de sesión).
2. **Cero Secretos en el Control de Versiones**:
   - Los archivos de entorno reales (`.env`, `.env.local`, `.env.production`) están rigurosamente excluidos en el archivo `.gitignore`.
   - Se mantiene únicamente el archivo plantilla [`.env.example`](../.env.example) con valores demostrativos y descriptivos.
3. **Resiliencia y Fallbacks Predecibles**:
   - Para variables operativas no confidenciales, el código implementa valores predeterminados seguros (ej. `process.env.NEXT_PUBLIC_BASE_PATH ?? "/"`), previniendo fallos catastróficos por omisión.

---

## 2. ⚙️ Ciclo de Vida y Momentos de Inyección: Build-Time vs. Runtime

En aplicaciones creadas con **Next.js App Router**, existe una diferencia crítica en el momento en que las variables de entorno son resueltas y evaluadas:

```mermaid
flowchart TD
    subgraph BuildTime ["Momento de Compilación (Build-Time / pnpm build)"]
        DF["Dockerfile Stage: builder"]
        NP["Variables NEXT_PUBLIC_*"]
        NextBuild["Next.js Compiler (output: standalone)"]
        JSBundle["Bundles JS Estáticos del Cliente (public/.next/static)"]
        
        DF -->|Inyecta ENV| NP
        NP --> NextBuild
        NextBuild -->|Reemplaza process.env en código estático| JSBundle
    end

    subgraph RuntimeK8s ["Tiempo de Ejecución (Runtime / Pod K8s)"]
        K8sCM["ConfigMap (macti-frontend-config)"]
        K8sSec["Secret (macti-frontend-secrets)"]
        NodeServer["Node.js Standalone Server (server.js)"]
        ServerRSC["Server Components / Actions / Route Handlers"]
        
        K8sCM -->|Inyecta ENV| NodeServer
        K8sSec -->|Inyecta ENV| NodeServer
        NodeServer --> ServerRSC
    end

    subgraph ClientBrowser ["Navegador del Usuario (Client-Side)"]
        Browser["React 19 / Client Components ('use client')"]
        JSBundle -->|Descarga scripts con valores ya incrustados| Browser
    end

    ServerRSC -->|"Proxy HTTP (K8S_API_URL)"| Backend["Backend REST (FastAPI)"]
    ServerRSC -->|"Persistencia de sesión (DATABASE_URL)"| SessionDB["PostgreSQL de Sesiones"]
```

### 🔴 Variables de Cliente (Build-Time / Compilación)
* **Prefijo**: `NEXT_PUBLIC_*`.
* **Mecanismo**: Durante la ejecución de `pnpm build`, el compilador de Next.js busca todas las referencias a `process.env.NEXT_PUBLIC_*` y **reemplaza literalmente su valor en el código JavaScript compilado** enviado a los clientes.
* **Impacto en Docker**: Estas variables **deben estar presentes en la etapa de compilación (`builder` stage)** en el [Dockerfile](../Dockerfile). Configurarlas posteriormente en Kubernetes **no modificará el comportamiento del navegador**.

### 🟢 Variables de Servidor (Runtime / Ejecución)
* **Variables**: `K8S_API_URL`, `DATABASE_PROVIDER`, `DATABASE_URL`, `*_KEYCLOAK_CLIENT_SECRET`, `BETTER_AUTH_SECRET`.
* **Mecanismo**: Son leídas en tiempo real por el proceso de Node.js en el servidor a través del objeto global `process.env`.
* **Impacto en Docker / Kubernetes**: Pueden y deben suministrarse dinámicamente en producción mediante **ConfigMaps** y **Secrets** de Kubernetes sin necesidad de reconstruir la imagen Docker.

---

## 3. 📊 Catálogo Completo de Variables de Entorno

A continuación se detalla cada una de las variables utilizadas en el frontend de MACTI, organizadas por dominio técnico:

### 3.1 Enrutamiento, URLs Base y Proxy

| Variable | Ámbito | Requerida | Valor por Defecto / Ejemplo | Consumida en | Propósito Técnico |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_BASE_PATH` | Cliente / Servidor | Opcional | `"/macti"` (o `"/"`) | [`next.config.ts`](../next.config.ts), [`src/proxy.ts`](../src/proxy.ts), [`route.ts`](../src/app/api/proxy/[institute]/[[...path]]/route.ts), servicios de dominio | Prefijo base de la ruta donde se monta la aplicación bajo reverse proxies (ej. Ingress). Consulta la guía detallada en [Enrutamiento con Base Path (`basepath.md`)](./basepath.md). |
| `NEXT_PUBLIC_APP_URL` | Cliente / Servidor | **Sí** | `https://tlapoa.lamod.unam.mx/macti` | [`auth-client.ts`](../src/infra/auth/auth-client.ts), [`auth-factory.ts`](../src/infra/auth/auth-factory.ts), [`LoginButton.tsx`](../src/shared/components/ui/LoginButton.tsx) | URL pública absoluta de la aplicación frontend, utilizada para armar endpoints proxy y callbacks OIDC. |
| `NEXT_PUBLIC_API_URL` | Cliente | Opcional | `"/macti-api"` o `http://localhost:8000` | [`fetchCoursesClient.ts`](../src/domains/register/services/fetchCoursesClient.ts) | URL accesible por el navegador para peticiones que consumen la API directamente sin pasar por el BFF. |
| `K8S_API_URL` | Servidor | **Sí** (Runtime) | `http://macti-backend-service:8000` | [`route.ts`](../src/app/api/proxy/[institute]/[[...path]]/route.ts), [`fetchCoursesServer.ts`](../src/domains/courses/services/fetchCoursesServer.ts), servicios de registro | URL del servicio interno de Backend (FastAPI) en el clúster o red local, resuelta por Server Components y Proxy. |

#### 🔀 Comparativa Crítica: `K8S_API_URL` vs. `NEXT_PUBLIC_APP_URL` vs. `NEXT_PUBLIC_API_URL`

Existe una distinción esencial de red y arquitectura entre las diferentes variables que definen URLs hacia la API y la aplicación:

```mermaid
flowchart TD
    subgraph Browser ["Navegador Web (Red Pública / Internet)"]
        User["Usuario / Client Component"]
    end

    subgraph K8sCluster ["Clúster de Kubernetes (Red Interna Privada)"]
        Ingress["Ingress Nginx Controller"]
        
        subgraph PodFrontend ["Pod: Next.js Frontend"]
            NextServer["Servidor Node.js (BFF / Route Handlers / RSC)"]
        end
        
        subgraph PodBackend ["Pod: FastAPI Backend"]
            FastAPIService["Servicio K8s: macti-backend-service:8000"]
        end
    end

    User -->|"1. Petición HTTP pública vía BFF<br/>`${basePath}/api/proxy/${institute}/...`"| Ingress
    Ingress --> NextServer
    NextServer -->|"2. Reenvío interno en clúster<br/>`${process.env.K8S_API_URL}/...`"| FastAPIService
    
    User -.->|"3. Consulta directa sin BFF (si aplica)<br/>`${process.env.NEXT_PUBLIC_API_URL}/courses`"| Ingress
    Ingress -.-> FastAPIService
```

| Criterio | `K8S_API_URL` | `NEXT_PUBLIC_APP_URL` | `NEXT_PUBLIC_API_URL` |
|---|---|---|---|
| **¿Quién lo consume?** | **Exclusivamente el Servidor Node.js** (Server Components, Route Handlers del proxy BFF y Server Actions). | **Cliente y Servidor** (Navegador, Better Auth Client, SDK de autenticación). | **Cliente** (Navegador en peticiones directas no autenticadas o libres de proxy). |
| **Resolución DNS** | **Red interna de Kubernetes** (`.cluster.local`) o red de Docker (`http://backend:8000`). | **DNS Público en Internet** (`https://tlapoa.lamod.unam.mx/macti`). | **Ruta relativa pública o dominio externo** (`/macti-api` o `https://tlapoa.lamod.unam.mx/macti-api`). |
| **¿Qué pasa si el navegador intenta usarlo?** | **Error fatal `ERR_NAME_NOT_RESOLVED`**. El clúster interno no es accesible desde internet ni desde la máquina del usuario final. | Funciona correctamente, es la URL pública canónica donde corre el frontend. | Funciona si la API está expuesta públicamente en el Ingress/Reverse Proxy. |
| **Seguridad de Tokens** | **Máxima (BFF)**: Node.js inyecta el `Bearer <Keycloak_Token>` extraído de la base de datos de sesiones en el servidor sin exponerlo al navegador. | **Máxima**: Solo transporta cookies `HttpOnly` y `Secure`. | No lleva tokens de sesión administrados por Better Auth. |

---

### 3.2 Persistencia y Base de Datos de Sesiones

> [!IMPORTANT]
> Esta base de datos es utilizada **exclusivamente por Better Auth para persistir sesiones y tokens**. El frontend no almacena ningún dato de lógica de negocio (cursos, materias, etc.).

| Variable | Ámbito | Requerida | Valor por Defecto / Ejemplo | Consumida en | Propósito Técnico |
|---|---|---|---|---|---|
| `DATABASE_PROVIDER` | Servidor | **Sí** | `"sqlite"` \| `"postgres"` | [`db-factory.ts`](../src/infra/db/db-factory.ts) | Selector de driver de base de datos para la factoría de sesiones (`sqlite` en local, `postgres` en Kubernetes). |
| `DATABASE_URL` | Servidor | **Sí** | Local: `"@/../data/auth.sqlite"`<br>Prod: `"postgresql://user:pass@host:5432/macti_auth"` | [`sqlite.ts`](../src/infra/db/sqlite/sqlite.ts), [`postgres.ts`](../src/infra/db/postgres/postgres.ts) | Ruta al archivo local SQLite o cadena de conexión completa (URI) para el pool de PostgreSQL. |

---

### 3.3 Autenticación Global y Better Auth

| Variable | Ámbito | Requerida | Valor por Defecto / Ejemplo | Consumida en | Propósito Técnico |
|---|---|---|---|---|---|
| `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` | Cliente / Servidor | **Sí** | `"next-login"` (o `"local-next-login"`) | [`kcConfig.ts`](../src/shared/config/kcConfig.ts), [`auth-session.ts`](../src/infra/auth/auth-session.ts) | Identificador de cliente estándar registrado en Keycloak para la aplicación frontend. |
| `BETTER_AUTH_SECRET` | Servidor | **Sí** (Prod) | Clave criptográfica aleatoria de 32+ bytes | Motor de Better Auth | Secreto simétrico para la firma y cifrado de tokens de sesión y cookies seguras. |
| `BETTER_AUTH_URL` | Servidor | Opcional | `${NEXT_PUBLIC_APP_URL}` | Motor de Better Auth | URL base interna de Better Auth para resolución de endpoints de autenticación. |

> [!CAUTION]
> **Importancia Crítica de `BETTER_AUTH_SECRET` en Producción**:
> Si `BETTER_AUTH_SECRET` no se provee en el Secret de Kubernetes, Better Auth generará una clave efímera aleatoria en memoria al arrancar cada Pod. Esto provocará que **en clústeres con múltiples réplicas (multi-pod) los usuarios sean deslogueados aleatoriamente** al saltar entre pods balanceados, y que **cualquier reinicio o actualización desloguee a todos los usuarios activos del sistema**. Consulta más detalles en [Autenticación OIDC y BD de Sesiones](./autenticacion-y-base-de-datos.md#e-importancia-crítica-de-better_auth_secret-en-producción-y-clústeres-multi-pod).

---

### 3.4 Multitenancy e Identidad Federada OIDC Keycloak

MACTI soporta arquitectura **multitenant por facultad e instituto** (`InstitutesType`). Cada institución cuenta con su propio *Realm* o configuración OIDC en [`src/shared/config/kcConfig.ts`](../src/shared/config/kcConfig.ts):

| Instituto (`id`) | Variable de Issuer (`NEXT_PUBLIC_*`) | Variable de Secreto (`Servidor / Privada`) | Ámbito de Uso |
|---|---|---|---|
| `principal` | `NEXT_PUBLIC_PRINCIPAL_KEYCLOAK_ISSUER` | `PRINCIPAL_KEYCLOAK_CLIENT_SECRET` | Realm central / Administrativo |
| `cuantico` | `NEXT_PUBLIC_CUANTICO_KEYCLOAK_ISSUER` | `CUANTICO_KEYCLOAK_CLIENT_SECRET` | Dominio Cuántico |
| `ciencias` | `NEXT_PUBLIC_CIENCIAS_KEYCLOAK_ISSUER` | `CIENCIAS_KEYCLOAK_CLIENT_SECRET` | Facultad de Ciencias (UNAM) |
| `ingenieria` | `NEXT_PUBLIC_INGENIERIA_KEYCLOAK_ISSUER` | `INGENIERIA_KEYCLOAK_CLIENT_SECRET` | Facultad de Ingeniería (UNAM) |
| `encit` | `NEXT_PUBLIC_ENCIT_KEYCLOAK_ISSUER` | `ENCIT_KEYCLOAK_CLIENT_SECRET` | Escuela Nacional de Ciencias de la Tierra |
| `ier` | `NEXT_PUBLIC_IER_KEYCLOAK_ISSUER` | `IER_KEYCLOAK_CLIENT_SECRET` | Instituto de Energías Renovables |
| `enes_m` | `NEXT_PUBLIC_ENES_M_KEYCLOAK_ISSUER` | `ENES_M_KEYCLOAK_CLIENT_SECRET` | ENES Unidad Morelia |
| `hpc` | `NEXT_PUBLIC_HPC_KEYCLOAK_ISSUER` | `HPC_KEYCLOAK_CLIENT_SECRET` | Cómputo de Alto Rendimiento (HPC) |
| `igf` | `NEXT_PUBLIC_IGF_KEYCLOAK_ISSUER` | `IGF_KEYCLOAK_CLIENT_SECRET` | Instituto de Geofísica |
| `enes_jur` | `NEXT_PUBLIC_ENES_JUR_KEYCLOAK_ISSUER` | `ENES_JUR_KEYCLOAK_CLIENT_SECRET` | ENES Unidad Juriquilla |

> [!CAUTION]
> **Seguridad de Secretos OIDC**:
> Las variables `<INSTITUTO>_KEYCLOAK_CLIENT_SECRET` nunca llevan el prefijo `NEXT_PUBLIC_`. Solo deben existir en el servidor para el intercambio confidencial del código de autorización por tokens de acceso.

---

### 3.5 Variables del Sistema y Operativas

| Variable | Ámbito | Valor por Defecto | Propósito Técnico |
|---|---|---|---|
| `NODE_ENV` | Build / Runtime | `"development"` \| `"production"` | Determina optimizaciones de Next.js, minificación de código y manejo de errores. |
| `PORT` | Runtime | `3000` | Puerto TCP en el que escucha el servidor Node.js standalone. |
| `HOSTNAME` | Runtime | `"0.0.0.0"` | Dirección de interfaz de red para aceptar tráfico entrante en contenedores. |
| `NEXT_TELEMETRY_DISABLED`| Build / Runtime | `"1"` | Deshabilita el envío de métricas de telemetría hacia Vercel en entornos Docker/CI. |
| `NEXT_PHASE` | Build / Interna | Evaluada por Next.js (`PHASE_PRODUCTION_BUILD`) | Detecta la fase de compilación en [`auth-factory.ts`](../src/infra/auth/auth-factory.ts) y [`auth-client.ts`](../src/infra/auth/auth-client.ts) para devolver instancias seguras sin conexión a BD. |

---

## 4. 🏢 Módulos del Sistema y Uso de Variables

```mermaid
graph LR
    subgraph InfraAuth ["src/infra/auth & kcConfig"]
        kcConfig["kcConfig.ts"]
        authFactory["auth-factory.ts"]
        authClient["auth-client.ts"]
        authSession["auth-session.ts"]
    end

    subgraph InfraDb ["src/infra/db"]
        dbFactory["db-factory.ts"]
        postgres["postgres.ts"]
        sqlite["sqlite.ts"]
    end

    subgraph ProxyApp ["src/proxy.ts & app/api/proxy"]
        proxyMW["proxy.ts (Middleware)"]
        proxyRoute["route.ts (Reverse Proxy BFF)"]
    end

    subgraph DomainServ ["src/domains/*/services"]
        servServer["Servicios de Servidor"]
        servClient["Servicios de Cliente"]
    end

    ENV_KC["NEXT_PUBLIC_*_ISSUER<br/>*_CLIENT_SECRET<br/>NEXT_PUBLIC_KEYCLOAK_CLIENT_ID"] --> kcConfig
    ENV_URL["NEXT_PUBLIC_APP_URL<br/>NEXT_PUBLIC_BASE_PATH"] --> authClient
    ENV_URL --> authFactory
    ENV_URL --> authSession
    ENV_URL --> proxyMW
    ENV_URL --> proxyRoute

    ENV_DB["DATABASE_PROVIDER<br/>DATABASE_URL"] --> dbFactory
    dbFactory --> postgres
    dbFactory --> sqlite

    ENV_K8S["K8S_API_URL"] --> proxyRoute
    ENV_K8S --> servServer
    ENV_API["NEXT_PUBLIC_API_URL"] --> servClient
```

1. **Proxy y BFF (`src/proxy.ts` y `src/app/api/proxy/[institute]/[[...path]]/route.ts`)**:
   - `NEXT_PUBLIC_BASE_PATH` calcula la ruta base para redirigir tras un login o logout.
   - `NEXT_PUBLIC_APP_URL` reconstruye las URLs completas recibidas en las cabeceras de Next.js.
   - `K8S_API_URL` especifica el destino de reenvío de peticiones autorizadas con token Bearer.
2. **Infraestructura de Autenticación (`src/infra/auth`)**:
   - `kcConfig.ts` mapea de forma reactiva las variables OIDC por instituto.
   - `auth-session.ts` consume `NEXT_PUBLIC_KEYCLOAK_CLIENT_ID` y `NEXT_PUBLIC_BASE_PATH` para orquestar el cierre de sesión federado en Keycloak (*Federated Logout*).
3. **Persistencia de Sesiones (`src/infra/db`)**:
   - `db-factory.ts` discrimina el proveedor mediante `DATABASE_PROVIDER`.
   - `sqlite.ts` o `postgres.ts` establecen la conexión usando `DATABASE_URL`.

---

## 5. 🚀 Guía de Configuración por Entornos

### 5.1 Desarrollo Local (`.env.local`)

Crea un archivo `.env.local` en la raíz de `frontend/` a partir de esta plantilla:

```bash
# ==============================================================================
# ENTORNO DE DESARROLLO LOCAL MACTI (frontend/.env.local)
# ==============================================================================
NODE_ENV=development

# --- Base de Datos de Sesiones (SQLite local para máxima agilidad DX) ---
DATABASE_PROVIDER=sqlite
DATABASE_URL=./data/auth.sqlite

# --- Enrutamiento y URLs Base ---
NEXT_PUBLIC_BASE_PATH=/macti
NEXT_PUBLIC_APP_URL=http://localhost:3000/macti
NEXT_PUBLIC_API_URL=http://localhost:8000
K8S_API_URL=http://localhost:8000

# --- Better Auth ---
BETTER_AUTH_SECRET=desarrollo_local_secreto_aleatorio_32_caracteres_minimo_123
BETTER_AUTH_URL=http://localhost:3000/macti

# --- Cliente OIDC Global Keycloak ---
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=local-next-login

# --- Institutos OIDC (Issuers y Secrets de Desarrollo) ---
PRINCIPAL_KEYCLOAK_CLIENT_SECRET=secreto_local_principal
NEXT_PUBLIC_PRINCIPAL_KEYCLOAK_ISSUER=https://sso.lamod.unam.mx/auth/realms/macti3dev

CUANTICO_KEYCLOAK_CLIENT_SECRET=secreto_local_cuantico
NEXT_PUBLIC_CUANTICO_KEYCLOAK_ISSUER=https://sso.lamod.unam.mx/auth/realms/cuantico

CIENCIAS_KEYCLOAK_CLIENT_SECRET=secreto_local_ciencias
NEXT_PUBLIC_CIENCIAS_KEYCLOAK_ISSUER=https://sso.lamod.unam.mx/auth/realms/ciencias

INGENIERIA_KEYCLOAK_CLIENT_SECRET=secreto_local_ingenieria
NEXT_PUBLIC_INGENIERIA_KEYCLOAK_ISSUER=https://sso.lamod.unam.mx/auth/realms/ingenieria

ENCIT_KEYCLOAK_CLIENT_SECRET=secreto_local_encit
NEXT_PUBLIC_ENCIT_KEYCLOAK_ISSUER=https://sso.lamod.unam.mx/auth/realms/encit

IER_KEYCLOAK_CLIENT_SECRET=secreto_local_ier
NEXT_PUBLIC_IER_KEYCLOAK_ISSUER=https://sso.lamod.unam.mx/auth/realms/ier

ENES_M_KEYCLOAK_CLIENT_SECRET=secreto_local_enes_m
NEXT_PUBLIC_ENES_M_KEYCLOAK_ISSUER=https://sso.lamod.unam.mx/auth/realms/enes-m

HPC_KEYCLOAK_CLIENT_SECRET=secreto_local_hpc
NEXT_PUBLIC_HPC_KEYCLOAK_ISSUER=https://sso.lamod.unam.mx/auth/realms/hpc

IGF_KEYCLOAK_CLIENT_SECRET=secreto_local_igf
NEXT_PUBLIC_IGF_KEYCLOAK_ISSUER=https://sso.lamod.unam.mx/auth/realms/igf

ENES_JUR_KEYCLOAK_CLIENT_SECRET=secreto_local_enes_jur
NEXT_PUBLIC_ENES_JUR_KEYCLOAK_ISSUER=https://sso.lamod.unam.mx/auth/realms/enes-jur
```

---

### 5.2 Imagen Docker (`Dockerfile`)

En el [Dockerfile](../Dockerfile), las variables `NEXT_PUBLIC_*` requeridas durante la compilación estática se declaran dentro de la etapa `builder`:

```dockerfile
# ============================================
# Stage 2: Build Next.js application in standalone mode
# ============================================
FROM node:${NODE_VERSION} AS builder
    WORKDIR /app
    COPY --from=dependencies /app/node_modules ./node_modules
    COPY . .

    ENV NEXT_TELEMETRY_DISABLED=1
    ENV NODE_ENV=production

    # Variables públicas requeridas en compilación
    ENV NEXT_PUBLIC_BASE_PATH=/macti
    ENV NEXT_PUBLIC_APP_URL=https://tlapoa.lamod.unam.mx/macti
    ENV NEXT_PUBLIC_API_URL=/macti-api
    ENV NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=next-login
    ENV NEXT_PUBLIC_PRINCIPAL_KEYCLOAK_ISSUER=https://sso.lamod.unam.mx/auth/realms/macti3dev
    ENV K8S_API_URL=https://tlapoa.lamod.unam.mx/macti-api

    RUN corepack enable pnpm && pnpm build;
```

---

### 5.3 Despliegue en Kubernetes (ConfigMap & Secret)

En el clúster de Kubernetes, el servidor Node.js standalone recibe las variables de runtime mediante desacoplamiento en ConfigMaps y Secrets:

#### A. ConfigMap (`macti-frontend-config.yaml`)
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: macti-frontend-config
  namespace: macti-prod
data:
  NODE_ENV: "production"
  PORT: "3000"
  HOSTNAME: "0.0.0.0"
  DATABASE_PROVIDER: "postgres"
  K8S_API_URL: "http://macti-backend-service.macti-prod.svc.cluster.local:8000"
```

#### B. Secret (`macti-frontend-secrets.yaml`)
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: macti-frontend-secrets
  namespace: macti-prod
type: Opaque
stringData:
  BETTER_AUTH_SECRET: "clave_super_segura_de_produccion_32_bytes"
  DATABASE_URL: "postgresql://macti_user:SuperPasswordSeguro@postgres-service.macti-prod.svc.cluster.local:5432/macti_sessions"
  PRINCIPAL_KEYCLOAK_CLIENT_SECRET: "secreto_prod_principal"
  CIENCIAS_KEYCLOAK_CLIENT_SECRET: "secreto_prod_ciencias"
  INGENIERIA_KEYCLOAK_CLIENT_SECRET: "secreto_prod_ingenieria"
  # ... resto de secretos institucionales
```

---

## 6. 🔗 Matriz de Trazabilidad y Relación con la Documentación Existente

A continuación se detalla cómo las variables de entorno se interconectan e impactan en cada una de las documentaciones técnicas del proyecto:

| Documentación | Variables Relevantes | Naturaleza de la Relación e Impacto Técnico |
|---|---|---|
| 🏛️ [Arquitectura del Frontend](./arquitectura-frontend.md) | `DATABASE_PROVIDER`, `DATABASE_URL`, `NEXT_PUBLIC_BASE_PATH`, `NEXT_PUBLIC_APP_URL`, `K8S_API_URL` | Define la separación de capas DDD. Las variables delimitan la frontera entre la persistencia de sesiones de Better Auth (`DATABASE_*`) y la API externa de negocio (`K8S_API_URL`), así como el enrutamiento multitenant (`NEXT_PUBLIC_BASE_PATH`). |
| 🔐 [Autenticación OIDC y Base de Datos](./autenticacion-y-base-de-datos.md) | `DATABASE_PROVIDER`, `DATABASE_URL`, `NEXT_PUBLIC_*_ISSUER`, `*_KEYCLOAK_CLIENT_SECRET`, `BETTER_AUTH_SECRET` | Rige la fábrica `auth-factory.ts`, la selección de driver en `db-factory.ts` (SQLite vs PostgreSQL) y el aislamiento de sesiones por instituto con cookies seguras. |
| 🛡️ [Middleware Proxy (`proxy.ts`)](./proxy.md) | `NEXT_PUBLIC_BASE_PATH`, `NEXT_PUBLIC_APP_URL`, `K8S_API_URL`, `DATABASE_PROVIDER` | `proxy.ts` y su route handler utilizan estas variables para computar los `callbackURL`, proteger rutas privadas y redirigir peticiones hacia la API interna o Keycloak. |
| 🔄 [Pipeline de CI/CD](./cicd-pipeline.md) | `NEXT_PUBLIC_*`, `NODE_VERSION`, `REGISTRY`, `IMAGE_NAME`, Secrets de GitHub | Explica cómo GitHub Actions valida el código (`Biome`), compila en Docker incrustando las variables `NEXT_PUBLIC_*` y publica imágenes inmutables en GHCR. |
| 🐳 [Generación de Imágenes Docker](./generacion-imagenes.md) | `NEXT_PUBLIC_*`, `NODE_ENV`, `PORT`, `HOSTNAME`, `NEXT_TELEMETRY_DISABLED` | Especifica la regla mandatoria de declarar las variables `NEXT_PUBLIC_*` en la etapa `builder` del Dockerfile antes de `pnpm build`, y las variables del runner en el contenedor final. |
| 🌐 [Guía de Creación de Servicios](./guia-creacion-servicios.md) | `K8S_API_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_BASE_PATH` | Guía la elección de la URL base según el tipo de servicio: servicios de servidor consumen `K8S_API_URL`, mientras que servicios de cliente consumen `NEXT_PUBLIC_BASE_PATH` o `NEXT_PUBLIC_API_URL`. |
| 🛠️ [Utilidades Compartidas (`utils.md`)](./utils.md) | `K8S_API_URL`, `NEXT_PUBLIC_APP_URL` | `processFetch` y `tryCatch` procesan las peticiones HTTP construidas a partir de estas variables, manejando fallas de conexión o respuestas de error de red. |
| 🧩 [Guía de Componentes y Shadcn UI](./guia-componentes-y-shadcn.md) | `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_BASE_PATH` | Los componentes de UI interactivos (ej. `LoginButton`, `LoginInCardButton`, barras de navegación) emplean estas variables para construir enlaces de retorno y botones de acción OIDC. |
| 🛣️ [Enrutamiento con Base Path](./basepath.md) | `NEXT_PUBLIC_BASE_PATH`, `NEXT_PUBLIC_APP_URL` | Documenta los gotchas de `nextUrl.pathname`, por qué se concatena manualmente en callbacks de Keycloak y la diferencia entre `<Link>` y `window.location`. |
| 📋 [Requerimientos Frontend](./requerimientos-frontend.md) | `NEXT_PUBLIC_*`, `BETTER_AUTH_SECRET`, `*_KEYCLOAK_CLIENT_SECRET` | Respalda el cumplimiento de requerimientos de seguridad (**RNF-03**: manejo de cookies HttpOnly y protección de tokens) y requerimientos funcionales multitenant (**RF-01**, **RF-05**). |

---

## 7. 🛡️ Buenas Prácticas y Seguridad

1. **Jamás Exponer Secretos con Prefijo Público**:
   - Nunca agregues `NEXT_PUBLIC_` a secretos de base de datos, llaves privadas ni `CLIENT_SECRET` de Keycloak. Cualquier variable con ese prefijo se hace visible a cualquier usuario que inspeccione el código fuente en el navegador.
2. **Definir `BETTER_AUTH_SECRET` con Alta Entropía en Producción**:
   - En Kubernetes, genera un secreto fijo de 32+ caracteres (`openssl rand -base64 32`) e inyéctalo a través de `macti-frontend-secrets.yaml` para evitar que múltiples réplicas invaliden sesiones entre sí.
3. **Uso de Ingress y Reverse Proxy con `basePath`**:
   - Si la aplicación opera bajo un subdirectorio como `/macti`, asegúrate de que `NEXT_PUBLIC_BASE_PATH=/macti` y `NEXT_PUBLIC_APP_URL` reflejen exactamente la URL externa accesible para evitar redirecciones circulares en OAuth.
4. **Consistencia de Nomenclatura**:
   - Respeta escrupulosamente los nombres definidos en [`src/shared/config/kcConfig.ts`](../src/shared/config/kcConfig.ts) (ej. `INGENIERIA` y no `INGENEIRIA`, `ENES_M` y no `ENESM`, `ENES_JUR` y no `ENESJUR`).
5. **Verificación en CI/CD**:
   - Antes de enviar cambios al repositorio, comprueba que ninguna variable sensible haya sido hardcodeada en el código fuente ejecutando `pnpm lint`.
