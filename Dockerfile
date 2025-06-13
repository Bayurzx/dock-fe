# Use the official Node.js 22.16.0-slim image as base
FROM node:22.16.0-slim AS base

# Install dependencies only when needed
FROM base AS deps
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json yarn.lock* package-lock.json* pnpm-lock.yaml* ./
RUN \
  if [ -f yarn.lock ]; then yarn --frozen-lockfile; \
  elif [ -f package-lock.json ]; then npm ci --legacy-peer-deps; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm i --frozen-lockfile; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Add build arguments for public environment variables
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_AUTH_ENABLED
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_OAUTH_CALLBACK_URL
ARG NEXT_PUBLIC_PRODUCTION_URL
ARG NEXT_PUBLIC_ENABLE_GITHUB_LOGIN
ARG NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN
ARG NEXT_PUBLIC_ANALYTICS_ID

# Set as environment variables for build
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_AUTH_ENABLED=${NEXT_PUBLIC_AUTH_ENABLED}
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_PUBLIC_OAUTH_CALLBACK_URL=${NEXT_PUBLIC_OAUTH_CALLBACK_URL}
ENV NEXT_PUBLIC_PRODUCTION_URL=${NEXT_PUBLIC_PRODUCTION_URL}
ENV NEXT_PUBLIC_ENABLE_GITHUB_LOGIN=${NEXT_PUBLIC_ENABLE_GITHUB_LOGIN}
ENV NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=${NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN}
ENV NEXT_PUBLIC_ANALYTICS_ID=${NEXT_PUBLIC_ANALYTICS_ID}

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Build the application
RUN \
  if [ -f yarn.lock ]; then yarn run build; \
  elif [ -f package-lock.json ]; then npm run build; \
  elif [ -f pnpm-lock.yaml ]; then corepack enable pnpm && pnpm run build; \
  else echo "Lockfile not found." && exit 1; \
  fi

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

# Install curl for health check
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create a non-root user
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 --gid nodejs nextjs

# Copy the public folder
COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]