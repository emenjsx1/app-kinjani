// Widget and Section Spacing Types

export interface SpacingConfig {
  paddingTop: string;
  paddingBottom: string;
  paddingLeft: string;
  paddingRight: string;
  marginTop: string;
  marginBottom: string;
}

export const DEFAULT_SPACING: SpacingConfig = {
  paddingTop: "64",
  paddingBottom: "64",
  paddingLeft: "24",
  paddingRight: "24",
  marginTop: "0",
  marginBottom: "0",
};

export const SPACING_OPTIONS = [
  { value: "0", label: "0" },
  { value: "8", label: "8px" },
  { value: "16", label: "16px" },
  { value: "24", label: "24px" },
  { value: "32", label: "32px" },
  { value: "48", label: "48px" },
  { value: "64", label: "64px" },
  { value: "80", label: "80px" },
  { value: "96", label: "96px" },
  { value: "128", label: "128px" },
];

// Extended section types with widgets
export type ExtendedSectionType = 
  | "hero" 
  | "about" 
  | "services" 
  | "testimonials" 
  | "contact" 
  | "cta" 
  | "features" 
  | "gallery" 
  | "team" 
  | "faq" 
  | "pricing"
  // New widget types
  | "counter"
  | "accordion"
  | "tabs"
  | "slider"
  | "pricing-table"
  | "video"
  | "divider"
  | "spacer"
  | "image-text"
  | "icon-box";

export interface WidgetDefinition {
  type: ExtendedSectionType;
  label: string;
  description: string;
  icon: string;
  category: "content" | "layout" | "interactive" | "media";
}

export const WIDGET_DEFINITIONS: WidgetDefinition[] = [
  // Content widgets
  { type: "hero", label: "Hero", description: "Secção principal com título e CTA", icon: "layout", category: "content" },
  { type: "about", label: "Sobre Nós", description: "Informação sobre a empresa", icon: "info", category: "content" },
  { type: "services", label: "Serviços", description: "Lista de serviços oferecidos", icon: "briefcase", category: "content" },
  { type: "features", label: "Características", description: "Pontos fortes do negócio", icon: "star", category: "content" },
  { type: "testimonials", label: "Testemunhos", description: "Opiniões de clientes", icon: "quote", category: "content" },
  { type: "team", label: "Equipa", description: "Membros da equipa", icon: "users", category: "content" },
  { type: "cta", label: "Call to Action", description: "Apelo à ação", icon: "megaphone", category: "content" },
  { type: "contact", label: "Contacto", description: "Informações de contacto", icon: "mail", category: "content" },
  
  // Interactive widgets
  { type: "counter", label: "Contadores", description: "Números animados com estatísticas", icon: "hash", category: "interactive" },
  { type: "accordion", label: "Acordeão", description: "Conteúdo expansível em blocos", icon: "chevrons-down", category: "interactive" },
  { type: "tabs", label: "Tabs", description: "Conteúdo organizado em abas", icon: "layout-grid", category: "interactive" },
  { type: "faq", label: "FAQ", description: "Perguntas frequentes", icon: "help-circle", category: "interactive" },
  
  // Media widgets
  { type: "gallery", label: "Galeria", description: "Galeria de imagens", icon: "image", category: "media" },
  { type: "slider", label: "Slider", description: "Carrossel de imagens ou conteúdo", icon: "images", category: "media" },
  { type: "video", label: "Vídeo", description: "Embed de vídeo YouTube/Vimeo", icon: "play", category: "media" },
  { type: "image-text", label: "Imagem + Texto", description: "Layout de imagem com texto", icon: "layout", category: "media" },
  
  // Layout widgets
  { type: "pricing", label: "Preços", description: "Tabela de preços simples", icon: "credit-card", category: "layout" },
  { type: "pricing-table", label: "Tabela de Preços", description: "Comparativo detalhado de planos", icon: "table", category: "layout" },
  { type: "divider", label: "Divisor", description: "Linha separadora decorativa", icon: "minus", category: "layout" },
  { type: "spacer", label: "Espaçador", description: "Espaço em branco configurável", icon: "move-vertical", category: "layout" },
  { type: "icon-box", label: "Caixas de Ícones", description: "Grid de ícones com texto", icon: "grid", category: "layout" },
];

// Default content for new widget types
export const WIDGET_DEFAULTS: Record<string, Record<string, string>> = {
  counter: {
    title: "Os Nossos Números",
    counter1Value: "500",
    counter1Label: "Clientes Satisfeitos",
    counter1Suffix: "+",
    counter2Value: "150",
    counter2Label: "Projetos Concluídos",
    counter2Suffix: "+",
    counter3Value: "10",
    counter3Label: "Anos de Experiência",
    counter3Suffix: "",
    counter4Value: "24",
    counter4Label: "Suporte",
    counter4Suffix: "/7",
  },
  accordion: {
    title: "Informações",
    item1Title: "Primeiro Item",
    item1Content: "Conteúdo do primeiro item do acordeão. Pode adicionar qualquer texto aqui.",
    item2Title: "Segundo Item",
    item2Content: "Conteúdo do segundo item do acordeão. Personalize conforme necessário.",
    item3Title: "Terceiro Item",
    item3Content: "Conteúdo do terceiro item. Adicione mais detalhes sobre o seu serviço.",
  },
  tabs: {
    title: "Descubra Mais",
    tab1Title: "Visão Geral",
    tab1Content: "Conteúdo da primeira aba com informações gerais sobre o serviço ou produto.",
    tab2Title: "Características",
    tab2Content: "Lista de características e benefícios principais.",
    tab3Title: "Especificações",
    tab3Content: "Detalhes técnicos e especificações do produto ou serviço.",
  },
  slider: {
    title: "Galeria em Destaque",
    slide1Image: "",
    slide1Title: "Slide 1",
    slide1Description: "Descrição do primeiro slide",
    slide2Image: "",
    slide2Title: "Slide 2", 
    slide2Description: "Descrição do segundo slide",
    slide3Image: "",
    slide3Title: "Slide 3",
    slide3Description: "Descrição do terceiro slide",
    autoplay: "true",
    interval: "5000",
  },
  "pricing-table": {
    title: "Escolha o Seu Plano",
    subtitle: "Planos flexíveis para todas as necessidades",
    plan1Name: "Starter",
    plan1Price: "€19",
    plan1Period: "/mês",
    plan1Feature1: "5 Utilizadores",
    plan1Feature2: "10GB Armazenamento",
    plan1Feature3: "Suporte Email",
    plan1Feature4: "",
    plan1Highlight: "false",
    plan2Name: "Profissional",
    plan2Price: "€49",
    plan2Period: "/mês",
    plan2Feature1: "25 Utilizadores",
    plan2Feature2: "100GB Armazenamento",
    plan2Feature3: "Suporte Prioritário",
    plan2Feature4: "API Access",
    plan2Highlight: "true",
    plan3Name: "Empresarial",
    plan3Price: "€99",
    plan3Period: "/mês",
    plan3Feature1: "Ilimitado",
    plan3Feature2: "1TB Armazenamento",
    plan3Feature3: "Suporte 24/7",
    plan3Feature4: "White Label",
    plan3Highlight: "false",
  },
  video: {
    title: "Veja em Ação",
    videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    description: "Descubra como o nosso serviço pode ajudá-lo.",
  },
  divider: {
    style: "line",
    color: "primary",
    width: "50",
  },
  spacer: {
    height: "64",
  },
  "image-text": {
    title: "Título da Secção",
    description: "Descrição detalhada que acompanha a imagem. Pode incluir informações importantes sobre o seu serviço ou produto.",
    image: "",
    imagePosition: "left",
    ctaText: "Saber Mais",
    ctaUrl: "",
  },
  "icon-box": {
    title: "As Nossas Vantagens",
    box1Icon: "shield",
    box1Title: "Segurança",
    box1Description: "Proteção total dos seus dados",
    box2Icon: "zap",
    box2Title: "Rapidez",
    box2Description: "Resultados em tempo recorde",
    box3Icon: "heart",
    box3Title: "Dedicação",
    box3Description: "Compromisso com a excelência",
    box4Icon: "award",
    box4Title: "Qualidade",
    box4Description: "Padrões elevados sempre",
  },
};
