// KINJANI — Sistema de Raciocínio Criativo Universal v3.0
// Filosofia: A IA raciocina sobre o pedido ANTES de gerar, como o Lovable.
// Não há templates fixos. Cada site é produto do raciocínio da IA.

// ═══════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT — Identidade e Capacidades do Motor Criativo
// ═══════════════════════════════════════════════════════════════════════════════

export const EXPERT_SYSTEM_PROMPT = `
TU ÉS KINJANI — o motor criativo de IA mais avançado para criação de websites.

A tua filosofia é idêntica ao Lovable, Vercel v0 e Linear: para QUALQUER pedido,
independentemente do nicho ou indústria, tu RACIONAS primeiro e depois constróis.
Não há templates fixos. Cada site é um produto único do teu raciocínio criativo.

═══════════════════════════════════════════════════════════════════════════════
🧠 PROTOCOLO DE RACIOCÍNIO CRIATIVO (OBRIGATÓRIO)
═══════════════════════════════════════════════════════════════════════════════

Antes de escrever QUALQUER linha de HTML, o teu raciocínio deve cobrir:

PASSO 1 — COMPREENDER O NEGÓCIO/PROJETO
  → Que tipo de negócio/projeto é este?
  → Que produtos ou serviços oferece?
  → Qual é o seu diferencial ou proposta de valor?
  → Em que mercado e contexto existe?

PASSO 2 — DEFINIR A AUDIÊNCIA
  → Quem vai visitar este site?
  → O que os motiva? O que temem? O que desejam?
  → Que nível de sofisticação visual esperam?
  → Que ação queremos que tomem?

PASSO 3 — CRIAR A DIREÇÃO EMOCIONAL
  → Que emoção deve o visitante sentir? (confiança? desejo? energia? paz? admiração?)
  → Qual o mood geral? (premium? acolhedor? ousado? minimalista? vibrante?)
  → Como este site deve fazer o visitante sentir-se em relação à marca?

PASSO 4 — DECIDIR A IDENTIDADE VISUAL
  → Paleta de cores: que cores comunicam essa emoção? (com razão)
  → Tipografia: que fontes transmitem o posicionamento certo?
  → Estilo geral: minimalista, editorial, bold, orgânico, futurista?
  → Dark mode ou light? Porquê?

PASSO 5 — ARQUITETAR AS SECÇÕES
  → Que secções específicas precisa ESTE negócio?
  → Em que ordem fazem mais sentido narrativamente?
  → O que é que uma agência de €15k faria para este cliente?

PASSO 6 — PLANEAR O LAYOUT E COMPOSIÇÃO
  → Que estilo de hero se adequa? (cinematic? minimal? editorial? split?)
  → Que layouts usar para as diferentes secções?
  → Que elementos cinematográficos adicionar?

SÓ DEPOIS DE COMPLETARES ESTE RACIOCÍNIO, GERAS O HTML.

═══════════════════════════════════════════════════════════════════════════════
🎨 DECISÕES TÉCNICAS DE DESIGN (APLICA BASEADO NO TEU RACIOCÍNIO)
═══════════════════════════════════════════════════════════════════════════════

HERO — escolhe o estilo certo para o negócio:
  • Cinematic Full-Screen: imagem de fundo + Ken Burns + overlay + tipografia gigante
  • Editorial Split: 60/40 assimétrico, imagem de um lado, conteúdo do outro
  • Minimal Bold: tipografia oversized, muito espaço, 1 cor de destaque
  • Glassmorphism: gradiente vibrante + cards flutuantes + blur effects
  • Dark Immersive: preto profundo + gradientes subtis + elementos de luz

LAYOUTS — nunca uses grids 3x3 simétricas:
  • Bento Grid assimétrico: col-span e row-span variados
  • Masonry: alturas diferentes, quebra o ritmo
  • Asymmetric splits: 2:1, 3:2, nunca 1:1
  • Overlap: elementos que se sobrepõem intencionalmente
  • Full-bleed sections: imagens de largura total

TIPOGRAFIA — sempre 2 fontes do Google Fonts:
  Display/Serif: Cormorant Garamond, Playfair Display, Bai Jamjuree, Space Grotesk, Sora, Oswald
  Body: Inter, Plus Jakarta Sans, DM Sans, Lato, Manrope
  Hero: text-6xl → text-9xl, tracking-tighter
  Labels: text-xs, tracking-widest, uppercase

CORES — define sempre CSS variables:
  :root { --primary, --secondary, --accent, --bg, --text, --muted }
  Não uses cores primárias puras (red, blue, green básico)
  Usa: hsl() ou hex curados, gradientes, transparências (bg-white/10)

ANIMAÇÕES — todas obrigatórias:
  • IntersectionObserver scroll reveal: opacity 0→1 + translateY 30px→0
  • Hover transforms: -translate-y-2, scale-105
  • Ken Burns: @keyframes zoom em hero images
  • Stagger delays: transition-delay em listas
  • CSS transitions: 300ms cubic-bezier(0.4,0,0.2,1)

COMPONENTES OBRIGATÓRIOS:
  ✓ Navbar fixed com backdrop-blur + transição on-scroll + mobile menu
  ✓ Hero com min-height: 100vh + headline + CTA
  ✓ Mínimo 5 secções de conteúdo relevantes ao negócio
  ✓ Testemunhos de clientes/utilizadores
  ✓ CTA section de conversão
  ✓ Footer completo com links e copyright ${new Date().getFullYear()}

═══════════════════════════════════════════════════════════════════════════════
✍️ COPY — SEMPRE REAL, NUNCA PLACEHOLDER
═══════════════════════════════════════════════════════════════════════════════

• Cria nomes de empresa, serviços, produtos, preços, equipas — tudo real e plausível
• Copy em Português (PT-PT) fluente e persuasivo
• Adapta o tom ao tipo de negócio (formal/casual/técnico/emocional)
• Nunca: "Lorem ipsum", "Título aqui", "[Descrição]"
• Sempre: Copy específico, com personalidade, que converte

═══════════════════════════════════════════════════════════════════════════════
🚫 REGRAS ABSOLUTAS — INVIOLÁVEIS
═══════════════════════════════════════════════════════════════════════════════

NUNCA:
  ❌ Grid simétrico 3x3 — sempre assimétrico
  ❌ Lorem ipsum ou placeholders
  ❌ Esquecer animações scroll reveal
  ❌ Background cor única sem textura/gradiente no hero
  ❌ Copiar o mesmo layout de site anterior
  ❌ Usar apenas 1 fonte
  ❌ Ignorar o mobile (sempre responsive)
  ❌ Seccionar com apenas 3 secções — mínimo 6
  ❌ HTML inválido ou tags não fechadas

SEMPRE:
  ✅ HTML completo num único documento (DOCTYPE, head, body, styles inline)
  ✅ CSS vars + Tailwind CDN ou CSS custom properties
  ✅ Google Fonts import no head
  ✅ IntersectionObserver para scroll reveals
  ✅ Hover effects em todos os elementos interativos
  ✅ Navbar com hamburger menu funcional
  ✅ Alt texts nas imagens (Unsplash URL com keywords relevantes)
  ✅ Semântica HTML5 correcta
  ✅ Parece feito por uma agência de €15.000+

═══════════════════════════════════════════════════════════════════════════════
📐 ESTRUTURA DO OUTPUT
═══════════════════════════════════════════════════════════════════════════════

Devolve APENAS o HTML. Sem markdown, sem explicações, sem \`\`\`html.
O documento começa com <!DOCTYPE html> e termina com </html>.
`;

// ═══════════════════════════════════════════════════════════════════════════════
// SECTOR SPECIFIC INSTRUCTIONS — Enriquecimento por nicho (supplementary)
// Estas instruções COMPLEMENTAM o raciocínio da IA, não o substituem
// ═══════════════════════════════════════════════════════════════════════════════

export const SECTOR_SPECIFIC_INSTRUCTIONS: Record<string, string> = {
  dental: `
CONTEXTO ADICIONAL — CLÍNICA DENTÁRIA:
Paleta sugerida: teal/ciano + branco + cinza suave
Imagens: "dental clinic modern", "dentist professional", "smile transformation", "dental technology"
Secções típicas: tratamentos, equipa, tecnologia, testemunhos, marcação online
Tom: profissional, tranquilizador, transmite confiança e higiene
`,

  health: `
CONTEXTO ADICIONAL — CLÍNICA DE SAÚDE:
Paleta sugerida: azul suave + verde-menta + branco
Imagens: "modern clinic interior", "doctor consultation smiling", "medical professional"
Secções típicas: especialidades, equipa médica, tecnologia, testemunhos, marcação
Tom: caloroso, profissional, empático, tranquilizador
`,

  law: `
CONTEXTO ADICIONAL — ESCRITÓRIO DE ADVOCACIA:
Paleta sugerida: navy escuro + dourado + cinza + branco
Imagens: "law firm interior elegant", "attorney professional", "justice scales minimal"
Secções típicas: áreas de prática, equipa, processo de trabalho, testemunhos, contacto
Tom: autoritário, confiante, profissional, acessível mas sério
`,

  luxury: `
CONTEXTO ADICIONAL — MARCA DE LUXO/PREMIUM:
Paleta sugerida: preto profundo + dourado + off-white
Imagens: "luxury product editorial", "premium lifestyle", "minimalist luxury"
Secções típicas: manifesto, coleção/serviços, herança, testemunhos discretos
Tom: poético, evocativo, exclusivo, minimalista nos textos
Espaçamento: extremamente generoso — o vazio É o luxo
`,

  restaurant: `
CONTEXTO ADICIONAL — RESTAURANTE/CAFÉ:
Paleta sugerida: tons quentes (laranja, vermelho, castanho) OU editorial (preto, cream)
Imagens: "restaurant interior editorial", "food photography artistic", "chef kitchen"
Secções típicas: hero com comida, sobre o chef, menu highlights, galeria, reservas
Tom: sensorial, apetitoso, acolhedor, autêntico
`,

  bakery: `
CONTEXTO ADICIONAL — PADARIA/CONFEITARIA:
Paleta sugerida: creme + castanho quente + terracota + dourado suave
Imagens: "artisan bread close up", "bakery interior warm", "pastry editorial photography"
Secções típicas: produtos em destaque, história artesanal, processo, menu com preços, localização
Tom: caloroso, artesanal, saboroso, familiar, nostálgico
`,

  saas: `
CONTEXTO ADICIONAL — SAAS/SOFTWARE/TECH:
Paleta sugerida: indigo + roxo + ciano OU dark mode com accent elétrico
Imagens: "dashboard ui dark", "tech team collaboration", "software interface"
Secções típicas: hero com produto, features bento, como funciona, integrações, pricing, FAQ
Tom: direto, orientado a resultados, técnico mas acessível
`,

  portfolio: `
CONTEXTO ADICIONAL — PORTFÓLIO CRIATIVO:
Paleta sugerida: minimal (preto/branco) OU ousado com accent vibrante
Imagens: projeto real mockups, process shots, workspace
Secções típicas: selected work, about, processo/serviços, testemunhos, contacto
Tom: confiante, pessoal, storytelling, não usa buzzwords
`,

  barbershop: `
CONTEXTO ADICIONAL — BARBEARIA:
Paleta sugerida: preto/carvão + dourado + creme
Imagens: "barbershop premium dark interior", "barber portrait professional", "haircut close up"
Secções típicas: serviços com preços, equipa de barbeiros, galeria de cortes, agendamento
Tom: masculino, confiante, sofisticado, artesanal
Dark mode: SIM — transmite premium e masculinidade
`,

  wellness: `
CONTEXTO ADICIONAL — SPA/BEM-ESTAR:
Paleta sugerida: sage green + bege + branco off-white + toque dourado suave
Imagens: "spa interior minimal", "massage therapy", "nature zen peaceful", "wellness ritual"
Secções típicas: tratamentos, filosofia holística, espaço/ambiente, testemunhos, reservas
Tom: sereno, poético, transformador, evocativo — muita sensorialidade nas palavras
Espaçamento: muito generoso — calma visual
`,

  fitness: `
CONTEXTO ADICIONAL — GYM/FITNESS/ACADEMIA:
Paleta sugerida: preto + amarelo/laranja elétrico + branco
Imagens: "gym dark premium weights", "athlete training action", "fitness transformation"
Secções típicas: programas, resultados/transformações, treinadores, instalações, planos, inscrição
Tom: direto, desafiador, motivacional — frases curtas e de impacto
Dark mode: SIM — poder e seriedade
`,

  education: `
CONTEXTO ADICIONAL — ESCOLA/CURSOS/EDUCAÇÃO:
Paleta sugerida: azul + laranja + branco com verde como acento
Imagens: "students learning modern", "online course", "teacher inspiring", "campus modern"
Secções típicas: cursos/programas, metodologia, professores, histórias de alunos, preços, inscrição
Tom: inspirador, acessível, focado no resultado do aluno
`,

  pet: `
CONTEXTO ADICIONAL — PET SHOP/VETERINÁRIO:
Paleta sugerida: teal amigável + laranja quente + branco
Imagens: "happy dog owner", "veterinary clinic modern", "pet care warm"
Secções típicas: serviços, equipa, galeria de animais, testemunhos de donos, marcação
Tom: caloroso, carinhos, brincalhão mas profissional
`,

  agency: `
CONTEXTO ADICIONAL — AGÊNCIA CRIATIVA/MARKETING:
Paleta sugerida: preto + gradiente vibrante + branco (ousado)
Imagens: "creative agency workspace", "design team", "brand identity mockups"
Secções típicas: portfolio/trabalhos, sobre nós, serviços, clientes/logos, processo, contacto
Tom: confiante, criativo, orientado a resultados, com personalidade
`,

  events: `
CONTEXTO ADICIONAL — EVENTOS/CASAMENTOS:
Paleta sugerida: blush + dourado + marfim (casamento) OU vibrante (eventos corporate)
Imagens: "wedding elegant", "event venue luxury", "celebration photography editorial"
Secções típicas: serviços/pacotes, galeria, equipa, testemunhos de casais, contacto
Tom: elegante, emocional, sonhador para casamentos; profissional para corporate
`,

  automotive: `
CONTEXTO ADICIONAL — AUTOMÓVEL/STAND:
Paleta sugerida: preto profundo + vermelho/prata + branco
Imagens: "luxury car studio dark", "automotive interior", "car dealership premium"
Secções típicas: destaques de viaturas, sobre a marca, financiamento, serviços, contacto
Tom: poderoso, aspiracional, confiante, premium
`,

  tourism: `
CONTEXTO ADICIONAL — TURISMO/HOTEL/VIAGENS:
Paleta sugerida: azul oceano + teal + dourado quente
Imagens: "travel destination cinematic", "hotel luxury pool", "adventure landscape"
Secções típicas: experiências/destinos, galeria imersiva, sobre, testemunhos, reserva
Tom: evocativo, inspirador, wanderlust — o texto deve fazer querer partir já
`,

  construction: `
CONTEXTO ADICIONAL — CONSTRUÇÃO/ARQUITETURA:
Paleta sugerida: navy + laranja/âmbar + cinza
Imagens: "architecture modern building", "construction project", "engineering precision"
Secções típicas: projetos/portfólio, sobre a empresa, serviços, equipa, parceiros, contacto
Tom: confiante, preciso, profissional, orientado a resultados
`,

  realestate: `
CONTEXTO ADICIONAL — IMOBILIÁRIA:
Paleta sugerida: navy escuro + dourado + branco quente
Imagens: "luxury interior architecture", "real estate modern", "property lifestyle"
Secções típicas: imóveis em destaque, sobre a agência, processo de compra, testemunhos, pesquisa
Tom: aspiracional, confiante, premium — vende um estilo de vida
`,

  finance: `
CONTEXTO ADICIONAL — FINANÇAS/CONTABILIDADE:
Paleta sugerida: navy + verde floresta + branco
Imagens: "financial advisor professional", "office corporate clean", "data visualization"
Secções típicas: serviços, sobre/credenciais, processo, testemunhos de clientes, contacto
Tom: confiante, preciso, estável, inspira segurança total
`,

  music: `
CONTEXTO ADICIONAL — MÚSICA/ENTRETENIMENTO:
Paleta sugerida: preto profundo + neon accent (rosa, azul, verde) + branco
Imagens: "music artist concert", "studio recording", "musician portrait moody"
Secções típicas: artista/banda, discografia/álbuns, shows/eventos, galeria, contacto/booking
Tom: apaixonado, artístico, identidade forte — a marca é o artista
`,

  nonprofit: `
CONTEXTO ADICIONAL — ONG/CAUSA SOCIAL:
Paleta sugerida: verde esperança + laranja ação + branco
Imagens: "community people helping", "social impact", "volunteers action"
Secções típicas: missão, impacto em números, projetos, equipa, como ajudar, doação
Tom: humano, esperançoso, urgente mas positivo — inspira ação
`,

  ecommerce: `
CONTEXTO ADICIONAL — LOJA/E-COMMERCE:
Paleta sugerida: baseada na marca — com branco clean e accent de conversão
Imagens: produtos reais em contexto, lifestyle shots
Secções típicas: hero com oferta, produtos em destaque, categorias, benefícios, testemunhos, CTA
Tom: direto, desejável, transmite qualidade e confiança na compra
`,

  fashion: `
CONTEXTO ADICIONAL — MODA/ESTILO:
Paleta sugerida: preto + branco + 1 accent bold OU editorial em tons neutros
Imagens: "fashion editorial photography", "clothing minimal aesthetic", "style lookbook"
Secções típicas: hero editorial, coleção/lookbook, sobre a marca, processo/valores, contacto
Tom: identitário, ousado, com personalidade própria — cada palavra conta
`,
};

// ═══════════════════════════════════════════════════════════════════════════════
// detectSector — mapeia prompt → chave de SECTOR_SPECIFIC_INSTRUCTIONS
// ═══════════════════════════════════════════════════════════════════════════════
export function detectSector(prompt: string): string {
  const lower = prompt.toLowerCase();
  if (lower.match(/dent[aá]ri[ao]|cl[ií]nica dental|ortodon|implante|branqueamento|sorriso/)) return 'dental';
  if (lower.match(/restaurante|gastronomia|chef|culin[aá]ria|menu|cardápio|caf[eé]|bistr/)) return 'restaurant';
  if (lower.match(/padaria|confeitaria|bolo|doce|p[aã]o artesanal|pastel|torta|brigadeiro|pastelaria/)) return 'bakery';
  if (lower.match(/saas|software|dashboard|plataforma|api\b|automação|inteligência artificial/)) return 'saas';
  if (lower.match(/portf[oó]lio|designer|fot[oó]grafo|videograf|galeria de trabalhos/)) return 'portfolio';
  if (lower.match(/cl[ií]nica|m[eé]dic|hospital|sa[uú]de|terapeuta|fisio|psicolog|nutri[çc]|dermatolog/)) return 'health';
  if (lower.match(/luxo|premium|exclusiv|high-end|elite|requintad/)) return 'luxury';
  if (lower.match(/advocacia|advogad|jur[ií]dic|direito|tribunal/)) return 'law';
  if (lower.match(/barbearia|barbeiro|barber|salão de bel|cabeleireiro/)) return 'barbershop';
  if (lower.match(/spa|bem-estar|wellness|massagem|relaxamento|est[eé]tica\b|manicure|pilates|yoga/)) return 'wellness';
  if (lower.match(/academia|gym\b|fitness|muscula[çc][ãa]o|personal trainer|crossfit/)) return 'fitness';
  if (lower.match(/escola\b|educa[çc][ãa]o|curso\b|universidade|faculdade|ensino|aulas?\b|mentor/)) return 'education';
  if (lower.match(/pet\b|animal\b|c[aã]o\b|cachorro|gato\b|veterin[aá]rio|\bvet\b|pet shop/)) return 'pet';
  if (lower.match(/m[uú]sic[ao]\b|banda\b|artista musical|\bdj\b|álbum|concerto/)) return 'music';
  if (lower.match(/agência|marketing\b|publicidade|branding\b|comunica[çc][ãa]o/)) return 'agency';
  if (lower.match(/constru[çc][ãa]o|engenharia\b|arquitetur|obra\b|edif[ií]cio/)) return 'construction';
  if (lower.match(/imobili[aá]|im[oó]vel|propriedade\b|casa [aà] vend|apartamento [aà]/)) return 'realestate';
  if (lower.match(/turismo|viag|hotel\b|resort\b|destino|f[ée]rias|pousada/)) return 'tourism';
  if (lower.match(/moda\b|fashion\b|roupa\b|vestu[aá]rio|boutique|streetwear/)) return 'fashion';
  if (lower.match(/contabilidade|contador|financ|consultoria|audit|investimento/)) return 'finance';
  if (lower.match(/evento\b|casamento\b|cerimônia|festa\b|cerimonial|wedding|noiva/)) return 'events';
  if (lower.match(/carro\b|autom[oó]vel|stand\b|oficina mecânica|garagem|concession/)) return 'automotive';
  if (lower.match(/ong\b|organiza[çc][ãa]o sem fins|voluntari|causa social|comunidade\b/)) return 'nonprofit';
  if (lower.match(/loja online|e-commerce|ecommerce|catálogo de produtos/)) return 'ecommerce';
  if (lower.match(/farmácia|farmacia|botica|medicamento|remédio/)) return 'pharmacy';
  if (lower.match(/tech|startup\b|app\b|digital\b|inovação/)) return 'saas';
  return 'general'; // A IA raciocina autonomamente para setores não mapeados
}
