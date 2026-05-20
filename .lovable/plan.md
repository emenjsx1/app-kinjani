# Plano de Reorganização do Kinjani AI

Vou organizar este plano por área. Confirme antes de eu implementar — é grande.

## 1. Painel (Dashboard)
- Adicionar cards: **Total de Agentes**, **Total de Sites criados**, **Créditos restantes**, **Agentes criados**, **Mensagens processadas**, **Uso de crédito**, atalho **Gerar Site**.
- Corrigir a "Fábrica de Software com IA": botões **Logística / CRM / etc.** atualmente não geram nada → fazer com que cada botão pré-preencha o wizard de criação de website com o tipo correto e abra direto.

## 2. Agentes
- Remover fluxo "criar manualmente" — manter **apenas criação com IA**.
- Reativar **Agendamento** e **Controle de Gastos** como funcionais (tirar `comingSoon`, ligar a um backend simples que registra no Supabase). 
- Manter **Gmail → Contactos** como `comingSoon` (requer Google/Sheets).
- Resultado: 9 de 11 tipos funcionais.

## 3. Clientes
- Trocar moeda **EUR → MZN** em toda a página de clientes (criar, listar, detalhes).
- No diálogo **Criar/Editar Cliente**: permitir selecionar **website(s)** e **agente(s)** já criados e definir um **preço mensal por item**. Guardar em nova tabela `client_assets (client_id, asset_type, asset_id, monthly_price)`.

## 4. Navegação / Sidebar
- **Remover**: link "Cloud" e link "Demo" do sidebar (manter rota `/demo` pública mas tirar do menu).

## 5. Créditos & Billing (checkout)
- Criar página/diálogo **Checkout** ao clicar em "Comprar":
  - Escolher método: **M-Pesa, e-Mola, Cartão**.
  - Botão "Confirmar pedido" → mostra estado **"Pedido em processamento"** e grava em nova tabela `payment_orders (user_id, amount_mzn, credits, method, status='pending')`.
  - Sem integração real de gateway agora (placeholder para futuras APIs).

## 6. Integrações
- Reforçar mensagem: "Configure suas APIs (OpenAI / Gemini) para não consumir créditos Kinjani."
- Já existe a base; vou apenas melhorar copy e estado vazio.

## 7. Definições → Faturação (Planos)
- Criar estrutura de **Planos** (read-only para já, vendidos via futuros gateways):
  - **Starter** — só pagamento, 0 créditos (usa APIs próprias), 1 instância WhatsApp.
  - **Pro** — pagamento + 1500 créditos, 5 instâncias.
  - **Business** — pagamento + 5000 créditos, 15 instâncias.
- Mostrar plano atual do user (`profiles.plan`) e botão "Mudar plano" (abre checkout).
- **Instâncias extra**: na página de WhatsApp/Integrações, mostrar "X de N usadas" segundo plano; cobrar créditos por instância adicional acima do limite (definir custo: 500 créditos/instância extra).

---

## Mudanças técnicas (resumo)

**Migrations:**
- `client_assets` (client_id, asset_type enum 'website'|'agent', asset_id, monthly_price numeric, RLS por user via client)
- `payment_orders` (user_id, amount_mzn, credits_amount, method, status, created_at, RLS own)
- coluna `profiles.instance_limit` (default 1) — ou derivar do plano

**Arquivos a alterar (principais):**
- `src/pages/DashboardPage.tsx` — novos cards e fix da Fábrica
- `src/components/agents/CreateAgentWizard.tsx` — remover manual, ativar 2 tipos
- `src/pages/ClientsPage.tsx` + `CreateClientDialog.tsx` + `ClientDetailsPage.tsx` — MZN + seleção de assets
- `src/components/layout/AppSidebar.tsx` — remover Cloud e Demo
- `src/pages/CreditsPage.tsx` — novo `CheckoutDialog`
- `src/pages/SettingsPage.tsx` — secção Planos
- `src/pages/IntegrationsPage.tsx` — limites de instância

---

## Perguntas antes de avançar
1. **Preços dos planos em MZN** — confirma estes valores? Starter 999 MZN/mês (sem créditos), Pro 2999 MZN (1500 créditos), Business 7999 MZN (5000 créditos).
2. **Custo de instância WhatsApp extra**: 500 créditos OK? Ou prefere valor em MZN?
3. **Agendamento e Controle de Gastos**: posso implementar como tabelas simples (`agent_appointments`, `agent_expenses`) com CRUD básico dentro do AgentDetailsPage? Sem integração externa.

Responda às 3 perguntas (ou diga "vai") e eu executo tudo de uma vez.