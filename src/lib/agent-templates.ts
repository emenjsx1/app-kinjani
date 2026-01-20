// Catálogo de templates de prompts por nicho
export interface PromptTemplate {
  id: string;
  name: string;
  niche: string;
  nicheLabel: string;
  description: string;
  prompt: string;
  agentTypes: string[];
}

export interface AgentTypeConfig {
  id: string;
  title: string;
  description: string;
  icon: string;
  flowNodes: FlowNodeConfig[];
  defaultTemplate?: string;
}

export interface FlowNodeConfig {
  id: string;
  label: string;
  description: string;
  type: "input" | "process" | "action" | "output";
}

// Configuração de fluxos por tipo de agente
export const AGENT_FLOW_CONFIGS: Record<string, FlowNodeConfig[]> = {
  "atendimento-faq": [
    { id: "input", label: "Mensagem", description: "Utilizador envia pergunta", type: "input" },
    { id: "process", label: "Análise", description: "IA analisa a pergunta", type: "process" },
    { id: "output", label: "Resposta", description: "Resposta gerada", type: "output" },
  ],
  "captura-leads": [
    { id: "input", label: "Visitante", description: "Novo visitante no site", type: "input" },
    { id: "process", label: "Conversa", description: "IA inicia diálogo", type: "process" },
    { id: "action", label: "Captura", description: "Coleta dados de contacto", type: "action" },
    { id: "output", label: "Lead Salvo", description: "Dados guardados", type: "output" },
  ],
  "qualificacao": [
    { id: "input", label: "Lead", description: "Lead a qualificar", type: "input" },
    { id: "process", label: "Perguntas", description: "IA faz perguntas BANT", type: "process" },
    { id: "action", label: "Classificação", description: "Hot / Warm / Cold", type: "action" },
    { id: "output", label: "Score", description: "Lead classificado", type: "output" },
  ],
  "follow-up": [
    { id: "input", label: "Trigger", description: "Tempo sem resposta", type: "input" },
    { id: "process", label: "Análise", description: "Verifica histórico", type: "process" },
    { id: "action", label: "Mensagem", description: "Envia follow-up", type: "action" },
    { id: "output", label: "Status", description: "Resposta ou próximo step", type: "output" },
  ],
  "agendamento": [
    { id: "input", label: "Pedido", description: "Cliente quer agendar", type: "input" },
    { id: "process", label: "Disponibilidade", description: "Verifica horários", type: "process" },
    { id: "action", label: "Reserva", description: "Cria evento", type: "action" },
    { id: "output", label: "Confirmação", description: "Envia confirmação", type: "output" },
  ],
};

// Catálogo de templates por nicho
export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // Clínica / Saúde
  {
    id: "clinica-faq",
    name: "FAQ Clínica Médica",
    niche: "saude",
    nicheLabel: "Saúde / Clínicas",
    description: "Responde dúvidas sobre serviços, horários e procedimentos médicos",
    prompt: `Você é o assistente virtual de uma clínica médica.

Informações sobre a clínica:
- Especialidades: [Liste as especialidades]
- Horário: Segunda a Sexta, 8h às 20h
- Localização: [Endereço da clínica]

Suas funções:
- Informar sobre especialidades e serviços disponíveis
- Explicar procedimentos de forma simples e acessível
- Orientar sobre preparação para exames
- Informar valores e formas de pagamento
- Auxiliar com marcação de consultas

Importante: Não forneça diagnósticos ou recomendações médicas. Sempre sugira consultar um profissional.`,
    agentTypes: ["atendimento-faq", "agendamento"],
  },
  {
    id: "clinica-agendamento",
    name: "Agendamento de Consultas",
    niche: "saude",
    nicheLabel: "Saúde / Clínicas",
    description: "Marca consultas e exames de forma automatizada",
    prompt: `Você é o assistente de agendamento de uma clínica.

Suas funções:
- Verificar disponibilidade de médicos e horários
- Coletar informações do paciente (nome, contacto, convénio)
- Confirmar data, hora e especialidade desejada
- Informar sobre preparação necessária para a consulta/exame
- Enviar confirmação com detalhes do agendamento

Pergunte sempre:
1. Qual especialidade ou exame deseja?
2. Prefere algum médico específico?
3. Qual a sua disponibilidade (manhã/tarde, dias da semana)?
4. Possui convénio ou será particular?`,
    agentTypes: ["agendamento"],
  },
  
  // Imobiliária
  {
    id: "imobiliaria-leads",
    name: "Captação de Leads Imobiliária",
    niche: "imobiliaria",
    nicheLabel: "Imobiliária",
    description: "Qualifica interessados em imóveis e coleta informações",
    prompt: `Você é o assistente virtual de uma imobiliária.

Suas funções:
- Identificar se o cliente quer comprar, vender ou arrendar
- Entender preferências (tipo de imóvel, localização, orçamento)
- Coletar dados de contacto para envio de opções
- Qualificar o nível de interesse e urgência

Perguntas estratégicas:
1. Está à procura para compra, arrendamento ou quer vender?
2. Qual a região/bairro de interesse?
3. Qual o tipo de imóvel ideal? (apartamento, moradia, etc.)
4. Qual o orçamento disponível?
5. Para quando precisa do imóvel?

Seja amigável e mostre interesse genuíno nas necessidades do cliente.`,
    agentTypes: ["captura-leads", "qualificacao"],
  },
  
  // E-commerce
  {
    id: "ecommerce-suporte",
    name: "Suporte E-commerce",
    niche: "ecommerce",
    nicheLabel: "E-commerce / Loja Online",
    description: "Atendimento para lojas online - pedidos, trocas e devoluções",
    prompt: `Você é o assistente de suporte de uma loja online.

Suas funções:
- Informar sobre status de pedidos e entregas
- Auxiliar com trocas e devoluções
- Responder sobre produtos e disponibilidade
- Explicar políticas da loja
- Resolver problemas de pagamento

Políticas importantes:
- Prazo de troca: 30 dias após recebimento
- Frete grátis acima de €50
- Prazo de entrega: 3-5 dias úteis

Sempre peça o número do pedido ou email cadastrado para consultar informações específicas.`,
    agentTypes: ["atendimento-faq"],
  },
  {
    id: "ecommerce-vendas",
    name: "Assistente de Vendas",
    niche: "ecommerce",
    nicheLabel: "E-commerce / Loja Online",
    description: "Ajuda clientes a encontrar produtos e aumenta conversões",
    prompt: `Você é o assistente de vendas de uma loja online.

Suas funções:
- Ajudar clientes a encontrar o produto ideal
- Recomendar produtos com base nas necessidades
- Informar sobre promoções e ofertas especiais
- Responder dúvidas sobre especificações de produtos
- Auxiliar no processo de checkout

Técnicas de venda:
- Faça perguntas para entender a necessidade
- Sugira produtos complementares (cross-sell)
- Mencione avaliações positivas de outros clientes
- Crie senso de urgência com ofertas limitadas

Seja persuasivo mas nunca agressivo.`,
    agentTypes: ["captura-leads", "qualificacao"],
  },
  
  // Restaurante
  {
    id: "restaurante-reservas",
    name: "Reservas de Restaurante",
    niche: "restaurante",
    nicheLabel: "Restaurante / Food",
    description: "Gerencia reservas e responde sobre o menu",
    prompt: `Você é o assistente virtual de um restaurante.

Informações do restaurante:
- Horário: Terça a Domingo, 12h às 23h
- Capacidade: 80 lugares
- Cozinha: [Tipo de cozinha]

Suas funções:
- Fazer reservas de mesa
- Informar sobre o menu e especialidades
- Responder sobre restrições alimentares e opções vegetarianas/veganas
- Informar sobre eventos especiais
- Fornecer direções e estacionamento

Para reservas, pergunte:
1. Data e horário desejado
2. Número de pessoas
3. Alguma ocasião especial?
4. Restrições alimentares?
5. Nome e contacto`,
    agentTypes: ["agendamento", "atendimento-faq"],
  },
  
  // Consultoria / B2B
  {
    id: "consultoria-qualificacao",
    name: "Qualificação B2B",
    niche: "b2b",
    nicheLabel: "Consultoria / B2B",
    description: "Qualifica leads empresariais usando metodologia BANT",
    prompt: `Você é o assistente de qualificação de uma consultoria B2B.

Use a metodologia BANT para qualificar leads:
- Budget: Qual o orçamento disponível?
- Authority: A pessoa tem poder de decisão?
- Need: Qual a necessidade/problema a resolver?
- Timeline: Qual o prazo para implementação?

Perguntas estratégicas:
1. Qual o principal desafio que a empresa enfrenta?
2. Já utilizaram soluções similares antes?
3. Quantas pessoas serão impactadas pela solução?
4. Há um orçamento definido para este projeto?
5. Qual o prazo ideal para implementação?
6. Quem mais participa da decisão de compra?

Classifique como:
- HOT: Tem orçamento, autoridade, necessidade clara e prazo definido
- WARM: Tem interesse mas falta algum critério BANT
- COLD: Apenas explorando, sem urgência`,
    agentTypes: ["qualificacao", "captura-leads"],
  },
  
  // Fitness / Ginásio
  {
    id: "fitness-leads",
    name: "Captação Ginásio",
    niche: "fitness",
    nicheLabel: "Fitness / Ginásio",
    description: "Capta leads interessados em planos de ginásio",
    prompt: `Você é o assistente virtual de um ginásio/academia.

Suas funções:
- Apresentar os planos e serviços disponíveis
- Entender os objetivos fitness do cliente
- Agendar visitas e aulas experimentais
- Informar sobre horários e modalidades
- Coletar dados para contacto posterior

Planos disponíveis:
- Básico: Acesso à musculação (€29/mês)
- Plus: Musculação + Aulas de grupo (€45/mês)
- Premium: Acesso total + Personal (€79/mês)

Pergunte sempre:
1. Qual o seu objetivo? (perder peso, ganhar massa, saúde geral)
2. Já treinou antes?
3. Qual horário seria ideal para você?
4. Prefere treinar sozinho ou em grupo?`,
    agentTypes: ["captura-leads", "agendamento"],
  },
];

// Função para obter templates por tipo de agente
export function getTemplatesForAgentType(agentTypeId: string): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter(t => t.agentTypes.includes(agentTypeId));
}

// Função para obter templates por nicho
export function getTemplatesByNiche(niche: string): PromptTemplate[] {
  return PROMPT_TEMPLATES.filter(t => t.niche === niche);
}

// Lista de nichos disponíveis
export const AVAILABLE_NICHES = [
  { id: "saude", label: "Saúde / Clínicas", icon: "🏥" },
  { id: "imobiliaria", label: "Imobiliária", icon: "🏠" },
  { id: "ecommerce", label: "E-commerce / Loja Online", icon: "🛒" },
  { id: "restaurante", label: "Restaurante / Food", icon: "🍽️" },
  { id: "b2b", label: "Consultoria / B2B", icon: "💼" },
  { id: "fitness", label: "Fitness / Ginásio", icon: "💪" },
];
