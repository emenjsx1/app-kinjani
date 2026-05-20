
# Plano: Sistema de Créditos Completo + Polish UI/UX

Objectivo: fechar o buraco financeiro (acções sem cobrança), introduzir cobrança proporcional baseada nos custos REAIS das APIs com margem 10–25x, e polir a interface por todo o sistema para sentir-se profissional.

---

## Parte 1 — Sistema de Créditos (Backend)

### 1.1 Tabela de preços oficial

| Acção | Créditos |
|---|---|
| Mensagem chat (texto curto) | 1 |
| Mensagem chat (texto longo >200 chars resposta) | 2 |
| Mensagem com imagem | 3 |
| Mensagem com áudio | 3 |
| Mensagem com PDF | 5 |
| Criação de site (qualquer modo) | 50 |
| Edição site — Micro (<500 tokens output) | 2 |
| Edição site — Pequena (500-1.500) | 5 |
| Edição site — Média (1.500-4.000) | 15 |
| Edição site — Grande (4.000-8.000) | 30 |
| Edição site — Massiva (>8.000) | 50 |
| Criação agente com AI | 5 |
| Lead scraper (1 execução) | 15 |
| Email blast (por destinatário) | 1 |
| WhatsApp blast (por destinatário) | 1 |
| Instância WhatsApp dedicada (mensal) | 500 |

### 1.2 Função RPC central `deduct_credits`

Criar função Postgres SECURITY DEFINER que:
- Recebe `user_id`, `action`, `amount`, `description`
- Verifica saldo em `profiles.credits_balance`
- Se insuficiente → retorna `{ success: false, reason: 'insufficient' }`
- Se suficiente → deduz, regista em `credit_transactions`, retorna `{ success: true, balance }`
- É chamada por todas as edge functions ANTES de executar a acção

### 1.3 Helper TypeScript `chargeCredits(action, metadata?)`

Cliente que invoca a RPC, aplicado em:
- `agent-chat` (calcula tipo de mensagem pelo `attachments`)
- `whatsapp-agent` (idem, antes de responder)
- `generate-website` (50 fixo)
- `chat-edit-website` (estima nível pelo tamanho do output do Gemini)
- `create-agent-ai`
- `email-blast` (cobra N × destinatários antes do envio)
- `whatsapp-blast` (idem)
- `lead-scraper`
- Job mensal recorrente para instâncias WhatsApp dedicadas (cron Postgres)

### 1.4 Página `/credits` redesenhada

Mostrar:
- Saldo grande no topo + barra de progresso até próximo limiar
- 3 cards de pacotes (499/1.299/3.999 MZN) com CTA "Comprar"
- Tabela completa de preços por acção (transparência)
- Histórico filtrado (últimas 50 transacções) com tipo, custo, data, descrição
- Gráfico simples de consumo nos últimos 30 dias

### 1.5 UX de avisos no header

- Componente `<CreditBalance />` no header (todas as páginas) mostra saldo actual
- Banner amarelo persistente quando saldo < 100: *"Restam X créditos. Recarrega para evitar interrupções."* com botão "Comprar"
- Modal de bloqueio quando saldo = 0 ou insuficiente para acção: lista pacotes + CTA
- Pop-up de confirmação para acções ≥ 10 créditos (criação de site, edição média+, scraper, blast com muitos destinatários)
- Toast silencioso para acções < 10 créditos: *"−2 créd · 498 restantes"*

---

## Parte 2 — Polish UI/UX (geral)

Tu disseste "está bom, só pequenos retoques" e "TUDO" no foco, então faço polish leve em paralelo (sem redesign profundo):

### 2.1 Consistência global
- Padronizar `border-radius`, `shadow`, espaçamentos entre cards em todas as páginas
- Garantir que loaders e empty states existem em todas as listas (Agents, Websites, Clients, Notifications)
- Verificar dark/light mode em todas as páginas

### 2.2 Microinterações
- Animações suaves em cards (hover, entrada com stagger)
- Transições de página com fade
- Toasts mais polidos com ícones consistentes
- Pulse no badge de saldo quando deduz créditos

### 2.3 Dashboard mais informativo
- Card MRR (clientes activos × preço médio)
- Card "Créditos consumidos este mês"
- Card "Receita potencial vs custo de infra"
- Gráfico simples de mensagens/dia últimos 7 dias

### 2.4 Página `/agents` (rota actual do user)
- Garantir botão "Criar agente" visível e atractivo
- Cards de agente mostrarem stats (mensagens hoje, status, créditos consumidos)
- Filtro por status (activo, pausado, sem WhatsApp)

---

## Parte 3 — Memória do projecto

Actualizar `mem://business-rules/credits/pricing-currency` com a tabela completa de preços por acção (não só dos pacotes), para futuras sessões já saberem a regra.

---

## Detalhes técnicos

**Migração SQL necessária:**
- Função `deduct_credits(user_id, action, amount, description)` RETURNS jsonb, SECURITY DEFINER, search_path=public
- Função `add_credits(user_id, amount, action, description)` para top-ups (chamada após pagamento confirmado)
- Trigger ou cron mensal em `whatsapp_instances` onde `is_for_client=true` para cobrar 500 créd/mês recorrente
- Index em `credit_transactions(user_id, created_at DESC)` para o histórico ser rápido

**Estimativa de complexidade do level de edição (no edge function `chat-edit-website`):**
```
output_tokens < 500   → 'micro' (2 créd)
output_tokens < 1500  → 'small' (5 créd)
output_tokens < 4000  → 'medium' (15 créd)
output_tokens < 8000  → 'large' (30 créd)
else                  → 'massive' (50 créd)
```
A IA já retorna `usageMetadata.candidatesTokenCount` — usar isso directamente.

**Frontend:**
- Hook `useCreditsBalance()` com polling/realtime para actualizar saldo após cada acção
- Componente `<ConfirmCreditCharge cost={X} action="..." />` reutilizável
- Componente `<InsufficientCreditsModal />` global

---

## Ordem de execução

1. Migração SQL (funções + index)
2. Helper TS `chargeCredits` partilhado em `supabase/functions/_shared/`
3. Integrar em todas as edge functions pagas
4. Hook + componentes de UI (balance, banner, modais, pop-up confirmação)
5. Página `/credits` redesenhada
6. Cron mensal para instâncias dedicadas
7. Polish UI (consistência, micro-animações, dashboard)
8. Actualizar memória do projecto

Vou propor cada passo grande com migração quando chegar lá, para tu aprovares.
