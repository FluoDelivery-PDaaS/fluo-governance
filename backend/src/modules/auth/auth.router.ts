import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import prisma from "../../lib/prisma";
import { AppError } from "../../middleware/errorHandler";
import { authenticate } from "../../middleware/authenticate";
import { logger } from "../../lib/logger";

export const authRouter = Router();

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET not configured");
  return new TextEncoder().encode(secret);
}

async function generateTokens(userId: string) {
  const secret = getJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || "24h";

  const accessToken = await new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);

  const refreshToken = await new SignJWT({ sub: userId, type: "refresh" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  // Store refresh token
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);
  await prisma.refreshToken.create({
    data: { token: refreshToken, userId, expiresAt },
  });

  return { accessToken, refreshToken };
}

// POST /api/auth/register
authRouter.post("/register", async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8, "Password must be at least 8 characters"),
      name: z.string().min(2),
    });

    const { email, password, name } = schema.parse(req.body);

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new AppError(409, "Email already in use.", "EMAIL_TAKEN");

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name },
      select: { id: true, email: true, name: true, role: true },
    });

    const tokens = await generateTokens(user.id);
    logger.info(`New user registered: ${email}`);

    res.status(201).json({ user, ...tokens });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
authRouter.post("/login", async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const { email, password } = schema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new AppError(401, "Invalid credentials.", "INVALID_CREDENTIALS");
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError(401, "Invalid credentials.", "INVALID_CREDENTIALS");

    const tokens = await generateTokens(user.id);
    logger.info(`User logged in: ${email}`);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      ...tokens,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh
authRouter.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string() }).parse(req.body);

    const stored = await prisma.refreshToken.findUnique({ where: { token: refreshToken } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new AppError(401, "Invalid or expired refresh token.", "INVALID_TOKEN");
    }

    await jwtVerify(refreshToken, getJwtSecret());

    // Rotate refresh token
    await prisma.refreshToken.delete({ where: { id: stored.id } });
    const tokens = await generateTokens(stored.userId);

    res.json(tokens);
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
authRouter.post("/logout", authenticate, async (req, res, next) => {
  try {
    const { refreshToken } = z.object({ refreshToken: z.string().optional() }).parse(req.body);
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
    res.json({ message: "Logged out successfully." });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
authRouter.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, email: true, name: true, role: true, avatarUrl: true, createdAt: true },
    });
    if (!user) throw new AppError(404, "User not found.", "NOT_FOUND");
    res.json(user);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/me
authRouter.patch("/me", authenticate, async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2).optional(),
      avatarUrl: z.string().url().optional(),
    });
    const data = schema.parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data,
      select: { id: true, email: true, name: true, role: true, avatarUrl: true },
    });
    res.json(user);
  } catch (err) {
    next(err);
  }
});
