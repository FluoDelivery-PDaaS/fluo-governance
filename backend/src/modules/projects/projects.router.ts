import { Router } from "express";
import { z } from "zod";
import prisma from "../../lib/prisma";
import { authenticate, authorize } from "../../middleware/authenticate";
import { AppError } from "../../middleware/errorHandler";
import { sendNotification } from "../notifications/notifications.service";

export const projectsRouter = Router();
projectsRouter.use(authenticate);

// Helper: check if user is member of project
async function requireProjectAccess(projectId: string, userId: string, roles?: string[]) {
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
  });
  if (!membership) throw new AppError(403, "Access denied to this project.", "FORBIDDEN");
  if (roles && !roles.includes(membership.role)) {
    throw new AppError(403, "Insufficient role for this action.", "FORBIDDEN");
  }
  return membership;
}

// GET /api/projects — list user's projects
projectsRouter.get("/", async (req, res, next) => {
  try {
    const projects = await prisma.project.findMany({
      where: { members: { some: { userId: req.user!.id } } },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true, risks: true, milestones: true } },
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(projects);
  } catch (err) { next(err); }
});

// POST /api/projects — create project (PM only)
projectsRouter.post("/", authorize("PROJECT_MANAGER"), async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      description: z.string().optional(),
      startDate: z.string().datetime(),
      endDate: z.string().datetime(),
      budget: z.number().positive().optional(),
      currency: z.string().default("BRL"),
    });
    const data = schema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        ...data,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        createdById: req.user!.id,
        members: {
          create: { userId: req.user!.id, role: "PROJECT_MANAGER" },
        },
      } as any,
      include: { members: true },
    });
    res.status(201).json(project);
  } catch (err) { next(err); }
});

// GET /api/projects/:id
projectsRouter.get("/:id", async (req, res, next) => {
  try {
    await requireProjectAccess(req.params.id, req.user!.id);
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        members: { include: { user: { select: { id: true, name: true, email: true, role: true } } } },
        milestones: { orderBy: { dueDate: "asc" } },
        risks: { orderBy: { createdAt: "desc" } },
        _count: { select: { tasks: true, reports: true } },
      },
    });
    if (!project) throw new AppError(404, "Project not found.", "NOT_FOUND");
    res.json(project);
  } catch (err) { next(err); }
});

// PATCH /api/projects/:id
projectsRouter.patch("/:id", async (req, res, next) => {
  try {
    await requireProjectAccess(req.params.id, req.user!.id, ["PROJECT_MANAGER"]);
    const schema = z.object({
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      startDate: z.string().datetime().optional(),
      endDate: z.string().datetime().optional(),
      status: z.enum(["ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"]).optional(),
      health: z.enum(["ON_TRACK", "AT_RISK", "OFF_TRACK"]).optional(),
      budget: z.number().positive().optional(),
    });
    const data = schema.parse(req.body);
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: {
        ...data,
        ...(data.startDate && { startDate: new Date(data.startDate) } as any),
        ...(data.endDate && { endDate: new Date(data.endDate) }),
      },
    });
    res.json(project);
  } catch (err) { next(err); }
});

// POST /api/projects/:id/members — add member
projectsRouter.post("/:id/members", async (req, res, next) => {
  try {
    await requireProjectAccess(req.params.id, req.user!.id, ["PROJECT_MANAGER"]);
    const schema = z.object({
      userId: z.string(),
      role: z.enum(["PROJECT_MANAGER", "STAKEHOLDER", "RESOURCE"]),
    });
    const { userId, role } = schema.parse(req.body);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError(404, "User not found.", "NOT_FOUND");

    const member = await prisma.projectMember.create({
      data: { projectId: req.params.id, userId, role } as any,
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    // Notify new member
    await sendNotification({
      userId,
      type: "PROJECT_UPDATED",
      title: "Você foi adicionado a um projeto",
      content: `Você foi adicionado ao projeto como ${role}.`,
      metadata: { projectId: req.params.id },
    });

    res.status(201).json(member);
  } catch (err) { next(err); }
});

// GET /api/projects/:id/milestones
projectsRouter.get("/:id/milestones", async (req, res, next) => {
  try {
    await requireProjectAccess(req.params.id, req.user!.id);
    const milestones = await prisma.milestone.findMany({
      where: { projectId: req.params.id },
      include: { _count: { select: { tasks: true } } },
      orderBy: { dueDate: "asc" },
    });
    res.json(milestones);
  } catch (err) { next(err); }
});

// POST /api/projects/:id/milestones
projectsRouter.post("/:id/milestones", async (req, res, next) => {
  try {
    await requireProjectAccess(req.params.id, req.user!.id, ["PROJECT_MANAGER"]);
    const schema = z.object({
      name: z.string().min(2),
      description: z.string().optional(),
      dueDate: z.string().datetime(),
    });
    const data = schema.parse(req.body);
    const milestone = await prisma.milestone.create({
      data: { ...data, dueDate: new Date(data.dueDate), projectId: req.params.id } as any,
    });
    res.status(201).json(milestone);
  } catch (err) { next(err); }
});

// GET /api/projects/:id/risks
projectsRouter.get("/:id/risks", async (req, res, next) => {
  try {
    await requireProjectAccess(req.params.id, req.user!.id);
    const risks = await prisma.risk.findMany({
      where: { projectId: req.params.id },
      orderBy: { createdAt: "desc" },
    });
    res.json(risks);
  } catch (err) { next(err); }
});

// POST /api/projects/:id/risks
projectsRouter.post("/:id/risks", async (req, res, next) => {
  try {
    await requireProjectAccess(req.params.id, req.user!.id, ["PROJECT_MANAGER"]);
    const schema = z.object({
      title: z.string().min(2),
      description: z.string(),
      probability: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
      impact: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
      mitigation: z.string().optional(),
      owner: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const risk = await prisma.risk.create({ data: { ...data, projectId: req.params.id } as any });
    res.status(201).json(risk);
  } catch (err) { next(err); }
});

// PATCH /api/projects/:id/risks/:riskId
projectsRouter.patch("/:id/risks/:riskId", async (req, res, next) => {
  try {
    await requireProjectAccess(req.params.id, req.user!.id, ["PROJECT_MANAGER"]);
    const schema = z.object({
      status: z.enum(["OPEN", "MITIGATED", "CLOSED"]).optional(),
      mitigation: z.string().optional(),
    });
    const data = schema.parse(req.body);
    const risk = await prisma.risk.update({ where: { id: req.params.riskId }, data });
    res.json(risk);
  } catch (err) { next(err); }
});
