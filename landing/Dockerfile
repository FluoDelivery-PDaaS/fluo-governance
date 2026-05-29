# ── Stage 1: Build frontend ─────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@10

# Cache bust argument - change this to force full rebuild
ARG CACHEBUST=2

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Copy source files (after install to leverage layer cache)
COPY client ./client
COPY vite.config.ts tsconfig.json ./

# Build the Vite frontend
RUN pnpm build

# ── Stage 2: Production runtime ──────────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

# Install only production dependencies
RUN npm install -g pnpm@10
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile

# Copy built frontend and server
COPY --from=builder /app/dist ./dist
COPY server ./server

EXPOSE 3000

CMD ["node", "server/index.js"]
