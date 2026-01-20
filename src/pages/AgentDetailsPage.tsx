import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check, Bot } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/ui/status-badge";
import { CodeBlock } from "@/components/ui/code-block";
import { ChatContainer } from "@/components/chat";
import { toast } from "sonner";

interface Agent {
  id: string;
  name: string;
  type: string;
  prompt: string;
  status: "active" | "inactive" | "pending" | "error";
  channel: "whatsapp" | "embed" | "both";
  messagesHandled: number;
  createdAt: string;
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

// Mock responses for testing
const MOCK_RESPONSES = [
  "Hello! How can I help you today?",
  "That's a great question! Let me help you with that.",
  "I understand your concern. Here's what I can do for you...",
  "Thanks for reaching out! I'm here to assist you.",
  "Let me look into that for you. One moment please...",
];

export default function AgentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [prompt, setPrompt] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm your AI assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    // Load agent from localStorage
    const storedAgents = localStorage.getItem("kinja-agents");
    if (storedAgents) {
      const agents: Agent[] = JSON.parse(storedAgents);
      const foundAgent = agents.find((a) => a.id === id);
      if (foundAgent) {
        setAgent(foundAgent);
        setIsActive(foundAgent.status === "active");
        setPrompt(foundAgent.prompt || "");
      }
    }
  }, [id]);

  const handleStatusChange = (checked: boolean) => {
    setIsActive(checked);
    if (agent) {
      const newStatus = checked ? "active" : "inactive";
      updateAgent({ ...agent, status: newStatus });
      toast.success(`Agent ${checked ? "activated" : "deactivated"}`);
    }
  };

  const handleSavePrompt = () => {
    if (agent) {
      setIsSaving(true);
      setTimeout(() => {
        updateAgent({ ...agent, prompt });
        setIsSaving(false);
        toast.success("Prompt saved successfully");
      }, 500);
    }
  };

  const updateAgent = (updatedAgent: Agent) => {
    const storedAgents = localStorage.getItem("kinja-agents");
    if (storedAgents) {
      const agents: Agent[] = JSON.parse(storedAgents);
      const updatedAgents = agents.map((a) => (a.id === updatedAgent.id ? updatedAgent : a));
      localStorage.setItem("kinja-agents", JSON.stringify(updatedAgents));
      setAgent(updatedAgent);
    }
  };

  const embedCode = `<!-- KINJA AI Chat Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://widget.kinja.ai/chat.js';
    script.async = true;
    script.dataset.agentId = '${id}';
    document.head.appendChild(script);
  })();
</script>`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    toast.success("Embed code copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = (content: string) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      isUser: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Simulate typing
    setIsTyping(true);
    setTimeout(() => {
      // Add mock response
      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)],
        isUser: false,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, responseMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  if (!agent) {
    return (
      <AppLayout pageTitle="Agent Not Found" credits={1250}>
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground mb-4">Agent not found</p>
          <Button onClick={() => navigate("/agents")}>Back to Agents</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle={agent.name} credits={1250}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/agents")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold">{agent.name}</h1>
              <p className="text-sm text-muted-foreground">{agent.type}</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <StatusBadge status={isActive ? "active" : "inactive"} />
            <div className="flex items-center gap-2">
              <Label htmlFor="status" className="text-sm">Active</Label>
              <Switch
                id="status"
                checked={isActive}
                onCheckedChange={handleStatusChange}
              />
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="settings" className="space-y-4">
          <TabsList>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="embed">Embed Code</TabsTrigger>
            <TabsTrigger value="test">Test Chat</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Agent Prompt</CardTitle>
                <CardDescription>
                  Define how your agent should behave and respond
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="You are a helpful assistant..."
                  className="min-h-[200px]"
                />
                <Button onClick={handleSavePrompt} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="embed" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Embed Code</CardTitle>
                <CardDescription>
                  Add this code to your website to enable the chat widget
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <CodeBlock code={embedCode} language="html" />
                <Button onClick={handleCopyCode} variant="outline">
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Code
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="test" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Test Your Agent</CardTitle>
                <CardDescription>
                  Send test messages to see how your agent responds
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-lg h-[400px]">
                  <ChatContainer
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    isLoading={isTyping}
                    placeholder="Type a test message..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
