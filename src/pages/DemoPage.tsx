import { useState, useEffect } from "react";
import { Bot, MessageSquare, ExternalLink, Sun, Moon, BarChart3, Users, MessageCircle, Code } from "lucide-react";
import { ChatContainer, Message } from "@/components/chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  type: string;
  typeId: string;
  prompt: string;
  status: "active" | "inactive" | "pending" | "error";
  channel: "whatsapp" | "embed" | "both";
  messagesHandled: number;
  createdAt: string;
}

interface DemoStats {
  totalMessages: number;
  agentsTested: Set<string>;
  sessionStart: number;
}

const STORAGE_KEY = "kinja-agents";
const STATS_KEY = "kinja-demo-stats";

const getStoredAgents = (): Agent[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const getStoredStats = (): DemoStats => {
  try {
    const stored = localStorage.getItem(STATS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...parsed,
        agentsTested: new Set(parsed.agentsTested || []),
      };
    }
  } catch {}
  return {
    totalMessages: 0,
    agentsTested: new Set(),
    sessionStart: Date.now(),
  };
};

const saveStats = (stats: DemoStats) => {
  localStorage.setItem(STATS_KEY, JSON.stringify({
    ...stats,
    agentsTested: Array.from(stats.agentsTested),
  }));
};

// Respostas mock baseadas no tipo de agente
const getMockResponse = (agent: Agent, userMessage: string): string => {
  const responses: Record<string, string[]> = {
    "atendimento-faq": [
      `Obrigado pela sua pergunta! Com base nas nossas FAQ, posso ajudá-lo com isso.`,
      `Essa é uma dúvida comum. Deixe-me esclarecer...`,
      `Entendo a sua questão. Aqui está a informação que procura:`,
    ],
    "captura-leads": [
      `Interessante! Para podermos ajudá-lo melhor, poderia partilhar o seu email?`,
      `Obrigado pelo interesse! Qual é o seu nome e empresa?`,
      `Excelente! Gostaria de receber mais informações? Deixe o seu contacto.`,
    ],
    "qualificacao": [
      `Baseado no que me disse, parece que tem interesse genuíno. Qual é o seu orçamento aproximado?`,
      `Entendo as suas necessidades. Qual é o prazo ideal para implementação?`,
      `Perfeito! Em que fase do processo de decisão está?`,
    ],
    "follow-up": [
      `Olá novamente! Vinha dar seguimento à nossa última conversa.`,
      `Espero que esteja bem! Teve oportunidade de considerar a nossa proposta?`,
      `Bom dia! Alguma novidade sobre o que discutimos?`,
    ],
    "agendamento": [
      `Claro! Posso ajudá-lo a agendar. Que dia lhe seria mais conveniente?`,
      `Perfeito! Temos disponibilidade na próxima semana. Prefere manhã ou tarde?`,
      `Vamos marcar isso! Qual o seu horário ideal?`,
    ],
  };

  const agentResponses = responses[agent.typeId] || responses["atendimento-faq"];
  const randomResponse = agentResponses[Math.floor(Math.random() * agentResponses.length)];
  
  return `${randomResponse}\n\n*Nota: Esta é uma resposta de demonstração do agente "${agent.name}".*`;
};

export default function DemoPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [stats, setStats] = useState<DemoStats>(getStoredStats);

  useEffect(() => {
    const storedAgents = getStoredAgents();
    setAgents(storedAgents.filter((a) => a.status === "active"));
    
    // Check system preference for dark mode
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    saveStats(stats);
  }, [stats]);

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
    setStats((prev) => ({
      ...prev,
      agentsTested: new Set([...prev.agentsTested, agent.id]),
    }));
    setMessages([
      {
        id: "welcome",
        content: `Olá! Sou o ${agent.name}, o seu assistente de ${agent.type}. Como posso ajudá-lo hoje?`,
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const handleSendMessage = (content: string) => {
    if (!selectedAgent) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setStats((prev) => ({ ...prev, totalMessages: prev.totalMessages + 1 }));
    setIsLoading(true);

    // Simular resposta da IA com delay
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: getMockResponse(selectedAgent, content),
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleBackToAgents = () => {
    setSelectedAgent(null);
    setMessages([]);
  };

  const getSessionDuration = () => {
    const minutes = Math.floor((Date.now() - stats.sessionStart) / 60000);
    if (minutes < 1) return "< 1 min";
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header Público */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">KINJA AI</span>
            <Badge variant="secondary" className="ml-2">Demo</Badge>
          </div>
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="h-9 w-9"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/dashboard">
                Aceder ao Painel
                <ExternalLink className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Estatísticas de Uso */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MessageCircle className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalMessages}</p>
                  <p className="text-xs text-muted-foreground">Mensagens</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.agentsTested.size}</p>
                  <p className="text-xs text-muted-foreground">Agentes Testados</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{agents.length}</p>
                  <p className="text-xs text-muted-foreground">Agentes Ativos</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Code className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{getSessionDuration()}</p>
                  <p className="text-xs text-muted-foreground">Tempo de Sessão</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {!selectedAgent ? (
          /* Seleção de Agentes */
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">Demonstração de Agentes IA</h1>
              <p className="text-xl text-muted-foreground">
                Experimente os nossos agentes de chat em tempo real. Selecione um agente para começar.
              </p>
            </div>

            {agents.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <Bot className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Nenhum agente disponível</h3>
                      <p className="text-muted-foreground">
                        Crie o seu primeiro agente para vê-lo aqui na demo pública.
                      </p>
                    </div>
                    <Button asChild>
                      <a href="/agents">Criar Agente</a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {agents.map((agent) => (
                  <Card
                    key={agent.id}
                    className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 group"
                    onClick={() => handleSelectAgent(agent)}
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <MessageSquare className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{agent.name}</CardTitle>
                          <CardDescription>{agent.type}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {agent.prompt || "Agente IA pronto para ajudar com as suas questões."}
                      </p>
                      <Button variant="secondary" className="w-full mt-4" size="sm">
                        Iniciar Conversa
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Chat com Agente Selecionado */
          <div className="max-w-3xl mx-auto">
            <Card className="h-[calc(100vh-20rem)] flex flex-col">
              <CardHeader className="border-b shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{selectedAgent.name}</CardTitle>
                      <CardDescription className="text-xs">{selectedAgent.type}</CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleBackToAgents}>
                    Voltar aos Agentes
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-hidden">
                <ChatContainer
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  isLoading={isLoading}
                  placeholder={`Escreva uma mensagem para ${selectedAgent.name}...`}
                  className="h-full"
                />
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-background/50 mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          Powered by <span className="font-semibold text-foreground">KINJA AI</span> — Agentes de Chat Inteligentes
        </div>
      </footer>
    </div>
  );
}
