FROM oven/bun:1-alpine AS bun-base
FROM node:20-alpine AS node-base

# Stage 1: Install dependencies (Bun — fast installs)
FROM bun-base AS deps
RUN apk add --no-cache openssl
WORKDIR /app
COPY package.json bun.lockb ./
COPY prisma ./prisma
RUN bun install --frozen-lockfile
RUN bunx prisma generate

# Stage 2: Build the application (Node — avoids Bun SIGILL crash)
FROM node-base AS builder
RUN apk add --no-cache openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# Stage 3: Production server (Bun — fast runtime)
FROM bun-base AS runner
RUN apk add --no-cache openssl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000
CMD ["bun", "server.js"]
