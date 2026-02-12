import { useState } from "react";
import { Mail, Send, Users, Loader2, CheckCircle2, XCircle, Search, Phone, Download, Plus, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AutomationPanelProps {
  agentTypeId: string;
  agentName: string;
}

interface Lead {
  company: string;
  contact: string;
  phone: string;
  email: string;
  website: string;
  city: string;
  category: string;
  source: string;
}

export function AutomationPanel({ agentTypeId, agentName }: AutomationPanelProps) {
  // Email blast state
  const [emailRecipients, setEmailRecipients] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailFromName, setEmailFromName] = useState("");

  // WhatsApp blast state
  const [whatsappRecipients, setWhatsappRecipients] = useState("");
  const [whatsappMessage, setWhatsappMessage] = useState("");
  const [whatsappInstance, setWhatsappInstance] = useState("");

  // Scrapper state
  const [scrapeQuery, setScrapeQuery] = useState("");
  const [scrapeLocation, setScrapeLocation] = useState("");
  const [scrapeLimit, setScrapeLimit] = useState("10");
  const [scrapedLeads, setScrapedLeads] = useState<Lead[]>([]);

  // General state
  const [isExecuting, setIsExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<{
    success: boolean;
    message: string;
    details?: any;
  } | null>(null);

  const parseRecipients = (text: string, type: "email" | "phone") => {
    return text
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => {
        const parts = line.split(",").map(p => p.trim());
        if (type === "email") {
          return { email: parts[0], name: parts[1] || undefined };
        }
        return { phone: parts[0], name: parts[1] || undefined };
      });
  };

  const handleEmailBlast = async () => {
    const recipients = parseRecipients(emailRecipients, "email");
    if (recipients.length === 0) {
      toast.error("Adicione pelo menos um destinatário");
      return;
    }
    if (!emailSubject.trim() || !emailBody.trim()) {
      toast.error("Assunto e corpo do email são obrigatórios");
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("automation-email-blast", {
        body: {
          recipients,
          subject: emailSubject,
          body: emailBody,
          fromName: emailFromName || agentName,
        },
      });

      if (error) throw new Error(error.message);

      setExecutionResult({
        success: true,
        message: `Emails enviados: ${data.sentCount}/${data.total}${data.failedCount > 0 ? ` (${data.failedCount} falharam)` : ""}`,
        details: data,
      });
      toast.success(`${data.sentCount} emails enviados com sucesso!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setExecutionResult({ success: false, message });
      toast.error(message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleWhatsAppBlast = async () => {
    const recipients = parseRecipients(whatsappRecipients, "phone");
    if (recipients.length === 0) {
      toast.error("Adicione pelo menos um destinatário");
      return;
    }
    if (!whatsappMessage.trim()) {
      toast.error("Mensagem é obrigatória");
      return;
    }
    if (!whatsappInstance.trim()) {
      toast.error("Nome da instância é obrigatório");
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("automation-whatsapp-blast", {
        body: {
          recipients,
          message: whatsappMessage,
          instanceName: whatsappInstance,
        },
      });

      if (error) throw new Error(error.message);

      setExecutionResult({
        success: true,
        message: `Mensagens enviadas: ${data.sentCount}/${data.total}${data.failedCount > 0 ? ` (${data.failedCount} falharam)` : ""}`,
        details: data,
      });
      toast.success(`${data.sentCount} mensagens WhatsApp enviadas!`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setExecutionResult({ success: false, message });
      toast.error(message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleScrapeLeads = async () => {
    if (!scrapeQuery.trim() || scrapeQuery.trim().length < 3) {
      toast.error("Pesquisa deve ter pelo menos 3 caracteres");
      return;
    }

    setIsExecuting(true);
    setExecutionResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("automation-scrape-leads", {
        body: {
          query: scrapeQuery,
          location: scrapeLocation || undefined,
          limit: parseInt(scrapeLimit) || 10,
        },
      });

      if (error) throw new Error(error.message);

      if (data.leads) {
        setScrapedLeads(data.leads);
        setExecutionResult({
          success: true,
          message: `${data.count} leads encontrados para "${scrapeQuery}"`,
        });
        toast.success(`${data.count} leads encontrados!`);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro desconhecido";
      setExecutionResult({ success: false, message });
      toast.error(message);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleExportLeads = () => {
    if (scrapedLeads.length === 0) return;
    
    const csv = [
      "Empresa,Contacto,Telefone,Email,Website,Cidade,Categoria",
      ...scrapedLeads.map(l => 
        `"${l.company}","${l.contact}","${l.phone}","${l.email}","${l.website}","${l.city}","${l.category}"`
      )
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leads-${scrapeQuery.replace(/\s+/g, "-")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Leads exportados para CSV!");
  };

  // Render based on agent type
  if (agentTypeId === "disparo-email") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Disparo de Email
          </CardTitle>
          <CardDescription>
            Envie emails em massa. Use {"{{name}}"} para personalizar com o nome do destinatário.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome do Remetente</Label>
            <Input
              placeholder="Ex: Kinjani AI"
              value={emailFromName}
              onChange={(e) => setEmailFromName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Destinatários (um por linha: email,nome)</Label>
            <Textarea
              placeholder={"joao@email.com,João Silva\nmaria@email.com,Maria Santos\npedro@email.com"}
              value={emailRecipients}
              onChange={(e) => setEmailRecipients(e.target.value)}
              className="min-h-[100px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {parseRecipients(emailRecipients, "email").length} destinatários • Máx: 100
            </p>
          </div>

          <div className="space-y-2">
            <Label>Assunto</Label>
            <Input
              placeholder="Olá {{name}}, temos uma oferta especial!"
              value={emailSubject}
              onChange={(e) => setEmailSubject(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Corpo do Email (HTML)</Label>
            <Textarea
              placeholder={"<h2>Olá {{name}}!</h2>\n<p>Temos uma oferta especial para si...</p>"}
              value={emailBody}
              onChange={(e) => setEmailBody(e.target.value)}
              className="min-h-[150px] font-mono text-sm"
            />
          </div>

          {executionResult && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              executionResult.success 
                ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400" 
                : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
            }`}>
              {executionResult.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span className="text-sm">{executionResult.message}</span>
            </div>
          )}

          <Button onClick={handleEmailBlast} disabled={isExecuting} className="w-full">
            {isExecuting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A enviar...</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> Enviar Emails</>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (agentTypeId === "disparo-whatsapp") {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Disparo WhatsApp
          </CardTitle>
          <CardDescription>
            Envie mensagens WhatsApp em massa. Use {"{{name}}"} para personalizar. Máx: 50 por disparo.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Nome da Instância Evolution</Label>
            <Input
              placeholder="Ex: minha-instancia"
              value={whatsappInstance}
              onChange={(e) => setWhatsappInstance(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Destinatários (um por linha: telefone,nome)</Label>
            <Textarea
              placeholder={"+258841234567,João Silva\n+258851234567,Maria Santos\n841234567"}
              value={whatsappRecipients}
              onChange={(e) => setWhatsappRecipients(e.target.value)}
              className="min-h-[100px] font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              {parseRecipients(whatsappRecipients, "phone").length} destinatários • Máx: 50
            </p>
          </div>

          <div className="space-y-2">
            <Label>Mensagem</Label>
            <Textarea
              placeholder={"Olá {{name}}! 👋\n\nTemos uma novidade especial para si..."}
              value={whatsappMessage}
              onChange={(e) => setWhatsappMessage(e.target.value)}
              className="min-h-[120px]"
            />
          </div>

          {executionResult && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              executionResult.success 
                ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400" 
                : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
            }`}>
              {executionResult.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span className="text-sm">{executionResult.message}</span>
            </div>
          )}

          <Button onClick={handleWhatsAppBlast} disabled={isExecuting} className="w-full">
            {isExecuting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A enviar...</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> Enviar Mensagens</>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (agentTypeId === "scrapper-leads") {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Scrapper de Leads
            </CardTitle>
            <CardDescription>
              Pesquise empresas e gere leads automaticamente com IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-1">
                <Label>Tipo de Negócio</Label>
                <Input
                  placeholder="Ex: Restaurantes, Clínicas..."
                  value={scrapeQuery}
                  onChange={(e) => setScrapeQuery(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Localização (opcional)</Label>
                <Input
                  placeholder="Ex: Maputo, Lisboa..."
                  value={scrapeLocation}
                  onChange={(e) => setScrapeLocation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Quantidade</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={scrapeLimit}
                  onChange={(e) => setScrapeLimit(e.target.value)}
                />
              </div>
            </div>

            {executionResult && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                executionResult.success 
                  ? "bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400" 
                  : "bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400"
              }`}>
                {executionResult.success ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <span className="text-sm">{executionResult.message}</span>
              </div>
            )}

            <Button onClick={handleScrapeLeads} disabled={isExecuting} className="w-full">
              {isExecuting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> A pesquisar...</>
              ) : (
                <><Search className="mr-2 h-4 w-4" /> Pesquisar Leads</>
              )}
            </Button>
          </CardContent>
        </Card>

        {scrapedLeads.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">
                    Leads Encontrados
                    <Badge variant="secondary" className="ml-2">{scrapedLeads.length}</Badge>
                  </CardTitle>
                </div>
                <Button variant="outline" size="sm" onClick={handleExportLeads}>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Empresa</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Cidade</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {scrapedLeads.map((lead, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium">{lead.company}</TableCell>
                        <TableCell>{lead.contact}</TableCell>
                        <TableCell className="font-mono text-sm">{lead.phone}</TableCell>
                        <TableCell className="text-sm">{lead.email}</TableCell>
                        <TableCell>{lead.city}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Default: No automation panel for this type
  return null;
}
