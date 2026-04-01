import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "./prisma";
import { logger } from "./logger";

async function main() {
  logger.info("🌱 Seeding Fluo Governance database...");

  // ─── 1. Users ──────────────────────────────────────────────────────────────
  const pwHash = await bcrypt.hash("Fluo@2025", 10);

  const pm = await prisma.user.upsert({
    where: { email: "pm@fluodelivery.com" },
    update: {},
    create: {
      email: "pm@fluodelivery.com",
      passwordHash: pwHash,
      name: "Alessandro Bax",
      role: "PROJECT_MANAGER",
    },
  });

  const stakeholder = await prisma.user.upsert({
    where: { email: "stakeholder@techcorp.com" },
    update: {},
    create: {
      email: "stakeholder@techcorp.com",
      passwordHash: pwHash,
      name: "Carlos Mendes",
      role: "STAKEHOLDER",
    },
  });

  const resource1 = await prisma.user.upsert({
    where: { email: "dev1@techcorp.com" },
    update: {},
    create: {
      email: "dev1@techcorp.com",
      passwordHash: pwHash,
      name: "Mariana Costa",
      role: "RESOURCE",
    },
  });

  const resource2 = await prisma.user.upsert({
    where: { email: "dev2@techcorp.com" },
    update: {},
    create: {
      email: "dev2@techcorp.com",
      passwordHash: pwHash,
      name: "Rafael Souza",
      role: "RESOURCE",
    },
  });

  logger.info(`✅ Users: ${pm.email}, ${stakeholder.email}, ${resource1.email}, ${resource2.email}`);

  // ─── 2. Project ────────────────────────────────────────────────────────────
  const project = await prisma.project.upsert({
    where: { id: "proj-sap-001" },
    update: {},
    create: {
      id: "proj-sap-001",
      name: "Implementação ERP SAP S/4HANA",
      description:
        "Projeto de implementação do SAP S/4HANA cobrindo os módulos FI, CO, SD e MM para a TechCorp Soluções Digitais, com migração de dados legados e integração com plataforma eCommerce.",
      startDate: new Date("2025-01-15"),
      endDate: new Date("2025-09-30"),
      status: "ACTIVE",
      health: "AT_RISK",
      budget: 1200000,
      currency: "BRL",
      createdById: pm.id,
      members: {
        create: [
          { userId: pm.id, role: "PROJECT_MANAGER" },
          { userId: stakeholder.id, role: "STAKEHOLDER" },
          { userId: resource1.id, role: "RESOURCE" },
          { userId: resource2.id, role: "RESOURCE" },
        ],
      },
    },
  });

  logger.info(`✅ Project: ${project.name}`);

  // ─── 3. Milestones ─────────────────────────────────────────────────────────
  const m1 = await prisma.milestone.upsert({
    where: { id: "ms-001" },
    update: {},
    create: {
      id: "ms-001",
      projectId: project.id,
      name: "Fase 1 — Blueprint e Design",
      description: "Levantamento de requisitos, design da solução e aprovação do blueprint",
      dueDate: new Date("2025-03-31"),
      completed: true,
      completedAt: new Date("2025-03-28"),
    },
  });

  const m2 = await prisma.milestone.upsert({
    where: { id: "ms-002" },
    update: {},
    create: {
      id: "ms-002",
      projectId: project.id,
      name: "Fase 2 — Configuração e Desenvolvimento",
      description: "Configuração dos módulos FI, CO, SD e MM, desenvolvimentos customizados e integrações",
      dueDate: new Date("2025-06-30"),
      completed: false,
    },
  });

  await prisma.milestone.upsert({
    where: { id: "ms-003" },
    update: {},
    create: {
      id: "ms-003",
      projectId: project.id,
      name: "Fase 3 — Testes e Go-Live",
      description: "UAT completo, migração de dados, treinamento de usuários e go-live",
      dueDate: new Date("2025-09-30"),
      completed: false,
    },
  });

  logger.info(`✅ Milestones: 3 created`);

  // ─── 4. Tasks ──────────────────────────────────────────────────────────────
  const tasks = [
    {
      id: "task-001",
      title: "Configuração módulo FI/CO",
      description: "Configurar os módulos Financeiro (FI) e Controladoria (CO) no ambiente SAP S/4HANA.",
      status: "COMPLETED" as const,
      priority: "HIGH" as const,
      milestoneId: m1.id,
      assigneeId: resource1.id,
      dueDate: new Date("2025-03-15"),
    },
    {
      id: "task-002",
      title: "Desenvolvimento integração SD-eCommerce",
      description: "Desenvolver e testar a integração entre o módulo SD e a plataforma eCommerce VTEX via API REST.",
      status: "AT_RISK" as const,
      priority: "CRITICAL" as const,
      milestoneId: m2.id,
      assigneeId: resource2.id,
      dueDate: new Date("2025-05-30"),
    },
    {
      id: "task-003",
      title: "Migração de dados legados",
      description: "Extrair, transformar e carregar os dados do sistema legado para o SAP S/4HANA (45.000 registros de materiais).",
      status: "ON_TRACK" as const,
      priority: "HIGH" as const,
      milestoneId: m2.id,
      assigneeId: resource1.id,
      dueDate: new Date("2025-06-15"),
    },
    {
      id: "task-004",
      title: "Programa de Gestão de Mudança (OCM)",
      description: "Planejar e executar o programa de Gestão de Mudança Organizacional para 200 usuários afetados.",
      status: "ON_TRACK" as const,
      priority: "MEDIUM" as const,
      milestoneId: m2.id,
      assigneeId: pm.id,
      dueDate: new Date("2025-07-31"),
    },
    {
      id: "task-005",
      title: "UAT — Módulo FI/CO",
      description: "Conduzir User Acceptance Testing dos módulos FI e CO com 45 usuários-chave.",
      status: "COMPLETED" as const,
      priority: "HIGH" as const,
      milestoneId: m1.id,
      assigneeId: resource1.id,
      dueDate: new Date("2025-04-15"),
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: { ...task, projectId: project.id },
    });
  }

  logger.info(`✅ Tasks: ${tasks.length} created`);

  // ─── 5. Status Updates ─────────────────────────────────────────────────────
  await prisma.statusUpdate.createMany({
    skipDuplicates: true,
    data: [
      {
        projectId: project.id,
        taskId: "task-002",
        userId: resource2.id,
        title: "Atualização SD-eCommerce — Semana 18",
        status: "AT_RISK",
        overallHealth: "AT_RISK",
        scheduleStatus: "AT_RISK",
        budgetStatus: "ON_TRACK",
        scopeStatus: "ON_TRACK",
        progressSummary:
          "A integração SD-eCommerce encontrou complexidade adicional na API de pedidos B2B. Documentação VTEX incompleta. Estimativa revisada para +2 semanas.",
        blockers:
          "API do eCommerce não documentada para pedidos B2B. Aguardando suporte técnico do fornecedor VTEX.",
        supportNeeded:
          "Contato urgente com fornecedor VTEX para documentação completa da API B2B.",
        progressPercent: 35,
      },
      {
        projectId: project.id,
        taskId: "task-003",
        userId: resource1.id,
        title: "Atualização Migração de Dados — Semana 18",
        status: "ON_TRACK",
        overallHealth: "ON_TRACK",
        scheduleStatus: "ON_TRACK",
        budgetStatus: "ON_TRACK",
        scopeStatus: "ON_TRACK",
        progressSummary:
          "Extração dos dados legados concluída (45.000 registros de materiais). Iniciando validação e limpeza dos dados financeiros. 12% dos registros apresentam inconsistências sendo corrigidas.",
        progressPercent: 60,
      },
    ],
  });

  logger.info(`✅ Status Updates: 2 created`);

  // ─── 6. Risks ──────────────────────────────────────────────────────────────
  await prisma.risk.createMany({
    skipDuplicates: true,
    data: [
      {
        projectId: project.id,
        title: "Atraso nas integrações SD-eCommerce",
        description:
          "Complexidade técnica da integração com a plataforma eCommerce VTEX pode causar atraso de 3-4 semanas na entrega da Fase 2.",
        probability: "HIGH",
        impact: "HIGH",
        mitigation:
          "Alocação de recurso adicional especialista em SAP SD (Rafael Souza em dedicação exclusiva). Reunião diária de acompanhamento técnico.",
        owner: "Rafael Souza",
        status: "OPEN",
      },
      {
        projectId: project.id,
        title: "Resistência à mudança dos usuários-chave",
        description:
          "Usuários do departamento financeiro demonstram resistência ao novo sistema SAP, podendo impactar a qualidade do UAT.",
        probability: "MEDIUM",
        impact: "MEDIUM",
        mitigation:
          "Programa de treinamento antecipado iniciado. Workshops de engajamento com líderes de área. Sessões de Q&A semanais.",
        owner: "Alessandro Bax",
        status: "MITIGATED",
      },
      {
        projectId: project.id,
        title: "Qualidade dos dados para migração",
        description:
          "Dados legados apresentam inconsistências em 12% dos registros, podendo comprometer a migração.",
        probability: "MEDIUM",
        impact: "HIGH",
        mitigation:
          "Data cleansing em andamento com equipe de TI do cliente. Prazo adicional de 2 semanas reservado no cronograma.",
        owner: "Mariana Costa",
        status: "OPEN",
      },
    ],
  });

  logger.info(`✅ Risks: 3 created`);

  // ─── 7. Report ─────────────────────────────────────────────────────────────
  const report = await prisma.report.upsert({
    where: { id: "report-001" },
    update: {},
    create: {
      id: "report-001",
      projectId: project.id,
      title: "Status Report Executivo — Maio 2025",
      weekOf: new Date("2025-05-05"),
      status: "APPROVED",
      sentAt: new Date("2025-05-06"),
      sentTo: ["stakeholder@techcorp.com"],
    },
  });

  await prisma.reportVersion.create({
    data: {
      reportId: report.id,
      executiveSummary:
        "O projeto SAP S/4HANA está em fase de Execução com 42% de conclusão. Status: ATENÇÃO. Módulos FI e CO entregues e aprovados. Módulo SD com atraso de 2 semanas.",
      mainRisks:
        "1. Atraso integração SD-eCommerce (Alta/Alto) — Em mitigação\n2. Qualidade dos dados para migração (Média/Alto) — Em monitoramento",
      mainBlockers:
        "API VTEX não documentada para pedidos B2B. Aguardando suporte do fornecedor.",
      mitigationSuggestions:
        "Escalar contato com VTEX para nível gerencial. Considerar solução alternativa de integração via middleware.",
      fullContent: `## Resumo Executivo

O projeto de Implementação do SAP S/4HANA encontra-se em fase de **Execução**, com 42% de conclusão e status geral de **Atenção**.

## Situação Atual

Os módulos FI e CO foram entregues dentro do prazo e aprovados em UAT com 45 usuários-chave. O módulo SD apresenta atraso de 2 semanas devido à complexidade da integração com a plataforma eCommerce VTEX.

## Indicadores

| Dimensão | Status |
|---|---|
| Cronograma | 🟡 Atenção — SD com 2 semanas de atraso |
| Orçamento | 🟢 No Prazo — 40% de 1.2M BRL consumido |
| Escopo | 🟢 No Prazo — Sem alterações |
| Qualidade | 🟢 No Prazo — FI/CO aprovados em UAT |

## Realizações (últimas 2 semanas)

- ✅ Aprovação final dos módulos FI e CO em UAT
- ✅ Kickoff do programa de Gestão de Mudança (200 usuários mapeados)
- ✅ Extração dos dados legados concluída (45.000 registros)

## Próximos 30 dias

1. Resolver integração SD-eCommerce (prazo: 01/Jun) — Rafael Souza
2. Concluir testes de carga no ambiente QA — Mariana Costa
3. Iniciar migração de dados financeiros (120.000 registros)
4. Apresentar cronograma revisado ao comitê executivo`,
      isAIGenerated: false,
      editedByHuman: true,
    },
  }).catch(() => {});

  logger.info(`✅ Report + ReportVersion: created`);

  logger.info("\n🎉 Seed complete!");
  logger.info("\n📋 Test credentials (password for all: Fluo@2025):");
  logger.info("  PM:          pm@fluodelivery.com");
  logger.info("  Stakeholder: stakeholder@techcorp.com");
  logger.info("  Resource 1:  dev1@techcorp.com (Mariana Costa)");
  logger.info("  Resource 2:  dev2@techcorp.com (Rafael Souza)");
}

main()
  .catch((e) => {
    logger.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
