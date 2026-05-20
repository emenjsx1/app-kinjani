/**
 * Domain heuristics — infer business domain from intent so specialized
 * BusinessLogicAgent can choose the right pattern.
 */
import type { DataGraph, TableDef, FieldDef, AuthFlow, ApiGraph, WorkflowGraph, RealtimeGraph } from "./types";

export type Domain =
  | "crm"
  | "ecommerce"
  | "marketplace"
  | "booking"
  | "fintech"
  | "saas"
  | "internal-tool"
  | "dashboard"
  | "generic";

const DOMAIN_SIGNALS: Array<{ d: Domain; re: RegExp }> = [
  { d: "crm", re: /(crm|leads?|pipeline|deals?|contactos|sales|vendas)/i },
  { d: "ecommerce", re: /(loja|shop|produtos|carrinho|ecommerce|store|checkout)/i },
  { d: "marketplace", re: /(marketplace|vendedores|sellers|listings)/i },
  { d: "booking", re: /(reservas|booking|agendamento|calendar|appointments)/i },
  { d: "fintech", re: /(pagamentos|wallet|carteira|transações|fintech|payments)/i },
  { d: "internal-tool", re: /(interno|admin|tool|operação|operations)/i },
  { d: "dashboard", re: /(dashboard|métricas|analytics|reports?|relatórios)/i },
  { d: "saas", re: /(saas|subscription|assinatura|plano|plans)/i },
];

export function inferDomain(intent: string): Domain {
  for (const { d, re } of DOMAIN_SIGNALS) if (re.test(intent)) return d;
  return "generic";
}

// ───────────────────────────────────────────────────────────────────────────────
// Common building blocks
// ───────────────────────────────────────────────────────────────────────────────

const STANDARD_FIELDS: FieldDef[] = [
  { name: "id", type: "uuid", defaultValue: "gen_random_uuid()" },
  { name: "user_id", type: "uuid" },
  { name: "created_at", type: "timestamptz", defaultValue: "now()" },
  { name: "updated_at", type: "timestamptz", defaultValue: "now()" },
];

const ownRls = (table: string) => [
  {
    name: `own ${table} all`,
    command: "ALL" as const,
    using: "auth.uid() = user_id",
    withCheck: "auth.uid() = user_id",
  },
];

const table = (name: string, extra: FieldDef[], opts: Partial<TableDef> = {}): TableDef => ({
  name,
  fields: [...STANDARD_FIELDS, ...extra],
  rls: ownRls(name),
  ...opts,
});

// ───────────────────────────────────────────────────────────────────────────────
// Domain templates
// ───────────────────────────────────────────────────────────────────────────────

const TEMPLATES: Record<Domain, { tables: TableDef[]; workflows: string[] }> = {
  crm: {
    tables: [
      table("contacts", [
        { name: "name", type: "text" },
        { name: "email", type: "text" },
        { name: "phone", type: "text", nullable: true },
        { name: "company", type: "text", nullable: true },
        { name: "stage", type: "text", defaultValue: "'lead'" },
      ]),
      table("deals", [
        { name: "contact_id", type: "uuid", references: { table: "contacts", column: "id", onDelete: "cascade" } },
        { name: "title", type: "text" },
        { name: "value", type: "numeric", defaultValue: "0" },
        { name: "status", type: "text", defaultValue: "'open'" },
      ]),
      table("activities", [
        { name: "deal_id", type: "uuid", references: { table: "deals", column: "id", onDelete: "cascade" } },
        { name: "kind", type: "text" },
        { name: "note", type: "text", nullable: true },
      ], { realtime: true }),
    ],
    workflows: ["notify on new lead", "auto-assign deal on stage change"],
  },
  ecommerce: {
    tables: [
      table("products", [
        { name: "name", type: "text" },
        { name: "price", type: "numeric" },
        { name: "stock", type: "int", defaultValue: "0" },
        { name: "image_url", type: "text", nullable: true },
      ]),
      table("orders", [
        { name: "status", type: "text", defaultValue: "'pending'" },
        { name: "total", type: "numeric" },
      ], { realtime: true }),
      table("order_items", [
        { name: "order_id", type: "uuid", references: { table: "orders", column: "id", onDelete: "cascade" } },
        { name: "product_id", type: "uuid", references: { table: "products", column: "id" } },
        { name: "quantity", type: "int", defaultValue: "1" },
      ]),
    ],
    workflows: ["send order confirmation email", "decrement stock on order"],
  },
  marketplace: {
    tables: [
      table("listings", [
        { name: "title", type: "text" },
        { name: "price", type: "numeric" },
        { name: "category", type: "text" },
      ]),
      table("messages", [
        { name: "listing_id", type: "uuid", references: { table: "listings", column: "id", onDelete: "cascade" } },
        { name: "body", type: "text" },
      ], { realtime: true }),
    ],
    workflows: ["notify seller on new message"],
  },
  booking: {
    tables: [
      table("services", [
        { name: "name", type: "text" },
        { name: "duration_min", type: "int", defaultValue: "30" },
        { name: "price", type: "numeric", defaultValue: "0" },
      ]),
      table("bookings", [
        { name: "service_id", type: "uuid", references: { table: "services", column: "id", onDelete: "cascade" } },
        { name: "starts_at", type: "timestamptz" },
        { name: "status", type: "text", defaultValue: "'confirmed'" },
      ], { realtime: true }),
    ],
    workflows: ["send reminder 24h before booking"],
  },
  fintech: {
    tables: [
      table("wallets", [
        { name: "balance", type: "numeric", defaultValue: "0" },
        { name: "currency", type: "text", defaultValue: "'MZN'" },
      ]),
      table("transactions", [
        { name: "wallet_id", type: "uuid", references: { table: "wallets", column: "id", onDelete: "cascade" } },
        { name: "amount", type: "numeric" },
        { name: "kind", type: "text" },
      ], { realtime: true }),
    ],
    workflows: ["flag transactions above threshold", "monthly statement"],
  },
  saas: {
    tables: [
      table("subscriptions", [
        { name: "plan", type: "text", defaultValue: "'free'" },
        { name: "status", type: "text", defaultValue: "'active'" },
        { name: "renews_at", type: "timestamptz", nullable: true },
      ]),
      table("invoices", [
        { name: "amount", type: "numeric" },
        { name: "status", type: "text", defaultValue: "'paid'" },
      ]),
    ],
    workflows: ["dunning on failed payment", "trial-ending reminder"],
  },
  "internal-tool": {
    tables: [
      table("items", [
        { name: "name", type: "text" },
        { name: "data", type: "jsonb", defaultValue: "'{}'::jsonb" },
      ]),
    ],
    workflows: ["audit log on mutation"],
  },
  dashboard: {
    tables: [
      table("metrics", [
        { name: "key", type: "text" },
        { name: "value", type: "numeric" },
        { name: "ts", type: "timestamptz", defaultValue: "now()" },
      ], { realtime: true }),
    ],
    workflows: ["aggregate metrics hourly"],
  },
  generic: {
    tables: [
      table("entities", [
        { name: "name", type: "text" },
        { name: "data", type: "jsonb", defaultValue: "'{}'::jsonb" },
      ]),
    ],
    workflows: [],
  },
};

export function generateDataGraph(domain: Domain): DataGraph {
  return {
    tables: TEMPLATES[domain].tables,
    storageBuckets: [{ name: `${domain}-assets`, public: false }],
  };
}

export function generateAuthFlow(domain: Domain): AuthFlow {
  return {
    signup: true,
    login: true,
    oauth: ["google"],
    magicLink: false,
    rbac: {
      roles: domain === "marketplace" ? ["buyer", "seller", "admin"] : ["user", "admin"],
      defaultRole: domain === "marketplace" ? "buyer" : "user",
    },
    onboarding: ["welcome", "profile", "preferences"],
  };
}

export function generateApiGraph(data: DataGraph): ApiGraph {
  const endpoints = data.tables.flatMap((t) => [
    { path: `/api/${t.name}`, method: "GET" as const, authRequired: true, rateLimitPerMin: 60 },
    { path: `/api/${t.name}`, method: "POST" as const, authRequired: true, rateLimitPerMin: 30 },
    { path: `/api/${t.name}/:id`, method: "PATCH" as const, authRequired: true, rateLimitPerMin: 30 },
    { path: `/api/${t.name}/:id`, method: "DELETE" as const, authRequired: true, rateLimitPerMin: 10 },
  ]);
  return {
    endpoints,
    edgeFunctions: [
      { name: "validate-input", description: "Zod validation layer." },
      { name: "rate-limit", description: "Per-user rate limit guard." },
    ],
  };
}

export function generateWorkflowGraph(domain: Domain): WorkflowGraph {
  const list = TEMPLATES[domain].workflows;
  return {
    workflows: list.map((name, i) => ({
      id: `wf_${domain}_${i}`,
      name,
      trigger: { kind: "event", source: `${domain}.created` },
      steps: [
        { id: "s1", kind: "condition", config: { expr: "true" }, next: ["s2"] },
        { id: "s2", kind: "notify", config: { channel: "email" } },
      ],
    })),
  };
}

export function generateRuntimeGraph(data: DataGraph): RuntimeGraph {
  const realtime = data.tables.filter((t) => t.realtime).map((t) => ({
    table: t.name,
    events: ["INSERT", "UPDATE", "DELETE"] as const,
  }));
  return {
    realtimeChannels: realtime.map((r) => ({ table: r.table, events: [...r.events] })),
    stateBoundaries: {
      client: data.tables.map((t) => `query:${t.name}`),
      server: ["secrets", "policies"],
      optimistic: data.tables.map((t) => `mutation:${t.name}`),
    },
  };
}
