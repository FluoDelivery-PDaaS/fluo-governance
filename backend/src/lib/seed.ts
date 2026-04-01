import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "./prisma";
import { logger } from "./logger";

async function main() {
  logger.info("🌱 Seeding database...");

  // Create users
  const pmHash = await bcrypt.hash("Fluo@2025!", 12);
  const stHash = await bcrypt.hash("Client@2025!", 12);
  const resHash = await bcrypt.hash("Resource@2025!", 12);

  const pm = await prisma.user.upsert({
    where: { email: "pm@fluodelivery.com" },
    update: {},
    create: {
      email: "pm@fluodelivery.com",
      passwordHash: pmHash,
      name: "Alessandro Bax",
      role: "PROJECT_MANAGER",
    },
  });

  const stakeholder = await prisma.user.upsert({
    where: { email: "cliente@techcorp.com.br" },
    update: {},
    create: {
      email: "cliente@techcorp.com.br",
      passwordHash: stHash,
      name: "Carlos Mendes",
      role: "STAKEHOLDER",
    },
  });

  const resource = await prisma.user.upsert({
    where: { email: "dev@fluodelivery.com" },
    update: {},
    create: {
      email: "dev@fluodelivery.com",
      passwordHash: resHash,
      name: "Ana Lima",
      role: "RESOURCE",
    },
  });

  logger.info(`✅ Users: ${pm.email}, ${stakeholder.email}, ${resource.email}`);

  // Create project
  const project = await prisma.project.upsert({
    where: { id: "demo-project-001" },
    update: {},
    create: {
      id: "demo-project-001",
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
          { userId: resource.id, role: "RESOURCE" },
        ],
      },
    },
  });

  // Create milestones
  const m1 = await prisma.milestone.upsert({
    where: { id: "demo-milestone-001" },
    update: {},
    create: {
      id: "demo-milestone-001",
      projectId: project.id,
      name: "Fase 1 — Blueprint e Design",
      description: "Levantamento de requisitos, design da solução e aprovação do blueprint",
      dueDate: new Date("2025-03-31"),
      completed: true,
      completedAt: new Date("2025-03-28"),
    },
  });

  const m2 = await prisma.milestone.upsert({
    where: { id: "demo-milestone-002" },
    update: {},
    create: {
      id: "demo-milestone-002",
      projectId: project.id,
      name: "Fase 2 — Configuração e Desenvolvimento",
      description: "Configuração dos módulos, desenvolvimentos customizados e integrações",
      dueDate: new Date("2025-06-30"),
      completed: false,
    },
  });

  const m3 = await prisma.milestone.upsert({
    where: { id: "demo-milestone-003" },
    update: {},
    create: {
      id: "demo-milestone-003",
      projectId: project.id,
      name: "Fase 3 — Testes e Go-Live",
      description: "UAT, migração de dados, treinamento e go-live",
      dueDate: new Date("2025-09-30"),
      completed: false,
    },
  });

  // Create tasks
  const tasks = [
    {
      id: "demo-task-001",
      title: "Configuração módulo FI/CO",
      status: "COMPLETED" as const,
      priority: "HIGH" as const,
      milestoneId: m1.id,
      assigneeId: resource.id,
      dueDate: new Date("2025-03-15"),
    },
    {
      id: "demo-task-002",
      title: "Desenvolvimento integração SD-eCommerce",
      status: "AT_RISK" as const,
      priority: "CRITICAL" as const,
      milestoneId: m2.id,
      assigneeId: resource.id,
      dueDate: new Date("2025-05-30"),
    },
    {
      id: "demo-task-003",
      title: "Migração de dados legados",
      status: "ON_TRACK" as const,
      priority: "HIGH" as const,
      milestoneId: m2.id,
      assigneeId: resource.id,
      dueDate: new Date("2025-06-15"),
    },
    {
      id: "demo-task-004",
      title: "Programa de Gestão de Mudança (OCM)",
      status: "ON_TRACK" as const,
      priority: "MEDIUM" as const,
      milestoneId: m2.id,
      assigneeId: pm.id,
      dueDate: new Date("2025-07-31"),
    },
  ];

  for (const task of tasks) {
    await prisma.task.upsert({
      where: { id: task.id },
      update: {},
      create: { ...task, projectId: project.id },
    });
  }

  // Create risks
  await prisma.risk.createMany({
    skipDuplicates: true,
    data: [
      {
        projectId: project.id,
        title: "Atraso nas integrações SD-eCommerce",
        description: "Complexidade técnica da integração com a plataforma eCommerce pode causar atraso de 3-4 semanas na entrega da Fase 2.",
        probability: "HIGH",
        impact: "HIGH",
        mitigation: "Alocação de recurso adicional especialista em SAP SD. Reunião semanal de acompanhamento técnico.",
        owner: "Alessandro Bax",
        status: "OPEN",
      },
      {
        projectId: project.id,
        title: "Resistência à mudança dos usuários-chave",
        description: "Usuários do departamento financeiro demonstram resistência ao novo sistema, podendo impactar o UAT.",
        probability: "MEDIUM",
        impact: "MEDIUM",
        mitigation: "Programa de treinamento antecipado e workshops de engajamento com líderes de área.",
        owner: "Alessandro Bax",
        status: "MITIGATED",
      },
      {
        projectId: project.id,
        title: "Qualidade dos dados para migração",
        description: "Dados legados apresentam inconsistências que podem comprometer a migração e exigir retrabalho.",
        probability: "MEDIUM",
        impact: "HIGH",
        mitigation: "Execução de data cleansing antecipado com equipe de TI do cliente.",
        owner: "Ana Lima",
        status: "OPEN",
      },
    ],
  });

  // Create status updates
  await prisma.statusUpdate.createMany({
    skipDuplicates: true,
    data: [
      {
        projectId: project.id,
        taskId: "demo-task-002",
        userId: resource.id,
        status: "AT_RISK",
        progressSummary: "A integração SD-eCommerce encontrou complexidade adicional na API de pedidos. Estimativa revisada para +2 semanas.",
        blockers: "API do eCommerce não está documentada conforme esperado. Aguardando suporte do fornecedor.",
        supportNeeded: "Necessário contato urgente com fornecedor do eCommerce para documentação da API.",
        progressPercent: 35,
      },
      {
        projectId: project.id,
        taskId: "demo-task-003",
        userId: resource.id,
        status: "ON_TRACK",
        progressSummary: "Extração dos dados legados concluída. Iniciando processo de validação e limpeza dos dados financeiros.",
        progressPercent: 60,
      },
    ],
  });

  logger.info("✅ Seed completed successfully!");
  logger.info("\n📋 Test credentials:");
  logger.info("  PM:          pm@fluodelivery.com / Fluo@2025!");
  logger.info("  Stakeholder: cliente@techcorp.com.br / Client@2025!");
  logger.info("  Resource:    dev@fluodelivery.com / Resource@2025!");
}

main()
  .catch((e) => { logger.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
