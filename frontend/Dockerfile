# ============================================
# Stage 1: Dependencies Installation Stage
# ============================================
ARG NODE_VERSION=24.17.0-slim
FROM node:${NODE_VERSION} AS dependencies

    WORKDIR /app

    COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./

    # Optimizador: Se monta el almacén virtual de pnpm de forma nativa en la caché de Docker.
    RUN --mount=type=cache,target=/root/.local/share/pnpm/store \
        corepack enable pnpm && pnpm install --frozen-lockfile;

# ============================================
# Stage 2: Build Next.js application in standalone mode
# ============================================
FROM node:${NODE_VERSION} AS builder

    # Set working directory
    WORKDIR /app

    # Copy project dependencies from dependencies stage
    COPY --from=dependencies /app/node_modules ./node_modules

    COPY . .

    ENV NEXT_TELEMETRY_DISABLED=1
    ENV NODE_ENV=production

    # Variables de entorno internas necesarias para la construcción.
    ENV NODE_ENV=production
    ENV NEXT_PUBLIC_BASE_PATH=/macti
    ENV NEXT_PUBLIC_APP_URL=https://tlapoa.lamod.unam.mx/macti
    # Si la API se encuentra en el mismo dominio, es posible usar la ruta relativa.
    ENV NEXT_PUBLIC_API_URL=/macti-api
    ENV NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=next-login
    ENV NEXT_PUBLIC_PRINCIPAL_KEYCLOAK_ISSUER=https://sso.lamod.unam.mx/auth/realms/macti3dev
    # Solo para la construcción. Se sobreescribirá en tiempo de ejecución.
    ENV K8S_API_URL=https://tlapoa.lamod.unam.mx/macti-api

    RUN corepack enable pnpm && pnpm build;

# ============================================
# Stage 3: Run Next.js application
# ============================================
FROM node:${NODE_VERSION} AS runner

    # Set working directory
    WORKDIR /app

    # Set production environment variables
    ENV NODE_ENV=production
    ENV PORT=3000
    ENV HOSTNAME="0.0.0.0"
    ENV NEXT_TELEMETRY_DISABLED=1

    
    # Copy production assets
    COPY --from=builder --chown=node:node /app/public ./public
    
    # Set the correct permission for prerender cache
    RUN mkdir .next
    RUN chown node:node .next

    # Automatically leverage output traces to reduce image size
    # https://nextjs.org/docs/advanced-features/output-file-tracing
    COPY --from=builder --chown=node:node /app/.next/standalone ./
    COPY --from=builder --chown=node:node /app/.next/static ./.next/static

    # If you want to persist the fetch cache generated during the build so that
    # cached responses are available immediately on startup, uncomment this line:
    # COPY --from=builder --chown=node:node /app/.next/cache ./.next/cache

    # Switch to non-root user for security best practices
    USER node

    # Expose port 3000 to allow HTTP traffic
    EXPOSE 3000

    # Start Next.js standalone server
    CMD ["node", "server.js"]