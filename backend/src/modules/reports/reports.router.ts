import { Router } from "express";
import { z } from "zod";
import prisma from "../../lib/prisma";
import { authenticate, authorize } from "../../middleware/authenticate";
import { AppError } from "../../middleware/errorHandler";
import { generateAIReport } from "../ai/ai.service";
import { sendEmail } from "../notifications/notifications.service";
import { logger } from "../../lib/logger";

export const reportsRouter = Router();
reportsRouter.use(authenticate);

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

// GET /api/reports?projectId=xxx
reportsRouter.get("/", async (req, res, next) => {
  try {
    const { projectId } = req.query;
    if (!projectId) throw new AppError(400, "projectId is required.", "VALIDATION");
    await requireProjectAccess(projectId as string, req.user!.id);

    const reports = await prisma.report.findMany({
      where: { projectId: projectId as string },
      include: {
        versions: { orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { versions: true } },
      },
      orderBy: { weekOf: "desc" },
    });
    res.json(reports);
  } catch (err) { next(err); }
});

// POST /api/reports — create + trigger AI generation
reportsRouter.post("/", authorize("PROJECT_MANAGER"), async (req, res, next) => {
  try {
    const schema = z.object({
      projectId: z.string(),
      weekOf: z.string().datetime(),
      title: z.string().optional(),
    });
    const { projectId, weekOf, title } = schema.parse(req.body);
    await requireProjectAccess(projectId, req.user!.id, ["PROJECT_MANAGER"]);

    const weekDate = new Date(weekOf);
    const reportTitle = title || `Status Report — Semana de ${weekDate.toLocaleDateString("pt-BR")}`;

    const report = await prisma.report.create({
      data: { projectId, weekOf: weekDate, title: reportTitle },
    });

    // Trigger AI generation asynchronously
    generateAIReport(report.id, projectId).catch((err) =>
      logger.error("AI report generation failed:", err)
    );

    res.status(201).json({ ...report, generating: true });
  } catch (err) { next(err); }
});

// GET /api/reports/:id
reportsRouter.get("/:id", async (req, res, next) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      include: { versions: { orderBy: { createdAt: "desc" } } },
    });
    if (!report) throw new AppError(404, "Report not found.", "NOT_FOUND");
    await requireProjectAccess(report.projectId, req.user!.id);
    res.json(report);
  } catch (err) { next(err); }
});

// PATCH /api/reports/:id — edit report content
reportsRouter.patch("/:id", async (req, res, next) => {
  try {
    const report = await prisma.report.findUnique({ where: { id: req.params.id } });
    if (!report) throw new AppError(404, "Report not found.", "NOT_FOUND");
    await requireProjectAccess(report.projectId, req.user!.id, ["PROJECT_MANAGER"]);

    const schema = z.object({
      executiveSummary: z.string().optional(),
      mainRisks: z.string().optional(),
      mainBlockers: z.string().optional(),
      mitigationSuggestions: z.string().optional(),
      fullContent: z.string().optional(),
    });
    const data = schema.parse(req.body);

    // Create a new version (edited by human)
    const version = await prisma.reportVersion.create({
      data: {
        reportId: report.id,
        executiveSummary: data.executiveSummary || "",
        mainRisks: data.mainRisks || "",
        mainBlockers: data.mainBlockers || "",
        mitigationSuggestions: data.mitigationSuggestions || "",
        fullContent: data.fullContent || "",
        isAIGenerated: false,
        editedByHuman: true,
      },
    });

    // Update report status to APPROVED
    await prisma.report.update({
      where: { id: report.id },
      data: { status: "APPROVED" },
    });

    res.json(version);
  } catch (err) { next(err); }
});

// POST /api/reports/:id/send — send report to stakeholders
reportsRouter.post("/:id/send", authorize("PROJECT_MANAGER"), async (req, res, next) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: req.params.id },
      include: {
        versions: { orderBy: { createdAt: "desc" }, take: 1 },
        project: { include: { members: { include: { user: true } } } },
      },
    });
    if (!report) throw new AppError(404, "Report not found.", "NOT_FOUND");
    await requireProjectAccess(report.projectId, req.user!.id, ["PROJECT_MANAGER"]);

    const latestVersion = report.versions[0];
    if (!latestVersion) throw new AppError(400, "Report has no content to send.", "NO_CONTENT");

    // Get stakeholder emails
    const stakeholders = report.project.members
      .filter((m) => m.role === "STAKEHOLDER")
      .map((m) => m.user.email);

    if (stakeholders.length === 0) {
      throw new AppError(400, "No stakeholders to send report to.", "NO_STAKEHOLDERS");
    }

    // Send emails
    for (const email of stakeholders) {
      await sendEmail({
        to: email,
        subject: report.title,
        html: buildReportEmail(report.title, latestVersion.fullContent || latestVersion.executiveSummary),
      });
    }

    // Mark as sent
    await prisma.report.update({
      where: { id: report.id },
      data: { status: "SENT", sentAt: new Date(), sentTo: stakeholders },
    });

    res.json({ message: `Report sent to ${stakeholders.length} stakeholder(s).`, sentTo: stakeholders });
  } catch (err) { next(err); }
});

function buildReportEmail(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Inter, Arial, sans-serif; background: #f4f6f9; margin: 0; padding: 20px; }
    .container { max-width: 700px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
    .header { background: linear-gradient(135deg, #1E3A5F 0%, #0891B2 100%); padding: 32px 24px; }
    .header h1 { color: white; margin: 0; font-size: 22px; font-weight: 700; }
    .header p { color: rgba(255,255,255,0.8); margin: 4px 0 0; font-size: 14px; }
    .body { padding: 32px 24px; color: #374151; line-height: 1.7; white-space: pre-wrap; }
    .cta { text-align: center; padding: 0 24px 32px; }
    .cta a { background: #0891B2; color: white; padding: 12px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; }
    .footer { padding: 16px 24px; background: #f9fafb; color: #9ca3af; font-size: 12px; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
      <p>Fluo Governance — Project Status Report</p>
    </div>
    <div class="body">${content}</div>
    <div class="cta">
      <a href="${process.env.APP_URL || 'https://app.fluodelivery.com'}">Ver relatório completo na plataforma</a>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Fluo Delivery — fluodelivery.com</div>
  </div>
</body>
</html>`;
}
