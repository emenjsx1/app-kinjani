import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Bot, 
  Globe, 
  MessageCircle, 
  Zap, 
  Sparkles, 
  CheckCircle2,
  Users,
  TrendingUp,
  Shield,
  MousePointer,
  Layers
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import logoLight from "@/assets/logo-light.png";
import logoDark from "@/assets/logo-dark.png";

const features = [
  {
    icon: Bot,
    title: "Agentes de IA",
    description: "Crie agentes inteligentes personalizados para atendimento, vendas e suporte.",
  },
  {
    icon: Globe,
    title: "Sites Instantâneos",
    description: "Gere sites profissionais em segundos com templates adaptados ao seu negócio.",
  },
  {
    icon: MessageCircle,
    title: "Chat Widget",
    description: "Integre chat IA diretamente nos seus sites com um simples código embed.",
  },
  {
    icon: Zap,
    title: "WhatsApp Integrado",
    description: "Conecte os seus agentes ao WhatsApp e automatize conversas 24/7.",
  },
];

const benefits = [
  "Criação de agentes em minutos",
  "Templates profissionais incluídos",
  "Suporte a múltiplos canais",
  "Análises e métricas em tempo real",
  "Integração com OpenAI e Gemini",
  "Personalização completa",
];

const stats = [
  { value: "10K+", label: "Conversas", icon: MessageCircle },
  { value: "500+", label: "Agentes Ativos", icon: Bot },
  { value: "98%", label: "Satisfação", icon: TrendingUp },
];

export default function Index() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, isLoading, navigate]);

  const logo = resolvedTheme === "dark" ? logoDark : logoLight;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-rich-black/80 backdrop-blur-md border-b border-border/30">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img 
              src={logo} 
              alt="KINJA AI" 
              className="h-10 w-auto"
            />
          </Link>
          
          <div className="flex items-center gap-4">
            <Link to="/demo" className="text-sm text-pistachio hover:text-anti-flash-white transition-colors hidden sm:block">
              Demo
            </Link>
            <ThemeToggle />
            <Button asChild variant="ghost" className="text-anti-flash-white hover:text-caribbean-green">
              <Link to="/auth">Entrar</Link>
            </Button>
            <Button asChild className="bg-caribbean-green hover:bg-mountain-meadow text-rich-black font-semibold">
              <Link to="/auth">
                Começar Grátis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-rich-black via-dark-green to-bangladesh-green" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(var(--caribbean-green)/0.3),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,hsl(var(--mountain-meadow)/0.2),transparent_40%)]" />
        
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-32 lg:py-40">
          <div className="max-w-3xl">
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-anti-flash-white mb-6 leading-tight">
              Automatize o seu negócio com{" "}
              <span className="text-gradient-primary">Agentes de IA</span>
            </h1>
            
            <p className="text-lg md:text-xl text-pistachio mb-10 leading-relaxed">
              Crie agentes inteligentes, gere sites profissionais e conecte tudo ao WhatsApp. 
              Tudo numa só plataforma, sem precisar de código.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Button asChild size="lg" className="bg-caribbean-green hover:bg-mountain-meadow text-rich-black font-semibold text-base px-8">
                <Link to="/auth">
                  Começar Gratuitamente
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-pistachio/40 text-anti-flash-white hover:bg-pistachio/10 text-base">
                <Link to="/demo">
                  Ver Demonstração
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-caribbean-green/20 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-caribbean-green" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-anti-flash-white">{stat.value}</p>
                    <p className="text-sm text-pistachio">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mockup: Criação de Agentes com 1 Clique */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="text-center mb-16">
          <Badge className="mb-4">
            <MousePointer className="h-3 w-3 mr-1" />
            1 Clique
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Crie Agentes de IA em Segundos
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Selecione um template, personalize o prompt e o seu agente está pronto para atender clientes 24/7.
          </p>
        </div>

        {/* Agent Creation Mockup */}
        <div className="relative max-w-5xl mx-auto">
          <div className="absolute inset-0 bg-gradient-to-br from-caribbean-green/20 to-mountain-meadow/10 rounded-3xl blur-3xl" />
          <div className="relative bg-card border border-border rounded-2xl overflow-hidden shadow-2xl">
            {/* Window Header */}
            <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive/60" />
              <div className="w-3 h-3 rounded-full bg-warning/60" />
              <div className="w-3 h-3 rounded-full bg-success/60" />
              <span className="ml-4 text-sm text-muted-foreground">KINJA AI - Criar Novo Agente</span>
            </div>
            
            {/* Wizard Content */}
            <div className="p-8">
              {/* Steps */}
              <div className="flex items-center justify-center gap-4 mb-10">
                {['Tipo', 'Template', 'Prompt', 'Nome', 'Canal', 'Concluído'].map((step, i) => (
                  <div key={step} className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      i < 3 ? 'bg-caribbean-green text-rich-black' : 'bg-muted text-muted-foreground'
                    }`}>
                      {i < 3 ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                    </div>
                    <span className={`text-sm hidden md:block ${i < 3 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {step}
                    </span>
                    {i < 5 && <div className="w-8 h-0.5 bg-border hidden lg:block" />}
                  </div>
                ))}
              </div>

              {/* Template Selection Grid */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { name: 'Atendimento ao Cliente', icon: MessageCircle, active: true },
                  { name: 'Vendas e Leads', icon: TrendingUp, active: false },
                  { name: 'Suporte Técnico', icon: Bot, active: false },
                ].map((template) => (
                  <div
                    key={template.name}
                    className={`p-6 rounded-xl border-2 transition-all cursor-pointer ${
                      template.active 
                        ? 'border-caribbean-green bg-caribbean-green/10' 
                        : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${
                      template.active ? 'bg-caribbean-green text-rich-black' : 'bg-muted'
                    }`}>
                      <template.icon className="h-6 w-6" />
                    </div>
                    <p className="font-semibold">{template.name}</p>
                    <p className="text-sm text-muted-foreground mt-1">Template pré-configurado</p>
                  </div>
                ))}
              </div>

              {/* Action Button */}
              <div className="flex justify-end mt-8">
                <Button className="bg-caribbean-green hover:bg-mountain-meadow text-rich-black font-semibold px-8">
                  Próximo Passo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mockup: Criação de Sites */}
      <section className="bg-card border-t border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4">
                <Layers className="h-3 w-3 mr-1" />
                Site Builder
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Sites Profissionais com IA
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Gere sites completos em segundos. A IA cria textos, estrutura páginas e aplica o seu branding automaticamente.
              </p>
              
              <div className="space-y-4">
                {[
                  'Templates modernos e responsivos',
                  'Textos gerados por IA',
                  'Editor visual drag & drop',
                  'Publicação com 1 clique',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-caribbean-green/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-caribbean-green" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Button asChild size="lg" className="mt-8 bg-caribbean-green hover:bg-mountain-meadow text-rich-black font-semibold">
                <Link to="/auth">
                  Criar Meu Site
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>

            {/* Site Mockup */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-caribbean-green/20 to-mountain-meadow/10 rounded-2xl blur-3xl" />
              <div className="relative bg-background border border-border rounded-2xl overflow-hidden shadow-2xl">
                {/* Browser Header */}
                <div className="bg-muted/50 border-b border-border px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-destructive/60" />
                  <div className="w-3 h-3 rounded-full bg-warning/60" />
                  <div className="w-3 h-3 rounded-full bg-success/60" />
                  <div className="ml-4 flex-1 bg-background rounded px-3 py-1 text-xs text-muted-foreground">
                    meusite.kinja.ai
                  </div>
                </div>
                
                {/* Site Preview */}
                <div className="p-6">
                  {/* Nav */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-caribbean-green" />
                      <span className="font-bold">TechStartup</span>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>Sobre</span>
                      <span>Serviços</span>
                      <span>Contacto</span>
                    </div>
                  </div>

                  {/* Hero */}
                  <div className="bg-gradient-to-br from-bangladesh-green to-dark-green rounded-xl p-8 mb-6">
                    <h3 className="text-2xl font-bold text-anti-flash-white mb-2">
                      Transforme o seu Negócio
                    </h3>
                    <p className="text-pistachio mb-4">
                      Soluções inovadoras para o seu sucesso digital.
                    </p>
                    <div className="inline-block bg-caribbean-green text-rich-black px-4 py-2 rounded-lg text-sm font-semibold">
                      Saiba Mais
                    </div>
                  </div>

                  {/* Features Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="bg-muted/50 rounded-lg p-4">
                        <div className="w-8 h-8 rounded bg-caribbean-green/20 mb-2" />
                        <div className="h-2 bg-muted rounded w-3/4 mb-1" />
                        <div className="h-2 bg-muted rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="text-center mb-16">
          <Badge className="mb-4">Funcionalidades</Badge>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo o que precisa para escalar
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Uma plataforma completa para criar, gerir e automatizar a comunicação do seu negócio.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="border-border/50 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/5 group">
              <CardContent className="p-6">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary/20 transition-colors">
                  <feature.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-card border-t border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="mb-4">Porquê KINJA AI</Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Construído para equipas que querem crescer
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                Deixe a IA tratar das conversas repetitivas enquanto você foca no que realmente importa - fazer crescer o seu negócio.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {benefits.map((benefit) => (
                  <div key={benefit} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-foreground">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl blur-3xl" />
              <div className="relative bg-gradient-to-br from-rich-black to-dark-green rounded-2xl p-8 border border-border/50">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-caribbean-green flex items-center justify-center">
                    <Bot className="h-6 w-6 text-rich-black" />
                  </div>
                  <div>
                    <p className="font-semibold text-anti-flash-white">Agente de Suporte</p>
                    <p className="text-sm text-pistachio">Ativo • 1.2K mensagens/dia</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-bangladesh-green/50 rounded-lg p-4">
                    <p className="text-sm text-pistachio mb-1">Cliente:</p>
                    <p className="text-anti-flash-white">Qual o horário de funcionamento?</p>
                  </div>
                  <div className="bg-caribbean-green/20 rounded-lg p-4 ml-8">
                    <p className="text-sm text-caribbean-green mb-1">Agente IA:</p>
                    <p className="text-anti-flash-white">Olá! Estamos abertos de segunda a sexta, das 9h às 18h. Posso ajudá-lo com mais alguma coisa? 😊</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Dados Seguros</h3>
            <p className="text-muted-foreground">Infraestrutura segura com encriptação de ponta a ponta.</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Suporte Dedicado</h3>
            <p className="text-muted-foreground">Equipa disponível para ajudar em cada passo.</p>
          </div>
          <div className="p-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Sempre a Melhorar</h3>
            <p className="text-muted-foreground">Novas funcionalidades e melhorias constantes.</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-bangladesh-green via-dark-green to-rich-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--caribbean-green)/0.2),transparent_60%)]" />
        
        <div className="relative max-w-4xl mx-auto px-6 py-20 lg:py-28 text-center">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-anti-flash-white mb-6">
            Pronto para automatizar o seu negócio?
          </h2>
          <p className="text-lg text-pistachio mb-10 max-w-2xl mx-auto">
            Junte-se a centenas de empresas que já usam KINJA AI para transformar a sua comunicação.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-caribbean-green hover:bg-mountain-meadow text-rich-black font-semibold text-base px-8">
              <Link to="/auth">
                Criar Conta Grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-pistachio/40 text-anti-flash-white hover:bg-pistachio/10 text-base">
              <Link to="/demo">
                Explorar Demo
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Link to="/" className="flex items-center">
              <img 
                src={logo} 
                alt="KINJA AI" 
                className="h-8 w-auto"
              />
            </Link>
            
            <p className="text-sm text-muted-foreground">
              © 2024 KINJA AI. Todos os direitos reservados.
            </p>
            
            <div className="flex gap-6">
              <Link to="/auth" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Entrar
              </Link>
              <Link to="/demo" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Demo
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
