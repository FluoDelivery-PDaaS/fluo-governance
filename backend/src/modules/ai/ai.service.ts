import OpenAI from "openai";
import prisma from "../../lib/prisma";
import { logger } from "../../lib/logger";

function getOpenAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY not configured");
  return new OpenAI({ apiKey });
}

export async function generateAIReport(reportId: string, projectId: string): Promise<void> {
  logger.info(`Generating AI report for project ${projectId}, report ${reportId}`);

  // Gather project context
  const [project, tasks, risks, recentUpdates] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      include: { milestones: true },
    }),
    prisma.task.findMany({
      where: { projectId },
      orderBy: { dueDate: "asc" },
    }),
    prisma.risk.findMany({
      where: { projectId, status: "OPEN" },
      orderBy: { createdAt: "desc" },
    }),
    prisma.statusUpdate.findMany({
      where: { projectId },
      include: {
        user: { select: { name: true } },
        task: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  if (!project) throw new Error("Project not found");

  // Build context for AI
  const taskSummary = tasks.map((t) => ({
    title: t.title,
    status: t.status,
    priority: t.priority,
    dueDate: t.dueDate?.toLocaleDateString("pt-BR"),
  }));

  const riskSummary = risks.map((r) => ({
    title: r.title,
    probability: r.probability,
    impact: r.impact,
    mitigation: r.mitigation,
  }));

  const updateSummary = recentUpdates.map((u) => ({
    task: u.task?.title || "Geral",
    status: u.status,
    summary: u.progressSummary,
    blockers: u.blockers,
    by: u.user.name,
    date: u.createdAt.toLocaleDateString("pt-BR"),
  }));

  const prompt = `Você é um especialista em gestão de projetos de tecnologia. Com base nos dados abaixo, gere um Status Report executivo completo em português brasileiro.

PROJETO: ${project.name}
DESCRIÇÃO: ${project.description || "N/A"}
STATUS GERAL: ${project.health}
PERÍODO: ${project.startDate.toLocaleDateString("pt-BR")} a ${project.endDate.toLocaleDateString("pt-BR")}

TAREFAS (${tasks.length} total):
${JSON.stringify(taskSummary, null, 2)}

RISCOS ABERTOS (${risks.length}):
${JSON.stringify(riskSummary, null, 2)}

ATUALIZAÇÕES RECENTES:
${JSON.stringify(updateSummary, null, 2)}

Gere um relatório estruturado com as seguintes seções:
1. SUMÁRIO EXECUTIVO (3-4 parágrafos, visão geral para stakeholders)
2. PRINCIPAIS RISCOS (lista dos riscos mais críticos com análise)
3. BLOQUEADORES ATUAIS (o que está impedindo o progresso)
4. SUGESTÕES DE MITIGAÇÃO (ações recomendadas)
5. PRÓXIMOS PASSOS (prioridades para a próxima semana)

Seja objetivo, use linguagem executiva, e destaque pontos de atenção claramente.`;

  try {
    const openai = getOpenAI();
    const model = process.env.OPENAI_MODEL || "gpt-4o";

    const response = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "Você é um especialista em gestão de projetos de tecnologia com 15 anos de experiência. Gera relatórios executivos claros, objetivos e acionáveis. Responda sempre em português brasileiro.",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "";
    const tokens = response.usage?.total_tokens;

    // Parse sections from the response
    const sections = parseReportSections(content);

    // Save the generated version
    await prisma.reportVersion.create({
      data: {
        reportId,
        executiveSummary: sections.executiveSummary,
        mainRisks: sections.mainRisks,
        mainBlockers: sections.mainBlockers,
        mitigationSuggestions: sections.mitigationSuggestions,
        fullContent: content,
        isAIGenerated: true,
        editedByHuman: false,
      },
    });

    // Save AI insight
    await prisma.aIInsight.create({
      data: {
        projectId,
        type: "STATUS_REPORT",
        content: content.slice(0, 500),
        model,
        tokens,
      },
    });

    // Update report status to DRAFT (ready for review)
    await prisma.report.update({
      where: { id: reportId },
      data: { status: "DRAFT" },
    });

    logger.info(`AI report generated for ${projectId} (${tokens} tokens)`);
  } catch (err) {
    logger.error("OpenAI API error:", err);
    throw err;
  }
}

function parseReportSections(content: string) {
  const extract = (pattern: RegExp) => {
    const match = content.match(pattern);
    return match ? match[1].trim() : "";
  };

  return {
    executiveSummary:
      extract(/SUMÁRIO EXECUTIVO[:\n]+([\s\S]*?)(?=\n\d+\.|PRINCIPAIS RISCOS|$)/i) ||
      content.slice(0, 500),
    mainRisks:
      extract(/PRINCIPAIS RISCOS[:\n]+([\s\S]*?)(?=\n\d+\.|BLOQUEADORES|$)/i) || "",
    mainBlockers:
      extract(/BLOQUEADORES[:\n]+([\s\S]*?)(?=\n\d+\.|SUGESTÕES|$)/i) || "",
    mitigationSuggestions:
      extract(/SUGESTÕES DE MITIGAÇÃO[:\n]+([\s\S]*?)(?=\n\d+\.|PRÓXIMOS|$)/i) || "",
  };
}
