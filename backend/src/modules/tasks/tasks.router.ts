import { Router } from "express";
import { z } from "zod";
import prisma from "../../lib/prisma";
import { authenticate, authorize } from "../../middleware/authenticate";
import { AppError } from "../../middleware/errorHandler";
import { sendNotification } from "../notifications/notifications.service";

export const tasksRouter = Router();
tasksRouter.use(authenticate);

async function requireProjectAccess(projectId: string, userId: string, roles?: string[]) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!membership) throw new AppError(403, "Access denied.", "FORBIDDEN");
  if (roles && !roles.includes(membership.role)) {
    throw new AppError(403, "Insufficient role.", "FORBIDDEN");
  }
  return membership;
}

// GET /api/tasks?projectId=xxx
tasksRouter.get("/", async (req, res, next) => {
  try {
    const { projectId, milestoneId, assigneeId, status } = req.query;
    if (!projectId) throw new AppError(400, "projectId is required.", "VALIDATION");
    await requireProjectAccess(projectId as string, req.user!.id);

    const tasks = await prisma.task.findMany({
      where: {
        projectId: projectId as string,
        ...(milestoneId && { milestoneId: milestoneId as string }),
        ...(assigneeId && { assigneeId: assigneeId as string }),
        ...(status && { status: status as any }),
      },
      include: {
        milestone: { select: { id: true, name: true } },
        _count: { select: { statusUpdates: true } },
      },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    });
    res.json(tasks);
  } catch (err) { next(err); }
});

// POST /api/tasks
tasksRouter.post("/", async (req, res, next) => {
  try {
    const schema = z.object({
      projectId: z.string(),
      milestoneId: z.string().optional(),
      title: z.string().min(2),
      description: z.string().optional(),
      assigneeId: z.string().optional(),
      startDate: z.string().datetime().optional(),
      dueDate: z.string().datetime().optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).default("MEDIUM"),
    });
    const data = schema.parse(req.body);
    await requireProjectAccess(data.projectId, req.user!.id, ["PROJECT_MANAGER"]);

    const task = await prisma.task.create({
      data: {
        ...data,
        ...(data.startDate && { startDate: new Date(data.startDate) } as any),
        ...(data.dueDate && { dueDate: new Date(data.dueDate) }),
      },
    });

    // Notify assignee
    if (data.assigneeId) {
      await sendNotification({
        userId: data.assigneeId,
        type: "TASK_ASSIGNED",
        title: "Nova tarefa atribuída",
        content: `Você foi designado para a tarefa: "${task.title}"`,
        metadata: { taskId: task.id, projectId: data.projectId },
        sendEmail: true,
      });
    }

    res.status(201).json(task);
  } catch (err) { next(err); }
});

// GET /api/tasks/:id
tasksRouter.get("/:id", async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.id },
      include: {
        milestone: true,
        statusUpdates: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });
    if (!task) throw new AppError(404, "Task not found.", "NOT_FOUND");
    await requireProjectAccess(task.projectId, req.user!.id);
    res.json(task);
  } catch (err) { next(err); }
});

// PATCH /api/tasks/:id
tasksRouter.patch("/:id", async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) throw new AppError(404, "Task not found.", "NOT_FOUND");
    await requireProjectAccess(task.projectId, req.user!.id, ["PROJECT_MANAGER"]);

    const schema = z.object({
      title: z.string().min(2).optional(),
      description: z.string().optional(),
      assigneeId: z.string().optional().nullable(),
      dueDate: z.string().datetime().optional(),
      status: z.enum(["NOT_STARTED", "ON_TRACK", "AT_RISK", "DELAYED", "COMPLETED", "BLOCKED"]).optional(),
      priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),
      milestoneId: z.string().optional().nullable(),
    });
    const data = schema.parse(req.body);

    const updated = await prisma.task.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(data.dueDate && { dueDate: new Date(data.dueDate) } as any),
      },
    });
    res.json(updated);
  } catch (err) { next(err); }
});

// DELETE /api/tasks/:id
tasksRouter.delete("/:id", async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.id } });
    if (!task) throw new AppError(404, "Task not found.", "NOT_FOUND");
    await requireProjectAccess(task.projectId, req.user!.id, ["PROJECT_MANAGER"]);
    await prisma.task.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) { next(err); }
});
