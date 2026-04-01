import { Router } from "express";
import { z } from "zod";
import prisma from "../../lib/prisma";
import { authenticate } from "../../middleware/authenticate";
import { AppError } from "../../middleware/errorHandler";

export const preferencesRouter = Router();
preferencesRouter.use(authenticate);

// GET /api/preferences?projectId=xxx
preferencesRouter.get("/", async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (!projectId) throw new AppError(400, "projectId is required.", "VALIDATION");

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: projectId as string, userId: req.user!.id } },
      include: { notificationPrefs: true },
    });
    if (!membership) throw new AppError(403, "Access denied.", "FORBIDDEN");

    res.json(membership.notificationPrefs);
  } catch (err) { next(err); }
});

// PUT /api/preferences — upsert preferences
preferencesRouter.put("/", async (req, res, next) => {
  try {
    const schema = z.object({
      projectId: z.string(),
      preferences: z.array(
        z.object({
          type: z.enum(["TASK_ASSIGNED", "STATUS_REMINDER", "REPORT_SENT", "RISK_ALERT", "PROJECT_UPDATED"]),
          emailEnabled: z.boolean(),
          inAppEnabled: z.boolean(),
          reminderFreq: z.string().optional(),
        })
      ),
    });
    const { projectId, preferences } = schema.parse(req.body);

    const membership = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId, userId: req.user!.id } },
    });
    if (!membership) throw new AppError(403, "Access denied.", "FORBIDDEN");

    const results = await Promise.all(
      preferences.map((pref) =>
        prisma.notificationPreference.upsert({
          where: { projectMemberId_type: { projectMemberId: membership.id, type: pref.type } },
          create: { projectMemberId: membership.id, ...pref } as any,
          update: pref,
        })
      )
    );

    res.json(results);
  } catch (err) { next(err); }
});
