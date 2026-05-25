# ─── Stage 1: Install backend deps ───────────────────────────────────────────
FROM node:20-alpine AS backend-deps
WORKDIR /app/backend
RUN npm install -g pnpm
COPY backend/package.json backend/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# ─── Stage 2: Install frontend deps ──────────────────────────────────────────
FROM node:20-alpine AS frontend-deps
WORKDIR /app/frontend/app
RUN npm install -g pnpm
COPY frontend/app/package.json frontend/app/pnpm-lock.yaml* ./
RUN pnpm install --frozen-lockfile

# ─── Stage 3: Build frontend ──────────────────────────────────────────────────
FROM frontend-deps AS frontend-builder
WORKDIR /app/frontend/app
COPY frontend/app/ ./
RUN pnpm run build

# ─── Stage 4: Build backend ───────────────────────────────────────────────────
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
RUN npm install -g pnpm
COPY --from=backend-deps /app/backend/node_modules ./node_modules
COPY backend/ ./
# Copy built frontend so backend can serve it as static files
COPY --from=frontend-builder /app/frontend/app/dist ../frontend/app/dist
RUN pnpm prisma generate
RUN pnpm exec tsc

# ─── Stage 5: Production runner ──────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy backend dist and dependencies
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package.json ./backend/
COPY --from=backend-builder /app/backend/prisma ./backend/prisma

# Copy frontend build for static serving
COPY --from=frontend-builder /app/frontend/app/dist ./frontend/app/dist

WORKDIR /app/backend
EXPOSE 3001
CMD ["node", "dist/index.js"]
