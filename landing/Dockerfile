# ── Stage 1: Build frontend ─────────────────────────────────────────────────
FROM node:20-slim AS builder

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy package files and install dependencies
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile 2>/dev/null || pnpm install

# Copy source files
COPY . .

# Build the Vite frontend
RUN pnpm build

# ── Stage 2: Production runtime ──────────────────────────────────────────────
FROM node:20-slim AS runner

WORKDIR /app

# Install only production dependencies
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml* ./
RUN pnpm install --prod --frozen-lockfile 2>/dev/null || pnpm install --prod

# Copy built frontend and server
COPY --from=builder /app/dist ./dist
COPY server ./server

EXPOSE 3000

CMD ["node", "server/index.js"]
