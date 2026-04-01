import { Router } from "express";
import { z } from "zod";
import prisma from "../../lib/prisma";
import { authenticate } from "../../middleware/authenticate";
import { AppError } from "../../middleware/errorHandler";

export const statusRouter = Router();
statusRouter.use(authenticate);

// GET /api/status-updates?projectId=xxx
statusRouter.get("/", async (req, res, next) => {
  try {
    const { projectId, taskId } = req.query;
    if (!projectId) throw new AppError(400, "projectId is required.", "VALIDATION");

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: projectId as string, userId: req.user!.id } },
    });
    if (!membership) throw new AppError(403, "Access denied.", "FORBIDDEN");

    const updates = await prisma.statusUpdate.findMany({
      where: {
        projectId: projectId as string,
        ...(taskId && { taskId: taskId as string }),
      },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        task: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(updates);
  } catch (err) { next(err); }
});

// POST /api/status-updates
statusRouter.post("/", async (req, res, next) => {
  try {
    const schema = z.object({
      projectId: z.string(),
      taskId: z.string(),
      status: z.enum(["NOT_STARTED", "ON_TRACK", "AT_RISK", "DELAYED", "COMPLETED", "BLOCKED"]),
      progressSummary: z.string().min(10, "Please provide a meaningful summary (min 10 chars)"),
      blockers: z.string().optional(),
      supportNeeded: z.string().optional(),
      progressPercent: z.number().min(0).max(100).optional(),
    });
    const data = schema.parse(req.body);

    // Verify task belongs to project and user has access
    const task = await prisma.task.findUnique({ where: { id: data.taskId } });
    if (!task || task.projectId !== data.projectId) {
      throw new AppError(404, "Task not found in this project.", "NOT_FOUND");
    }

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: data.projectId, userId: req.user!.id } },
    });
    if (!membership) throw new AppError(403, "Access denied.", "FORBIDDEN");

    // Create status update
    const update = await prisma.statusUpdate.create({
      data: { ...data, userId: req.user!.id } as any,
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });

    // Update task status
    await prisma.task.update({
      where: { id: data.taskId },
      data: {
        status: data.status,
        ...(data.progressPercent === 100 && { status: "COMPLETED" } as any),
      },
    });

    res.status(201).json(update);
  } catch (err) { next(err); }
});

// GET /api/status-updates/:id
statusRouter.get("/:id", async (req, res, next) => {
  try {
    const update = await prisma.statusUpdate.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, name: true } },
        task: { select: { id: true, title: true } },
      },
    });
    if (!update) throw new AppError(404, "Status update not found.", "NOT_FOUND");

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: update.projectId, userId: req.user!.id } },
    });
    if (!membership) throw new AppError(403, "Access denied.", "FORBIDDEN");

    res.json(update);
  } catch (err) { next(err); }
});
