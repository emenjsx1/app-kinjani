import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Bot,
  Layers,
  Cpu,
  Factory,
  Shield,
  Users,
  TrendingUp,
  CheckCircle2,
  Globe,
  Sparkles,
  MessageSquare,
  Zap,
  Star,
  Play,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { isPlatformHost } from "@/lib/domain";
import PublicWebsitePage from "./PublicWebsitePage";

export default function Index() {
  const host = window.location.host;
  if (!isPlatformHost(host)) {
    return <PublicWebsitePage />;
  }

  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-[#011612] text-[#cfe8e1] font-sans antialiased overflow-x-hidden relative">
      {/* Aurora Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[700px] bg-[radial-gradient(circle_at_50%_-10%,rgba(69,253,148,0.18)_0%,transparent_55%)]" />
        <div className="absolute bottom-0 left-0 w-full h-[500px] bg-[radial-gradient(circle_at_0%_100%,rgba(9,83,68,0.25)_0%,transparent_45%)]" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_100%_50%,rgba(69,253,148,0.06)_0%,transparent_50%)]" />
      </div>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#021713]/80 backdrop-blur-xl border-b border-[#095344]/30 h-16 flex justify-between items-center px-6 md:px-12">
        <div className="flex items-center gap-8">
          <Link to="/" className="text-xl font-extrabold text-[#45fd94] tracking-tight flex items-center gap-2">
            <Bot className="h-6 w-6" />
            Kinjani AI
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-[#45fd94] font-bold border-b-2 border-[#45fd94] pb-0.5 text-xs uppercase tracking-wider" href="#">Início</a>
            <a className="text-[#bacbba] hover:text-[#45fd94] transition-all text-xs uppercase tracking-wider" href="#features">Funcionalidades</a>
            <a className="text-[#bacbba] hover:text-[#45fd94] transition-all text-xs uppercase tracking-wider" href="#pricing">Preços</a>
            <a className="text-[#bacbba] hover:text-[#45fd94] transition-all text-xs uppercase tracking-wider" href="#about">Sobre</a>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/auth" className="hidden sm:block text-[#bacbba] hover:text-[#45fd94] transition-colors text-sm font-medium px-4 py-2">
            Entrar
          </Link>
          <Button asChild className="bg-[#45fd94] hover:bg-[#30a684] text-[#011612] px-5 py-2 rounded-full font-bold text-xs uppercase tracking-wider hover:shadow-[0_0_20px_-5px_rgba(69,253,148,0.5)] transition-all active:scale-95">
            <Link to="/auth">Começar Grátis</Link>
          </Button>
        </div>
      </header>

      <main className="relative z-10">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="min-h-screen flex flex-col items-center justify-center pt-28 pb-16 px-6">
          <div className="max-w-5xl text-center">
            {/* Live badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#095344]/40 bg-[#081f1b] mb-8">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#45fd94] opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#45fd94]" />
              </span>
              <span className="text-xs uppercase tracking-widest text-[#aacbc4]">Plataforma em direto · Moçambique</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-[#45fd94] to-[#30a684] tracking-tight leading-[1.08] mb-6">
              Crie Agentes IA <br className="hidden md:block" />
              <span className="text-white">que Trabalham</span> por Ti
            </h1>

            <p className="text-base md:text-xl text-[#aacbc4] max-w-2xl mx-auto mb-10 leading-relaxed">
              Automatiza o teu negócio com agentes IA personalizados para WhatsApp e Web. 
              Gera websites profissionais, gere clientes e escala — tudo numa única plataforma.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Button asChild className="bg-[#45fd94] hover:bg-[#30a684] text-[#011612] px-8 py-6 rounded-xl font-bold text-sm hover:shadow-[0_0_30px_-5px_rgba(69,253,148,0.6)] transition-all flex items-center gap-2 group w-full sm:w-auto">
                <Link to="/auth">
                  Começar Gratuitamente
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="border border-[#095344]/50 text-[#cfe8e1] px-8 py-6 rounded-xl font-bold text-sm bg-transparent hover:bg-[#095344]/20 transition-all flex items-center gap-2 w-full sm:w-auto">
                <Link to="/demo">
                  <Play className="h-4 w-4" />
                  Ver Demo
                </Link>
              </Button>
            </div>

            {/* Social proof stats */}
            <div className="flex flex-wrap items-center justify-center gap-8 mb-16">
              {[
                { value: "500+", label: "Agentes Criados" },
                { value: "98%", label: "Taxa de Uptime" },
                { value: "3min", label: "Para o 1º Agente" },
                { value: "24/7", label: "Operação Contínua" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl font-black text-[#45fd94] font-mono">{stat.value}</p>
                  <p className="text-xs text-[#aacbc4] uppercase tracking-wider mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero dashboard preview */}
          <div className="w-full max-w-5xl relative">
            <div className="absolute -inset-2 bg-gradient-to-r from-[#095344]/20 via-[#45fd94]/10 to-[#095344]/20 blur-3xl opacity-50 rounded-3xl" />
            <div className="relative bg-[#021f1b]/70 backdrop-blur-xl rounded-2xl border border-[#095344]/30 overflow-hidden shadow-[0_0_60px_-20px_rgba(69,253,148,0.2)]">
              {/* Mock dashboard bar */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-[#095344]/20 bg-[#011612]/50">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-[#45fd94]/60" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#081f1b] border border-[#095344]/20 text-[10px] text-[#aacbc4]">
                  <span className="w-2 h-2 rounded-full bg-[#45fd94] animate-pulse" />
                  app.kinjani.ai/dashboard
                </div>
                <div className="text-[10px] text-[#45fd94] font-mono">● ONLINE</div>
              </div>

              {/* Dashboard grid preview */}
              <div className="p-6 grid grid-cols-3 gap-4">
                {[
                  { label: "Agentes Ativos", val: "12", color: "text-[#45fd94]" },
                  { label: "Msgs Hoje", val: "2,847", color: "text-[#5ddcb1]" },
                  { label: "Créditos", val: "4,200", color: "text-[#aacbc4]" },
                ].map(s => (
                  <div key={s.label} className="bg-[#011612]/60 rounded-xl border border-[#095344]/20 p-4">
                    <p className={`text-xl font-black font-mono ${s.color}`}>{s.val}</p>
                    <p className="text-[10px] text-[#aacbc4]/70 uppercase tracking-wider mt-1">{s.label}</p>
                    <div className="w-full h-0.5 bg-[#095344]/30 rounded-full mt-3 overflow-hidden">
                      <div className="h-full bg-[#45fd94]/40 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6 grid grid-cols-2 gap-3">
                {["Agente FAQ • WhatsApp ✓", "Agente Vendas • Web ✓", "Agente Leads • WhatsApp ✓", "Agente Suporte • Embed ✓"].map(a => (
                  <div key={a} className="flex items-center gap-3 p-3 rounded-lg bg-[#011612]/40 border border-[#095344]/20">
                    <div className="w-2 h-2 rounded-full bg-[#45fd94] animate-pulse flex-shrink-0" />
                    <span className="text-[11px] text-[#cfe8e1]">{a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Features Bento Grid ─────────────────────────── */}
        <section className="py-20 px-6 md:px-12 max-w-7xl mx-auto" id="features">
          <div className="text-center mb-14">
            <span className="text-xs font-bold tracking-widest text-[#45fd94] uppercase mb-3 block">Plataforma Completa</span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Tudo o que precisas numa única plataforma</h2>
            <p className="text-lg text-[#aacbc4] max-w-xl mx-auto">Do primeiro agente ao ecossistema completo. Sem código, sem complicações.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Fábrica de Agentes — main */}
            <div className="md:col-span-7 bg-[#021f1b]/60 backdrop-blur-xl border border-[#095344]/30 rounded-3xl p-8 relative overflow-hidden group cursor-pointer hover:border-[#45fd94]/50 transition-all min-h-[320px] flex flex-col justify-end"
              onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 30px -10px rgba(69,253,148,0.25)"}
              onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}>
              <div className="absolute top-8 right-8 opacity-20 group-hover:opacity-80 group-hover:scale-110 transition-all duration-500">
                <Bot className="h-24 w-24 text-[#45fd94]" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-[#45fd94]/5 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
              <div className="relative z-10">
                <span className="text-xs font-semibold tracking-widest text-[#45fd94] block mb-3">MÓDULO 01</span>
                <h3 className="text-2xl font-bold text-white mb-3">Fábrica de Agentes IA</h3>
                <p className="text-sm text-[#aacbc4] max-w-md leading-relaxed mb-5">
                  Cria agentes inteligentes para WhatsApp e Web em minutos. FAQ, captura de leads, qualificação, agendamento — a IA faz o trabalho por ti.
                </p>
                <div className="flex flex-wrap gap-2">
                  {["WhatsApp", "GPT-4", "Gemini", "Streaming"].map(t => (
                    <span key={t} className="px-2.5 py-1 rounded-full bg-[#45fd94]/10 border border-[#45fd94]/20 text-[#45fd94] text-[10px] font-bold">{t}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Fábrica de Sites */}
            <div className="md:col-span-5 bg-[#021f1b]/60 backdrop-blur-xl border border-[#095344]/30 border-l-4 border-l-[#45fd94] rounded-3xl p-8 flex flex-col justify-between group cursor-pointer hover:translate-y-[-4px] transition-all min-h-[320px]">
              <div>
                <Globe className="h-10 w-10 text-[#45fd94] mb-6" />
                <h3 className="text-xl font-bold text-white mb-3">Fábrica de Sites</h3>
                <p className="text-sm text-[#aacbc4] leading-relaxed">
                  Gera websites profissionais com IA. Do briefing ao site publicado em menos de 5 minutos. Totalmente personalizável.
                </p>
              </div>
              <div className="pt-6">
                <div className="space-y-2">
                  {["Landing Pages", "Sites Institucionais", "Domínios Customizados"].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs text-[#aacbc4]">
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#45fd94] flex-shrink-0" />
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* WhatsApp Integration */}
            <div className="md:col-span-5 bg-[#021f1b]/60 backdrop-blur-xl border border-[#095344]/30 rounded-3xl p-8 flex flex-col justify-center group cursor-pointer hover:bg-white/5 transition-all min-h-[260px]">
              <MessageSquare className="h-10 w-10 text-[#25d366] mb-6" />
              <h3 className="text-xl font-bold text-white mb-3">WhatsApp Business API</h3>
              <p className="text-sm text-[#aacbc4] mb-4 leading-relaxed">
                Conecta instâncias WhatsApp reais. Os teus agentes respondem automaticamente aos clientes em tempo real.
              </p>
              <div className="h-2 w-full bg-[#095344]/30 rounded-full overflow-hidden">
                <div className="h-full bg-[#25d366] w-4/5 shadow-[0_0_10px_#25d366]" />
              </div>
              <p className="text-[10px] text-[#aacbc4]/60 mt-2">Integração via Evolution API</p>
            </div>

            {/* CRM + Analytics */}
            <div className="md:col-span-7 bg-[#021f1b]/60 backdrop-blur-xl border border-[#095344]/30 rounded-3xl p-8 flex items-center gap-8 group cursor-pointer hover:border-[#45fd94]/50 transition-all min-h-[260px]">
              <div className="flex-1">
                <TrendingUp className="h-10 w-10 text-[#45fd94] mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">CRM & Relatórios</h3>
                <p className="text-sm text-[#aacbc4] leading-relaxed">
                  Gere clientes, acompanha conversas, analisa performance dos agentes e toma decisões com dados reais.
                </p>
              </div>
              <div className="hidden sm:flex flex-col gap-2 flex-shrink-0">
                <div className="px-4 py-2 bg-[#45fd94]/10 border border-[#45fd94]/20 rounded-lg text-[#45fd94] text-xs font-bold">LEADS: +47%</div>
                <div className="px-4 py-2 bg-[#095344]/20 border border-[#095344]/40 rounded-lg text-[#aacbc4] text-xs font-bold">CHURN: -23%</div>
                <div className="px-4 py-2 bg-[#5ddcb1]/10 border border-[#5ddcb1]/20 rounded-lg text-[#5ddcb1] text-xs font-bold">MRR: +82%</div>
              </div>
            </div>
          </div>
        </section>

        {/* ── How it works ────────────────────────────────── */}
        <section className="py-20 px-6 md:px-12 bg-[#00110e] border-y border-[#095344]/20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-xs font-bold tracking-widest text-[#45fd94] uppercase mb-3 block">Processo Simples</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Em 3 passos simples</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { step: "01", icon: <Cpu className="h-8 w-8 text-[#45fd94]" />, title: "Descreve o teu Agente", desc: "Diz-nos o que o agente deve fazer. A IA gera o prompt e configura tudo automaticamente." },
                { step: "02", icon: <MessageSquare className="h-8 w-8 text-[#45fd94]" />, title: "Liga ao WhatsApp ou Web", desc: "Conecta uma instância WhatsApp ou incorpora o chat no teu site com 1 linha de código." },
                { step: "03", icon: <Zap className="h-8 w-8 text-[#45fd94]" />, title: "Começa a Operar", desc: "O teu agente atende clientes, captura leads e automatiza tarefas 24/7 sem intervenção humana." },
              ].map(step => (
                <div key={step.step} className="relative">
                  <div className="bg-[#021f1b]/60 backdrop-blur-xl border border-[#095344]/30 rounded-2xl p-8 hover:border-[#45fd94]/40 transition-all">
                    <div className="text-[#45fd94]/20 font-black text-6xl font-mono absolute top-4 right-6">{step.step}</div>
                    <div className="mb-4">{step.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-sm text-[#aacbc4] leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ─────────────────────────────────────── */}
        <section className="py-20 px-6 md:px-12 bg-[#011612] relative" id="pricing">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(69,253,148,0.05)_0%,transparent_60%)] pointer-events-none" />
          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-14">
              <span className="text-xs font-bold tracking-widest text-[#45fd94] uppercase mb-3 block">Planos & Preços</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Começa grátis, escala quando precisares</h2>
              <p className="text-lg text-[#aacbc4]">Preços em Meticais moçambicanos. Sem contratos. Cancela quando quiseres.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Starter */}
              <div className="bg-[#021f1b]/60 backdrop-blur-xl border border-[#095344]/30 rounded-3xl p-8 flex flex-col hover:border-[#aacbc4]/40 transition-all">
                <span className="text-xs font-bold tracking-widest text-[#aacbc4] mb-4 uppercase">Starter</span>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white">Grátis</span>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {["2 Agentes IA", "500 Créditos/mês", "1 Site Gerado", "Suporte por Email"].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-[#cfe8e1]">
                      <CheckCircle2 className="text-[#45fd94] h-4 w-4 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full py-5 rounded-xl border border-[#095344]/50 text-white font-bold hover:bg-[#095344]/20 transition-all">
                  <Link to="/auth">Começar Grátis</Link>
                </Button>
              </div>

              {/* Pro — highlighted */}
              <div className="bg-[#021f1b]/90 backdrop-blur-xl border-2 border-[#45fd94] rounded-3xl p-8 flex flex-col h-full relative shadow-[0_0_40px_-10px_rgba(69,253,148,0.35)]">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#45fd94] text-[#011612] px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider">Mais Popular</div>
                <span className="text-xs font-bold tracking-widest text-[#45fd94] mb-4 uppercase">Profissional</span>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-white">1.299</span>
                  <span className="text-[#aacbc4] text-sm">MZN/mês</span>
                </div>
                <p className="text-[11px] text-[#aacbc4]/70 mb-6">≈ $20 USD/mês</p>
                <ul className="space-y-3 mb-8 flex-grow">
                  {["Agentes IA Ilimitados", "5.000 Créditos/mês", "Sites Ilimitados", "WhatsApp Business API", "Domínios Customizados", "Suporte Prioritário"].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-[#cfe8e1]">
                      <CheckCircle2 className="text-[#45fd94] h-4 w-4 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full py-5 rounded-xl bg-[#45fd94] hover:bg-[#30a684] text-[#011612] font-bold hover:scale-[1.02] transition-all">
                  <Link to="/auth">Ir Profissional</Link>
                </Button>
              </div>

              {/* Enterprise */}
              <div className="bg-[#021f1b]/60 backdrop-blur-xl border border-[#095344]/30 rounded-3xl p-8 flex flex-col hover:border-[#5ddcb1]/40 transition-all">
                <span className="text-xs font-bold tracking-widest text-[#5ddcb1] mb-4 uppercase">Enterprise</span>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-white">Custom</span>
                </div>
                <p className="text-[#aacbc4] text-sm mb-6 leading-relaxed flex-grow">Infraestrutura dedicada, SLA garantido e IA treinada com os dados do teu negócio.</p>
                <ul className="space-y-3 mb-8">
                  {["GPU Dedicada", "Engenharia 24/7", "Onboarding Personalizado"].map(f => (
                    <li key={f} className="flex items-center gap-3 text-sm text-[#cfe8e1]">
                      <CheckCircle2 className="text-[#5ddcb1] h-4 w-4 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button asChild variant="outline" className="w-full py-5 rounded-xl border border-[#5ddcb1]/40 text-[#5ddcb1] font-bold hover:bg-[#5ddcb1]/10 transition-all">
                  <Link to="/auth">Falar com Vendas</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Testimonials / Trust ────────────────────────── */}
        <section className="py-20 px-6 md:px-12 bg-[#00110e] border-y border-[#095344]/20" id="about">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-white mb-4">Porque escolher o Kinjani AI?</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: <Shield className="h-8 w-8 text-[#45fd94]" />, title: "Dados Seguros", desc: "Toda a informação cifrada end-to-end. Infraestrutura em Supabase com Row Level Security." },
                { icon: <Zap className="h-8 w-8 text-[#45fd94]" />, title: "Deploy Instantâneo", desc: "Do zero ao agente funcional em menos de 3 minutos. Sem código, sem DevOps." },
                { icon: <Users className="h-8 w-8 text-[#45fd94]" />, title: "Feito para África", desc: "Integração com M-Pesa e e-Mola. Suporte em português. Preços acessíveis em MZN." },
              ].map(card => (
                <div key={card.title} className="bg-[#021f1b]/60 backdrop-blur-xl border border-[#095344]/30 rounded-2xl p-7 hover:border-[#45fd94]/30 transition-all">
                  <div className="w-14 h-14 rounded-xl bg-[#45fd94]/10 border border-[#45fd94]/20 flex items-center justify-center mb-5">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-sm text-[#aacbc4] leading-relaxed">{card.desc}</p>
                </div>
              ))}
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 opacity-60">
              {["Supabase Powered", "OpenAI Compatible", "Evolution API", "Cloudflare Edge", "GDPR Compliant"].map(b => (
                <span key={b} className="px-4 py-2 rounded-full border border-[#095344]/40 text-[#aacbc4] text-xs font-medium">{b}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Final ───────────────────────────────────── */}
        <section className="py-28 px-6 md:px-12 text-center bg-[#011612] relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(69,253,148,0.08)_0%,transparent_55%)] pointer-events-none" />
          <div className="max-w-3xl mx-auto relative z-10">
            <div className="inline-flex items-center gap-2 mb-6">
              {[1,2,3,4,5].map(i => <Star key={i} className="h-5 w-5 fill-[#45fd94] text-[#45fd94]" />)}
              <span className="text-sm text-[#aacbc4] ml-2">Avaliação 5/5</span>
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight">
              Pronto para <span className="text-[#45fd94]">transformar</span> o teu negócio?
            </h2>
            <p className="text-base md:text-lg text-[#aacbc4] mb-10 max-w-xl mx-auto">
              Junta-te a centenas de empresas moçambicanas que automatizaram o seu atendimento e cresceram com o Kinjani AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild className="bg-[#45fd94] hover:bg-[#30a684] text-[#011612] px-12 py-6 rounded-xl font-bold text-sm hover:shadow-[0_0_25px_-5px_rgba(69,253,148,0.5)] transition-all active:scale-95 w-full sm:w-auto">
                <Link to="/auth">Começar Agora — É Grátis</Link>
              </Button>
              <p className="text-xs text-[#aacbc4]/70">Sem cartão de crédito · Cancela a qualquer hora</p>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="bg-[#081f1b] pt-16 pb-10 px-6 md:px-12 border-t border-[#095344]/30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div>
            <span className="text-lg font-bold text-[#45fd94] flex items-center gap-2 mb-4">
              <Bot className="h-5 w-5" /> Kinjani AI
            </span>
            <p className="text-sm text-[#aacbc4] leading-relaxed">Plataforma de automação com IA para empresas moçambicanas e africanas.</p>
            <div className="flex gap-3 mt-5">
              {["WhatsApp", "Email"].map(c => (
                <a key={c} href={c === "WhatsApp" ? "https://wa.me/258840000000" : "mailto:suporte@kinjani.ai"}
                  className="px-3 py-1.5 rounded-lg border border-[#095344]/40 text-[#aacbc4] text-xs hover:text-[#45fd94] hover:border-[#45fd94]/30 transition-all">
                  {c}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-5">Produto</h4>
            <ul className="space-y-3 text-sm text-[#aacbc4]">
              {["Fábrica de Agentes", "Fábrica de Sites", "Integrações WhatsApp", "CRM & Relatórios", "Créditos"].map(l => (
                <li key={l}><Link to="/auth" className="hover:text-[#45fd94] transition-colors">{l}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-5">Suporte</h4>
            <ul className="space-y-3 text-sm text-[#aacbc4]">
              {["Documentação", "Centro de Ajuda", "WhatsApp Suporte", "Comunidade"].map(l => (
                <li key={l}><a href="#" className="hover:text-[#45fd94] transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold text-white tracking-widest uppercase mb-5">Empresa</h4>
            <ul className="space-y-3 text-sm text-[#aacbc4]">
              {["Sobre Nós", "Carreiras", "Privacidade", "Termos de Uso", "Contacto"].map(l => (
                <li key={l}><a href="#" className="hover:text-[#45fd94] transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-[#095344]/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#aacbc4]/50">© 2026 Kinjani AI · Maputo, Moçambique · Todos os direitos reservados.</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#45fd94] animate-pulse" />
            <span className="text-xs text-[#45fd94]/70 font-mono">Sistemas operacionais</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
