import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { authRouter } from "./modules/auth/auth.router";
import { projectsRouter } from "./modules/projects/projects.router";
import { tasksRouter } from "./modules/tasks/tasks.router";
import { statusRouter } from "./modules/status/status.router";
import { reportsRouter } from "./modules/reports/reports.router";
import { notificationsRouter } from "./modules/notifications/notifications.router";
import { preferencesRouter } from "./modules/preferences/preferences.router";
import { errorHandler } from "./middleware/errorHandler";
import { logger } from "./lib/logger";

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security Middleware ──────────────────────────────────────
app.use(helmet());
app.use(
  cors({
    origin: (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:5174")
      .split(",")
      .map((o) => o.trim()),
    credentials: true,
  })
);

// ─── Rate Limiting ────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === "development" ? 100 : 10,
  message: { error: "Too many authentication attempts, please try again later." },
});

// ─── Body Parsing ─────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ─────────────────────────────────────────────────
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ─── Health Check ─────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" });
});

// ─── Routes ───────────────────────────────────────────────────
app.use("/api/auth", authLimiter, authRouter);
app.use("/api/projects", projectsRouter);
app.use("/api/tasks", tasksRouter);
app.use("/api/status-updates", statusRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/preferences", preferencesRouter);

// ─── Serve Frontend Static Files (Production) ───────────────
const frontendDistPath = path.join(__dirname, "../../frontend/app/dist");
if (process.env.NODE_ENV === "production" && fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  // SPA fallback - serve index.html for all non-API routes
  app.get("*", (req, res) => {
    if (!req.path.startsWith("/api")) {
      res.sendFile(path.join(frontendDistPath, "index.html"));
    } else {
      res.status(404).json({ error: "Route not found" });
    }
  });
} else {
  // ─── 404 Handler ─────────────────────────────────────────────
  app.use((_req, res) => {
    res.status(404).json({ error: "Route not found" });
  });
}

// ─── Error Handler ────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────
app.listen(PORT, () => {
  logger.info(`🚀 Fluo Governance API running on http://localhost:${PORT}`);
  logger.info(`📊 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
