import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  AlertTriangle,
  Users,
  Shield,
  Target,
  Zap,
  Award,
  Calendar,
  MessageSquare,
  TrendingUp,
  ChevronRight,
  Mail,
  Phone,
  Linkedin,
  BarChart3,
  Cpu,
  GitMerge,
  Database,
  Settings,
  FileText,
} from "lucide-react";

const HERO_IMAGE = "https://d2xsxph8kpxj0f.cloudfront.net/310519663282601428/gBUW2qwYCHjGjjNLs4vZSm/capa_img_d866544b.jpg";

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    position: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        toast.success("Mensagem enviada com sucesso! Entraremos em contato em breve.");
        setFormData({ name: "", email: "", company: "", position: "", message: "" });
      } else {
        toast.error("Erro ao enviar mensagem. Tente novamente.");
      }
    } catch {
      toast.error("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const scrollToContact = () => {
    document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Inter', sans-serif", background: "#ffffff" }}>

      {/* Navigation */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg border-b"
        style={{ background: "rgba(30,58,95,0.95)", borderColor: "rgba(59,130,246,0.2)" }}
      >
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Fluo Delivery" className="w-8 h-8 object-contain" />
            <span className="text-xl font-bold text-white">
              Fluo<span style={{ color: "#60A5FA" }}>Delivery</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {[
              { href: "#problema", label: "O Problema" },
              { href: "#solucao", label: "A Solução" },
              { href: "#diferenciais", label: "Diferenciais" },
              { href: "#projetos", label: "Projetos" },
              { href: "#contratacao", label: "Contratação" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm transition-colors"
                style={{ color: "rgba(255,255,255,0.65)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#60A5FA")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "rgba(255,255,255,0.65)")}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-full border transition-colors"
              style={{ color: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.2)" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
            >
              Entrar
            </a>
            <Button
              onClick={scrollToContact}
              className="rounded-full px-6 text-white font-semibold"
              style={{ background: "#3B82F6" }}
            >
              Fale Conosco
            </Button>
          </div>
        </div>
      </nav>

      {/* ─── HERO BANNER ─── */}
      <section
        className="relative overflow-hidden"
        style={{
          minHeight: "100vh",
          background: "#1E3A5F",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top accent bar */}
        <div style={{ height: "5px", background: "linear-gradient(90deg, #3B82F6, #60A5FA)", flexShrink: 0 }} />

        {/* Background glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 70%)",
            left: "-100px",
            bottom: "-100px",
          }}
        />

        <div className="flex flex-1 items-center" style={{ paddingTop: "80px" }}>
          <div className="container">
            <div className="flex items-center gap-0" style={{ minHeight: "80vh" }}>

              {/* Left: text content */}
              <div className="flex-1 flex flex-col gap-6 py-16" style={{ paddingRight: "60px" }}>
                <div
                  className="inline-flex items-center gap-2 self-start"
                  style={{
                    background: "rgba(8,145,178,0.15)",
                    border: "1px solid rgba(8,145,178,0.35)",
                    borderRadius: "20px",
                    padding: "6px 16px",
                    color: "#38bdf8",
                    fontSize: "12px",
                    fontWeight: 700,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                  }}
                >
                  <Zap className="w-3 h-3" />
                  Project Delivery as a Service
                </div>

                <h1
                  className="font-bold leading-none"
                  style={{ fontSize: "clamp(48px, 6vw, 80px)", color: "#ffffff", letterSpacing: "-2px" }}
                >
                  Fluo Delivery
                </h1>

                <div
                  style={{ width: "64px", height: "4px", background: "linear-gradient(90deg, #3B82F6, #60A5FA)" }}
                />

                <p
                  style={{
                    fontSize: "clamp(16px, 2vw, 22px)",
                    color: "rgba(255,255,255,0.75)",
                    lineHeight: 1.6,
                    maxWidth: "520px",
                    fontWeight: 400,
                  }}
                >
                  Entregamos previsibilidade na execução de projetos de tecnologia.
                </p>

                <p style={{ fontSize: "16px", color: "rgba(255,255,255,0.55)", lineHeight: 1.7, maxWidth: "480px" }}>
                  Assumimos a responsabilidade completa pela entrega dos seus projetos.
                  Você foca na estratégia — nós garantimos o resultado.
                </p>

                <div className="flex flex-wrap gap-4" style={{ marginTop: "8px" }}>
                  <Button
                    onClick={scrollToContact}
                    size="lg"
                    className="rounded-full text-white font-semibold"
                    style={{ background: "#3B82F6", padding: "0 32px", height: "52px", fontSize: "16px" }}
                  >
                    Agendar Diagnóstico Gratuito
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="rounded-full font-semibold"
                    style={{
                      padding: "0 32px",
                      height: "52px",
                      fontSize: "16px",
                      background: "transparent",
                      border: "1px solid rgba(255,255,255,0.25)",
                      color: "rgba(255,255,255,0.8)",
                    }}
                    onClick={() => document.getElementById("solucao")?.scrollIntoView({ behavior: "smooth" })}
                  >
                    Como Funciona
                  </Button>
                </div>
              </div>

              {/* Right: hero image with blend */}
              <div
                className="hidden lg:block relative overflow-hidden flex-shrink-0"
                style={{ width: "440px", alignSelf: "stretch" }}
              >
                <img
                  src={HERO_IMAGE}
                  alt="Equipe de tecnologia"
                  style={{ width: "440px", height: "100%", objectFit: "cover", objectPosition: "center top", display: "block" }}
                />
                {/* Left-to-right blend overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to right, #1E3A5F 0%, rgba(30,58,95,0.7) 20%, rgba(30,58,95,0.1) 50%, transparent 100%)",
                  }}
                />
                {/* Vertical accent line */}
                <div
                  className="absolute"
                  style={{
                    top: "60px",
                    left: 0,
                    width: "3px",
                    height: "calc(100% - 120px)",
                    background: "linear-gradient(180deg, transparent, #3B82F6 20%, #60A5FA 80%, transparent)",
                  }}
                />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ─── O PROBLEMA ─── */}
      <section id="problema" className="section-padding" style={{ background: "#1E3A5F" }}>
        <div className="container">
          <div className="max-w-3xl mx-auto text-center" style={{ marginBottom: "56px" }}>
            <div
              className="inline-flex items-center gap-2 self-start mx-auto"
              style={{
                background: "rgba(8,145,178,0.15)",
                border: "1px solid rgba(8,145,178,0.35)",
                borderRadius: "20px",
                padding: "5px 14px",
                color: "#38bdf8",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              O Problema do Mercado
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#ffffff" }}>
              Por que projetos de tecnologia falham?
            </h2>
            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
              Empresas de tecnologia enfrentam desafios críticos que comprometem a entrega de projetos
              e geram custos ocultos significativos.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Clock,
                title: "Projetos que Fracassam",
                description: "28% dos projetos de tecnologia falham em atingir suas metas de negócio.",
                stat: "28%",
                source: "PMI Pulse 2023",
                link: "https://www.pmi.org/about/press-media/2022/pulse-of-the-profession-2023",
              },
              {
                icon: DollarSign,
                title: "Prejuízos Globais",
                description: "$2 trilhões desperdiçados anualmente em projetos mal gerenciados.",
                stat: "$2T",
                source: "PMI 2018",
                link: "https://www.pmi.org/-/media/pmi/documents/public/pdf/learning/thought-leadership/pulse/pulse-of-the-profession-2018.pdf",
              },
              {
                icon: AlertTriangle,
                title: "Risco Trabalhista",
                description: "285 mil processos de pejotização em 2024, crescimento de 57% vs 2023.",
                stat: "+57%",
                source: "TST/CNN Brasil",
                link: "https://www.cnnbrasil.com.br/economia/macroeconomia/pejotizacao-processos-que-pedem-vinculo-de-emprego-crescem-57-em-2024/",
              },
              {
                icon: Users,
                title: "Turnover em TI",
                description: "15% de rotatividade anual no setor. Cada saída custa até 2x o salário.",
                stat: "15%",
                source: "SUPERO",
                link: "https://www.supero.com.br/turnover-em-ti-o-que-fazer-para-evita-lo/",
              },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "12px",
                  padding: "24px",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    background: "rgba(59,130,246,0.15)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <item.icon style={{ width: "22px", height: "22px", color: "#60A5FA" }} />
                </div>
                <div style={{ fontSize: "32px", fontWeight: 900, color: "#60A5FA", marginBottom: "8px" }}>{item.stat}</div>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#ffffff", marginBottom: "8px" }}>{item.title}</h3>
                <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginBottom: "12px" }}>{item.description}</p>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: "11px", color: "#38bdf8", display: "flex", alignItems: "center", gap: "4px" }}
                >
                  Fonte: {item.source}
                  <ChevronRight style={{ width: "12px", height: "12px" }} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── A SOLUÇÃO ─── */}
      <section id="solucao" className="section-padding" style={{ background: "#ffffff" }}>
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <div
                className="inline-flex items-center gap-2"
                style={{
                  background: "rgba(59,130,246,0.08)",
                  border: "1px solid rgba(59,130,246,0.2)",
                  borderRadius: "20px",
                  padding: "5px 14px",
                  color: "#3B82F6",
                  fontSize: "12px",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  marginBottom: "20px",
                  display: "inline-flex",
                }}
              >
                <Target className="w-3 h-3" />
                O que a Fluo faz
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6" style={{ color: "#1E3A5F" }}>
                Project Delivery as a Service
              </h2>
              <p style={{ fontSize: "17px", color: "#64748B", lineHeight: 1.7, marginBottom: "28px" }}>
                Um modelo onde assumimos a <strong style={{ color: "#1E3A5F" }}>responsabilidade completa</strong> pela
                entrega do seu projeto. Não vendemos horas ou alocação de pessoas — vendemos resultado.
              </p>
              <div className="space-y-4">
                {[
                  "Responsabilidade única pela entrega",
                  "Equipe sênior especializada sob demanda",
                  "Risco compartilhado — skin in the game",
                  "Metodologia comprovada de gestão (PMP®)",
                  "Governança executiva desde o dia 1",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle2 style={{ width: "20px", height: "20px", color: "#3B82F6", flexShrink: 0 }} />
                    <span style={{ color: "#374151", fontSize: "15px" }}>{item}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={scrollToContact}
                className="mt-8 rounded-full text-white font-semibold"
                style={{ background: "#3B82F6", padding: "0 28px", height: "48px" }}
              >
                Quero Saber Mais
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </div>

          </div>
        </div>
      </section>

      {/* ─── DIFERENCIAIS ─── */}
      <section id="diferenciais" className="section-padding" style={{ background: "#F8FAFC" }}>
        <div className="container">
          <div className="max-w-3xl mx-auto text-center" style={{ marginBottom: "56px" }}>
            <div
              className="inline-flex items-center gap-2 mx-auto"
              style={{
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: "20px",
                padding: "5px 14px",
                color: "#3B82F6",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              5 Pilares
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#1E3A5F" }}>
              Diferenciais da Fluo
            </h2>
            <p style={{ fontSize: "17px", color: "#64748B", lineHeight: 1.7 }}>
              Cinco pilares que garantem a entrega dos seus projetos com qualidade e previsibilidade.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: "Risco Compartilhado",
                description:
                  "Parte da nossa remuneração está atrelada ao sucesso do projeto. Temos skin in the game — seu sucesso é o nosso sucesso.",
                accent: "#3B82F6",
              },
              {
                icon: Users,
                title: "Equipe Sob Demanda",
                description:
                  "Montamos a equipe ideal para cada projeto. Se alguém sair, repomos sem custo adicional. Você nunca fica na mão.",
                accent: "#0891B2",
              },
              {
                icon: Award,
                title: "Governança Executiva",
                description:
                  "Rituais de gestão, relatórios periódicos e comunicação transparente em todos os níveis — operacional, tático e estratégico.",
                accent: "#3B82F6",
              },
              {
                icon: TrendingUp,
                title: "Continuidade Garantida",
                description:
                  "Eliminamos o risco de turnover. A entrega não para por saída de pessoas — a responsabilidade é da Fluo, não do indivíduo.",
                accent: "#0891B2",
              },
              {
                icon: DollarSign,
                title: "Previsibilidade Financeira",
                description:
                  "Contratos com escopo e preço definidos. Sem surpresas, sem horas extras não previstas, sem renegociações constantes.",
                accent: "#3B82F6",
              },
              {
                icon: Target,
                title: "Responsabilidade Única",
                description:
                  "Um único ponto de contato e accountability. Você não gerencia múltiplos fornecedores — a Fluo é responsável pelo todo.",
                accent: "#0891B2",
              },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#ffffff",
                  borderRadius: "12px",
                  padding: "28px",
                  border: "1px solid rgba(30,58,95,0.08)",
                  boxShadow: "0 1px 4px rgba(30,58,95,0.06)",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "10px",
                    background: `${item.accent}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                  }}
                >
                  <item.icon style={{ width: "22px", height: "22px", color: item.accent }} />
                </div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, color: "#1E3A5F", marginBottom: "10px" }}>{item.title}</h3>
                <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.65 }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TIPOS DE PROJETOS ─── */}
      <section id="projetos" className="section-padding" style={{ background: "#1E3A5F" }}>
        <div className="container">
          <div className="max-w-3xl mx-auto text-center" style={{ marginBottom: "56px" }}>
            <div
              className="inline-flex items-center gap-2 mx-auto"
              style={{
                background: "rgba(8,145,178,0.15)",
                border: "1px solid rgba(8,145,178,0.35)",
                borderRadius: "20px",
                padding: "5px 14px",
                color: "#38bdf8",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Nossa Atuação
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#ffffff" }}>
              Tipos de Projetos
            </h2>
            <p style={{ fontSize: "17px", color: "rgba(255,255,255,0.6)", lineHeight: 1.7 }}>
              Atuamos em projetos complexos de tecnologia e transformação digital em empresas de médio e grande porte.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Cpu, title: "Desenvolvimento de Software", desc: "Sistemas customizados, plataformas digitais e produtos de tecnologia end-to-end." },
              { icon: Zap, title: "Transformação Digital", desc: "Modernização de processos, digitalização de operações e mudança de cultura organizacional." },
              { icon: Settings, title: "Implementação de Sistemas", desc: "ERP, CRM, SaaS e plataformas corporativas — da configuração ao go-live." },
              { icon: GitMerge, title: "Integração de Sistemas", desc: "Conectividade entre plataformas, APIs, middlewares e arquiteturas de dados distribuídas." },
              { icon: Database, title: "Projetos de BI, Dados e IA", desc: "Data warehouses, dashboards executivos, modelos preditivos e automação inteligente." },
              { icon: BarChart3, title: "Melhoria de Processos", desc: "Redesenho de fluxos operacionais, automação e otimização de eficiência organizacional." },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: "12px",
                  padding: "24px",
                  display: "flex",
                  gap: "16px",
                  alignItems: "flex-start",
                }}
              >
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: "rgba(56,189,248,0.12)",
                    border: "1px solid rgba(56,189,248,0.2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <item.icon style={{ width: "20px", height: "20px", color: "#38bdf8" }} />
                </div>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#ffffff", marginBottom: "6px" }}>{item.title}</h3>
                  <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMO FUNCIONA ─── */}
      <section className="section-padding" style={{ background: "#ffffff" }}>
        <div className="container">
          <div className="max-w-3xl mx-auto text-center" style={{ marginBottom: "56px" }}>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#1E3A5F" }}>
              Como Funciona
            </h2>
            <p style={{ fontSize: "17px", color: "#64748B", lineHeight: 1.7 }}>
              Um processo simples e transparente para começar a trabalhar juntos.
            </p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", icon: MessageSquare, title: "Diagnóstico", description: "Conversa inicial gratuita para entender seu contexto, desafios e objetivos." },
              { step: "02", icon: Target, title: "Proposta", description: "Apresentamos uma proposta personalizada com escopo, prazo e investimento." },
              { step: "03", icon: Calendar, title: "Kick-off", description: "Alinhamento de expectativas, setup de ferramentas e início da operação." },
              { step: "04", icon: TrendingUp, title: "Entrega", description: "Execução com rituais semanais, transparência total e foco no resultado." },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "24px",
                    border: "1px solid rgba(30,58,95,0.1)",
                    boxShadow: "0 1px 4px rgba(30,58,95,0.06)",
                    height: "100%",
                  }}
                >
                  <div style={{ fontSize: "48px", fontWeight: 900, color: "rgba(59,130,246,0.08)", marginBottom: "12px", lineHeight: 1 }}>
                    {item.step}
                  </div>
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      background: "#3B82F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "16px",
                    }}
                  >
                    <item.icon style={{ width: "18px", height: "18px", color: "#ffffff" }} />
                  </div>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#1E3A5F", marginBottom: "8px" }}>{item.title}</h3>
                  <p style={{ fontSize: "13px", color: "#64748B", lineHeight: 1.6 }}>{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ChevronRight style={{ width: "24px", height: "24px", color: "rgba(59,130,246,0.3)" }} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── MODELO DE CONTRATAÇÃO ─── */}
      <section id="contratacao" className="section-padding" style={{ background: "#F8FAFC" }}>
        <div className="container">
          <div className="max-w-3xl mx-auto text-center" style={{ marginBottom: "56px" }}>
            <div
              className="inline-flex items-center gap-2 mx-auto"
              style={{
                background: "rgba(59,130,246,0.08)",
                border: "1px solid rgba(59,130,246,0.2)",
                borderRadius: "20px",
                padding: "5px 14px",
                color: "#3B82F6",
                fontSize: "11px",
                fontWeight: 700,
                letterSpacing: "1px",
                textTransform: "uppercase",
                marginBottom: "16px",
              }}
            >
              Flexibilidade
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#1E3A5F" }}>
              Modelo de Contratação
            </h2>
            <p style={{ fontSize: "17px", color: "#64748B", lineHeight: 1.7 }}>
              Dois formatos de engajamento para se adaptar ao seu contexto e necessidade.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: FileText,
                title: "Projeto Fechado",
                subtitle: "Escopo definido, preço fixo",
                description:
                  "Ideal para projetos com escopo bem definido. Entregamos o resultado acordado dentro do prazo e orçamento estabelecidos, sem surpresas.",
                items: ["Escopo detalhado no contrato", "Preço e prazo fixos", "Marcos de entrega claros", "Relatórios periódicos de progresso"],
                accent: "#3B82F6",
              },
              {
                icon: Calendar,
                title: "Retainer Mensal",
                subtitle: "Parceria contínua e estratégica",
                description:
                  "Ideal para empresas que precisam de capacidade de delivery contínua. Um time dedicado à sua disposição, com governança e rituais mensais.",
                items: ["Capacidade mensal acordada", "Flexibilidade de escopo", "Reuniões de alinhamento mensais", "Relatórios executivos mensais"],
                accent: "#0891B2",
              },
            ].map((item, index) => (
              <div
                key={index}
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "36px",
                  border: `2px solid ${item.accent}20`,
                  boxShadow: "0 2px 8px rgba(30,58,95,0.08)",
                }}
              >
                <div
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "12px",
                    background: `${item.accent}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "20px",
                  }}
                >
                  <item.icon style={{ width: "24px", height: "24px", color: item.accent }} />
                </div>
                <h3 style={{ fontSize: "22px", fontWeight: 800, color: "#1E3A5F", marginBottom: "4px" }}>{item.title}</h3>
                <p style={{ fontSize: "13px", color: item.accent, fontWeight: 600, marginBottom: "16px" }}>{item.subtitle}</p>
                <p style={{ fontSize: "14px", color: "#64748B", lineHeight: 1.7, marginBottom: "20px" }}>{item.description}</p>
                <div className="space-y-2">
                  {item.items.map((point, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <CheckCircle2 style={{ width: "16px", height: "16px", color: item.accent, flexShrink: 0 }} />
                      <span style={{ fontSize: "14px", color: "#374151" }}>{point}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CONTATO ─── */}
      <section id="contato" className="section-padding" style={{ background: "#1E3A5F" }}>
        <div className="container">
          <div className="max-w-5xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: "#ffffff" }}>
                  Fale com a Fluo
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "rgba(59,130,246,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Mail style={{ width: "18px", height: "18px", color: "#60A5FA" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Email</div>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff" }}>contato@fluodelivery.com</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "rgba(59,130,246,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Phone style={{ width: "18px", height: "18px", color: "#60A5FA" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>Telefone</div>
                      <div style={{ fontSize: "15px", fontWeight: 600, color: "#ffffff" }}>+55 (31) 99621-1810</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div
                      style={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        background: "rgba(59,130,246,0.15)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Linkedin style={{ width: "18px", height: "18px", color: "#60A5FA" }} />
                    </div>
                    <div>
                      <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>LinkedIn</div>
                      <a
                        href="https://www.linkedin.com/in/fluo-delivery-86859a3b1/"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: "15px", fontWeight: 600, color: "#60A5FA" }}
                      >
                        Fluo Delivery
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "36px",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
                }}
              >
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nome *</Label>
                      <Input id="name" placeholder="Seu nome" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input id="email" type="email" placeholder="seu@email.com" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required className="rounded-xl" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="company">Empresa *</Label>
                      <Input id="company" placeholder="Nome da empresa" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} required className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position">Cargo</Label>
                      <Input id="position" placeholder="Seu cargo" value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="message">Mensagem *</Label>
                    <Textarea id="message" placeholder="Conte-nos sobre seu projeto ou desafio..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} required rows={4} className="rounded-xl resize-none" />
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full text-white rounded-xl font-semibold"
                    style={{ background: "#3B82F6", height: "52px", fontSize: "16px" }}
                  >
                    {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <p className="text-xs text-center" style={{ color: "#94A3B8" }}>
                    Ao enviar, você concorda com nossa política de privacidade.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={{ background: "#0F2440", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "32px 0" }}>
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src="/logo-icon.png" alt="Fluo Delivery" className="w-7 h-7 object-contain" />
            <span style={{ fontSize: "15px", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>
              Fluo<span style={{ color: "#60A5FA" }}>Delivery</span>
            </span>
          </div>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)" }}>
            © {new Date().getFullYear()} Fluo Delivery. Todos os direitos reservados.
          </p>
          <a
            href="https://www.linkedin.com/in/fluo-delivery-86859a3b1/"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "13px", color: "#60A5FA", display: "flex", alignItems: "center", gap: "6px" }}
          >
            <Linkedin style={{ width: "16px", height: "16px" }} />
            LinkedIn
          </a>
        </div>
      </footer>

    </div>
  );
}
