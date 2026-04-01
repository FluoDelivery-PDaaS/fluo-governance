# Fluo Governance — Project Delivery SaaS

**AI-native Project Governance Platform** — Portable, self-hosted, no vendor lock-in.

## Stack
- **Backend:** Node.js + Express + TypeScript + Prisma ORM + PostgreSQL
- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS
- **AI:** OpenAI API (GPT-4o) for automated status report generation
- **Auth:** JWT (self-contained, no OAuth dependency)
- **Email:** Resend API
- **Infra:** Docker + docker-compose

## Structure
```
fluo-governance/
├── backend/          # Express API + Prisma
│   ├── prisma/       # Schema & migrations
│   └── src/
│       ├── modules/  # auth, projects, tasks, status, reports, ai, notifications
│       └── middleware/
├── frontend/
│   └── app/          # React SPA
│       └── src/
│           ├── pages/    # pm/, stakeholder/, resource/, auth/
│           ├── contexts/ # AuthContext
│           └── lib/      # API client
└── docker-compose.yml
```

## Quick Start (Local)
```bash
# 1. Copy env files
cp .env.example .env
cp backend/.env.example backend/.env

# 2. Start services
docker-compose up -d

# 3. Run migrations & seed
cd backend && pnpm db:migrate && pnpm db:seed

# 4. Start dev servers
pnpm dev
```

## User Roles
| Role | Access |
|---|---|
| `PROJECT_MANAGER` | Full CRUD on projects, tasks, reports, risks |
| `STAKEHOLDER` | Read-only view of project status, reports, risks |
| `RESOURCE` | View assigned tasks, submit status updates |

## AI Report Generation
The `/api/reports/generate` endpoint uses OpenAI GPT-4o to generate executive status reports based on project data (tasks, risks, recent updates). Reports are reviewed and approved by the PM before being shared with stakeholders.

## Portability
This project has **zero dependencies** on Manus, Vercel, Railway, or any managed platform. It runs on any Linux server with Docker installed. All credentials are environment variables.

---
Built by [Fluo Delivery](https://fluodelivery.com) — Project Delivery as a Service
