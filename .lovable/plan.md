
# Plano: Creative Reasoning Engine (sair do randomizer)

## Diagnóstico

Hoje `generate-site-html/index.ts` faz:
1. `analyzeCreativeDirection()` → mapeia regex de nicho a strings hardcoded (dental → "trust + serenity"). É um lookup, não raciocínio.
2. `composeVisualStructure()` → idem, presets.
3. Bloco "SEED CRIATIVO" → `pick()` aleatório de paleta, fontes, hero, layout, motion, ordem de secções.
4. Tudo isto é injectado como ordens rígidas ("PALETA OBRIGATÓRIA: Noir & Gold") para o Gemini gerar o HTML.

Resultado: variação garantida, mas sem coerência. Uma clínica dental pode calhar com paleta "Brutalist Pop" + fontes "Archivo Black + Hind" + hero "Marquee Type" — incoerente. É exactamente o problema descrito.

## Objectivo

Substituir o random global por **um passo de raciocínio do próprio modelo** que escolhe e *justifica* a direção visual. O random fica como "tempero" dentro dos limites do que faz sentido para o briefing.

## Arquitectura nova (2 chamadas ao AI)

```text
prompt do user
      │
      ▼
┌─────────────────────────────────────────┐
│ FASE A — CREATIVE DIRECTOR (AI #1)      │
│ Modelo: gemini-2.5-flash, temp 0.7      │
│ Output: JSON estruturado (Creative Brief)│
│  - interpretation { niche, emotion,      │
│    positioning, audience, brand_voice }  │
│  - direction { typography_intent,        │
│    spacing_intent, palette_intent,       │
│    composition_intent, motion_intent }   │
│  - rationale (1 parágrafo a justificar)  │
│  - candidate_palettes[3], candidate_fonts│
│    [3], candidate_layouts[3] ← shortlist │
│    coerente com o briefing               │
└─────────────────────────────────────────┘
      │
      ▼ (random apenas dentro das shortlists)
┌─────────────────────────────────────────┐
│ TEMPERO — escolhe 1 de cada shortlist    │
│ adiciona uniqueId para divergência       │
└─────────────────────────────────────────┘
      │
      ▼
┌─────────────────────────────────────────┐
│ FASE B — ART DIRECTOR (AI #2)            │
│ Gera HTML final usando o Creative Brief  │
│ + a escolha final (paleta/fontes/layout) │
│ + a *rationale* injectada no prompt para │
│ o modelo "saber porquê" e manter coerência│
└─────────────────────────────────────────┘
```

## Mudanças concretas no código

### 1. Novo ficheiro `supabase/functions/generate-site-html/creative-director.ts`
- Exporta `runCreativeDirector(prompt, websiteName) → CreativeBrief`.
- Faz 1 chamada `callAI` com system prompt do tipo "És um diretor criativo de uma agência premium. Não és um randomizer. Lê o briefing, interpreta o nicho, a emoção, o posicionamento. Devolve um plano visual coerente em JSON." (resposta forçada a JSON).
- Schema do JSON:
  ```ts
  {
    interpretation: { niche, emotional_core, positioning, audience, brand_voice },
    direction: {
      typography_intent: string,   // "thin luxury serif + neutral sans"
      spacing_intent: string,      // "breathing, calm, py-32+"
      palette_intent: string,      // "warm whites + muted gold"
      composition_intent: string,  // "editorial centered, soft hierarchy"
      motion_intent: string        // "subtle, slow fades"
    },
    rationale: string,             // 2-4 frases a justificar
    shortlists: {
      palettes: [{name, vars, why}, ...3],
      fonts:    [{pair, why}, ...3],
      layouts:  [{name, why}, ...3],
      heroes:   [{name, why}, ...3]
    }
  }
  ```
- Inclui validação leve (Zod-ish manual) e fallback para presets actuais se o JSON vier malformado.

### 2. `index.ts` — refactor do flow principal
- Remover/encolher o bloco `HERO_ARCHETYPES / PALETTES / FONT_PAIRS / LAYOUT_DNA / MOTION_STYLES / SECTION_ORDERS` como **fallback only**, não como fonte primária.
- Substituir a sequência atual (`analyzeCreativeDirection` + `composeVisualStructure` + `seed`) por:
  1. `const brief = await runCreativeDirector(prompt, websiteName);`
  2. Random só dentro de `brief.shortlists`: `seed = { palette: pick(brief.shortlists.palettes), fonts: pick(brief.shortlists.fonts), ... }`.
  3. Construir `userMsg` injectando **a rationale + a direction + a escolha final**, com a frase chave: "Estas escolhas foram tomadas porque: {rationale}. Mantém esta coerência em todo o site."
- Manter `analyzeCreativeDirection` apenas como hint para o director (passa o nicho detectado por regex como dica, não como verdade).

### 3. System prompt do Art Director (FASE B)
Reescrever o cabeçalho de "REGRAS ANTI-REPETIÇÃO" para falar a linguagem de coerência em vez de obrigação cega:
- Trocar "PALETA OBRIGATÓRIA" por "Paleta escolhida pelo Director (justificada acima). Aplica-a fielmente porque serve a intenção emocional do briefing."
- Adicionar regra: "Não substituas escolhas. Se sentires que algo não encaixa, refina dentro da intenção, não foras dela."

### 4. Quality validator
Sem alterações estruturais. Adicionar 1 check opcional: o HTML deve conter um comentário `<!-- creative-brief: {uniqueId} -->` no topo para rastreio.

### 5. Logs
Trocar `[Creative Seed]` por `[Creative Brief]` com `rationale` truncada — útil para debugging quando o user diz "porque é que escolheste isto?".

## O que NÃO muda
- Edge function pública/contrato (`{ html, quality }`) igual.
- Créditos, CORS, retry, fallback models — tudo igual.
- `creative-intelligence.ts` mantém-se mas degradado a "hints / fallback", não removido (para não partir nada).

## Custo/latência
+1 chamada ao Gemini (≈ 2-4s, JSON pequeno). Aceitável dado que o site_create já demora muito mais na FASE B.

## Como saberemos que melhorou
Gerar 3 sites com prompts diferentes ("clínica dental de luxo", "restaurante japonês minimalista", "estúdio de tatuagem brutalista"):
- Cada um deve ter `rationale` distinta e *coerente* com o briefing.
- Não pode acontecer "tatuagem brutalista" sair com paleta "Warm White + Beige".

## Ficheiros a tocar
- `supabase/functions/generate-site-html/creative-director.ts` (novo)
- `supabase/functions/generate-site-html/index.ts` (refactor da pipeline)
- (opcional) `creative-intelligence.ts` — marcar funções como `@deprecated, fallback only`

Pronto a implementar quando aprovares.
