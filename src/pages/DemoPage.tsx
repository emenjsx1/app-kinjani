import { useState, useEffect } from "react";
import { Bot, MessageSquare, ExternalLink } from "lucide-react";
import { ChatContainer, Message } from "@/components/chat";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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

const STORAGE_KEY = "kinja-agents";

const getStoredAgents = (): Agent[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
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

  useEffect(() => {
    const storedAgents = getStoredAgents();
    setAgents(storedAgents.filter((a) => a.status === "active"));
  }, []);

  const handleSelectAgent = (agent: Agent) => {
    setSelectedAgent(agent);
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
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard">
              Aceder ao Painel
              <ExternalLink className="ml-2 h-4 w-4" />
            </a>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
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
            <Card className="h-[calc(100vh-12rem)] flex flex-col">
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
