import { Heart, Scale, HardHat, GraduationCap, Briefcase, Building2, Globe } from "lucide-react";

export interface WebsitePage {
  id: string;
  name: string;
  slug: string;
  sections: WebsiteSection[];
  isHomepage?: boolean;
}

export interface WebsiteTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  categoryId: string;
  type: "landing" | "institutional";
  thumbnail: string;
  sections: WebsiteSection[];
  pages?: WebsitePage[];
  logoUrl?: string;
  navItems?: { label: string; href: string }[];
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  font: string;
}

export interface WebsiteSection {
  id: string;
  type: "hero" | "about" | "services" | "testimonials" | "contact" | "cta" | "features" | "gallery" | "team" | "faq" | "pricing";
  title: string;
  content: Record<string, string>;
  enabled: boolean;
  order: number;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  templates: WebsiteTemplate[];
}

// Template sections base
const createHeroSection = (overrides: Partial<WebsiteSection["content"]> = {}): WebsiteSection => ({
  id: "hero",
  type: "hero",
  title: "Hero",
  enabled: true,
  order: 0,
  content: {
    headline: "Bem-vindo à Nossa Empresa",
    subheadline: "Soluções profissionais para o seu negócio",
    ctaText: "Começar Agora",
    ctaSecondaryText: "Saber Mais",
    ...overrides,
  },
});

const createAboutSection = (overrides: Partial<WebsiteSection["content"]> = {}): WebsiteSection => ({
  id: "about",
  type: "about",
  title: "Sobre Nós",
  enabled: true,
  order: 1,
  content: {
    title: "Sobre a Nossa Empresa",
    description: "Com anos de experiência no mercado, oferecemos soluções de qualidade para os nossos clientes.",
    mission: "A nossa missão é proporcionar excelência em cada serviço.",
    ...overrides,
  },
});

const createServicesSection = (overrides: Partial<WebsiteSection["content"]> = {}): WebsiteSection => ({
  id: "services",
  type: "services",
  title: "Serviços",
  enabled: true,
  order: 2,
  content: {
    title: "Os Nossos Serviços",
    subtitle: "Descubra o que podemos fazer por si",
    service1Title: "Serviço 1",
    service1Description: "Descrição do primeiro serviço oferecido.",
    service2Title: "Serviço 2",
    service2Description: "Descrição do segundo serviço oferecido.",
    service3Title: "Serviço 3",
    service3Description: "Descrição do terceiro serviço oferecido.",
    ...overrides,
  },
});

const createTestimonialsSection = (overrides: Partial<WebsiteSection["content"]> = {}): WebsiteSection => ({
  id: "testimonials",
  type: "testimonials",
  title: "Testemunhos",
  enabled: true,
  order: 3,
  content: {
    title: "O Que Dizem Sobre Nós",
    testimonial1Text: "Excelente serviço e atendimento profissional.",
    testimonial1Author: "João Silva",
    testimonial1Role: "Cliente",
    testimonial2Text: "Recomendo a todos os meus amigos e família.",
    testimonial2Author: "Maria Santos",
    testimonial2Role: "Cliente",
    ...overrides,
  },
});

const createContactSection = (overrides: Partial<WebsiteSection["content"]> = {}): WebsiteSection => ({
  id: "contact",
  type: "contact",
  title: "Contacto",
  enabled: true,
  order: 4,
  content: {
    title: "Entre em Contacto",
    subtitle: "Estamos aqui para ajudar",
    email: "contacto@empresa.pt",
    phone: "+351 912 345 678",
    address: "Lisboa, Portugal",
    ...overrides,
  },
});

const createCtaSection = (overrides: Partial<WebsiteSection["content"]> = {}): WebsiteSection => ({
  id: "cta",
  type: "cta",
  title: "CTA",
  enabled: true,
  order: 5,
  content: {
    title: "Pronto para Começar?",
    description: "Entre em contacto connosco hoje e descubra como podemos ajudar.",
    buttonText: "Fale Connosco",
    ...overrides,
  },
});

const createFeaturesSection = (overrides: Partial<WebsiteSection["content"]> = {}): WebsiteSection => ({
  id: "features",
  type: "features",
  title: "Características",
  enabled: true,
  order: 2,
  content: {
    title: "Porquê Escolher-nos",
    feature1Title: "Experiência",
    feature1Description: "Anos de experiência no mercado.",
    feature2Title: "Qualidade",
    feature2Description: "Compromisso com a excelência.",
    feature3Title: "Confiança",
    feature3Description: "Clientes satisfeitos em todo o país.",
    ...overrides,
  },
});

const createTeamSection = (overrides: Partial<WebsiteSection["content"]> = {}): WebsiteSection => ({
  id: "team",
  type: "team",
  title: "Equipa",
  enabled: false,
  order: 6,
  content: {
    title: "A Nossa Equipa",
    subtitle: "Profissionais dedicados ao seu serviço",
    member1Name: "Dr. João Silva",
    member1Role: "Diretor",
    member2Name: "Dra. Maria Santos",
    member2Role: "Especialista",
    ...overrides,
  },
});

const createFaqSection = (overrides: Partial<WebsiteSection["content"]> = {}): WebsiteSection => ({
  id: "faq",
  type: "faq",
  title: "FAQ",
  enabled: false,
  order: 7,
  content: {
    title: "Perguntas Frequentes",
    faq1Question: "Qual o horário de funcionamento?",
    faq1Answer: "Estamos abertos de segunda a sexta, das 9h às 18h.",
    faq2Question: "Como posso marcar uma consulta?",
    faq2Answer: "Pode ligar-nos ou enviar um email para agendar.",
    ...overrides,
  },
});

// TEMPLATES POR CATEGORIA

// 🏥 Clínica / Saúde
const healthTemplates: WebsiteTemplate[] = [
  {
    id: "health-clinic-modern",
    name: "Clínica Moderna",
    description: "Design limpo e profissional para clínicas de saúde",
    category: "Clínica / Saúde",
    categoryId: "saude",
    type: "institutional",
    thumbnail: "/placeholder.svg",
    colors: {
      primary: "210 100% 50%",
      secondary: "180 60% 45%",
      accent: "160 70% 40%",
      background: "0 0% 100%",
      text: "210 20% 20%",
    },
    font: "Inter",
    sections: [
      createHeroSection({
        headline: "Cuidamos da Sua Saúde",
        subheadline: "Atendimento médico de excelência com profissionais qualificados",
        ctaText: "Marcar Consulta",
      }),
      createAboutSection({
        title: "Sobre a Nossa Clínica",
        description: "Com mais de 20 anos de experiência, a nossa clínica oferece cuidados de saúde personalizados.",
      }),
      createServicesSection({
        title: "Especialidades",
        service1Title: "Medicina Geral",
        service1Description: "Consultas de rotina e acompanhamento médico.",
        service2Title: "Pediatria",
        service2Description: "Cuidados especializados para crianças.",
        service3Title: "Cardiologia",
        service3Description: "Exames e tratamentos cardiovasculares.",
      }),
      createTeamSection({
        title: "A Nossa Equipa Médica",
        member1Name: "Dr. António Costa",
        member1Role: "Médico de Família",
        member2Name: "Dra. Ana Pereira",
        member2Role: "Pediatra",
      }),
      createTestimonialsSection(),
      createContactSection({
        title: "Marque a Sua Consulta",
        email: "geral@clinica.pt",
      }),
    ],
  },
  {
    id: "health-dentist-landing",
    name: "Clínica Dentária",
    description: "Landing page focada em captação de pacientes",
    category: "Clínica / Saúde",
    categoryId: "saude",
    type: "landing",
    thumbnail: "/placeholder.svg",
    colors: {
      primary: "200 90% 55%",
      secondary: "180 50% 50%",
      accent: "45 100% 50%",
      background: "0 0% 100%",
      text: "200 30% 15%",
    },
    font: "Plus Jakarta Sans",
    sections: [
      createHeroSection({
        headline: "O Seu Sorriso Merece o Melhor",
        subheadline: "Tratamentos dentários avançados com tecnologia de ponta",
        ctaText: "Agendar Avaliação Grátis",
      }),
      createFeaturesSection({
        feature1Title: "Tecnologia Avançada",
        feature2Title: "Equipa Especializada",
        feature3Title: "Pagamento Facilitado",
      }),
      createTestimonialsSection(),
      createCtaSection({
        title: "Marque já a sua consulta!",
        buttonText: "Ligar Agora",
      }),
    ],
  },
];

// ⚖️ Advocacia
const legalTemplates: WebsiteTemplate[] = [
  {
    id: "legal-corporate",
    name: "Escritório Corporativo",
    description: "Design elegante e profissional para escritórios de advocacia",
    category: "Advocacia",
    categoryId: "advocacia",
    type: "institutional",
    thumbnail: "/placeholder.svg",
    colors: {
      primary: "220 50% 25%",
      secondary: "200 40% 35%",
      accent: "45 90% 50%",
      background: "220 15% 98%",
      text: "220 30% 15%",
    },
    font: "Playfair Display",
    sections: [
      createHeroSection({
        headline: "Advocacia de Excelência",
        subheadline: "Mais de 30 anos defendendo os interesses dos nossos clientes",
        ctaText: "Consulta Inicial",
      }),
      createAboutSection({
        title: "O Nosso Escritório",
        description: "Somos um escritório de advocacia reconhecido pela qualidade e ética profissional.",
      }),
      createServicesSection({
        title: "Áreas de Atuação",
        service1Title: "Direito Empresarial",
        service1Description: "Assessoria jurídica completa para empresas.",
        service2Title: "Direito Civil",
        service2Description: "Representação em questões civis e familiares.",
        service3Title: "Direito Laboral",
        service3Description: "Defesa dos direitos dos trabalhadores.",
      }),
      createTeamSection({
        title: "Os Nossos Advogados",
        member1Name: "Dr. Ricardo Ferreira",
        member1Role: "Sócio Fundador",
        member2Name: "Dra. Catarina Lopes",
        member2Role: "Advogada Sénior",
      }),
      createContactSection({
        title: "Agende uma Consulta",
        email: "escritorio@advocacia.pt",
      }),
    ],
  },
  {
    id: "legal-landing",
    name: "Advogado Landing",
    description: "Página de captação para advogados individuais",
    category: "Advocacia",
    categoryId: "advocacia",
    type: "landing",
    thumbnail: "/placeholder.svg",
    colors: {
      primary: "230 40% 30%",
      secondary: "220 30% 45%",
      accent: "40 95% 55%",
      background: "0 0% 100%",
      text: "230 40% 10%",
    },
    font: "Inter",
    sections: [
      createHeroSection({
        headline: "Defesa dos Seus Direitos",
        subheadline: "Advogado especializado em Direito do Trabalho",
        ctaText: "Consulta Grátis",
      }),
      createFeaturesSection({
        feature1Title: "+500 Casos Ganhos",
        feature2Title: "15 Anos de Experiência",
        feature3Title: "100% Comprometimento",
      }),
      createTestimonialsSection(),
      createCtaSection({
        title: "Precisa de Ajuda Legal?",
        buttonText: "Fale Comigo Agora",
      }),
    ],
  },
];

// 🏗️ Construção Civil
const constructionTemplates: WebsiteTemplate[] = [
  {
    id: "construction-company",
    name: "Construtora Profissional",
    description: "Site completo para empresas de construção",
    category: "Construção Civil",
    categoryId: "construcao",
    type: "institutional",
    thumbnail: "/placeholder.svg",
    colors: {
      primary: "30 80% 50%",
      secondary: "200 40% 35%",
      accent: "45 100% 50%",
      background: "30 10% 98%",
      text: "30 30% 15%",
    },
    font: "Inter",
    sections: [
      createHeroSection({
        headline: "Construímos o Seu Sonho",
        subheadline: "Obras de qualidade com materiais de primeira",
        ctaText: "Pedir Orçamento",
      }),
      createAboutSection({
        title: "Quem Somos",
        description: "Empresa de construção civil com projetos em todo o país.",
      }),
      createServicesSection({
        title: "Os Nossos Serviços",
        service1Title: "Construção Nova",
        service1Description: "Construção de moradias e edifícios.",
        service2Title: "Remodelações",
        service2Description: "Renovação completa de espaços.",
        service3Title: "Manutenção",
        service3Description: "Serviços de manutenção e reparação.",
      }),
      createTestimonialsSection(),
      createContactSection({
        title: "Peça já o Seu Orçamento",
        email: "orcamentos@construtora.pt",
      }),
    ],
  },
];

// 🎓 Educação
const educationTemplates: WebsiteTemplate[] = [
  {
    id: "education-school",
    name: "Escola / Colégio",
    description: "Site institucional para escolas e colégios",
    category: "Educação",
    categoryId: "educacao",
    type: "institutional",
    thumbnail: "/placeholder.svg",
    colors: {
      primary: "200 70% 45%",
      secondary: "160 60% 40%",
      accent: "45 100% 50%",
      background: "200 20% 98%",
      text: "200 40% 15%",
    },
    font: "Plus Jakarta Sans",
    sections: [
      createHeroSection({
        headline: "Educação de Qualidade",
        subheadline: "Formamos os líderes de amanhã",
        ctaText: "Matrículas Abertas",
      }),
      createAboutSection({
        title: "A Nossa Escola",
        description: "Com um projeto pedagógico inovador, preparamos os alunos para o futuro.",
      }),
      createServicesSection({
        title: "Níveis de Ensino",
        service1Title: "Pré-Escolar",
        service1Description: "Dos 3 aos 5 anos.",
        service2Title: "1º Ciclo",
        service2Description: "Do 1º ao 4º ano.",
        service3Title: "2º e 3º Ciclo",
        service3Description: "Do 5º ao 9º ano.",
      }),
      createTeamSection({
        title: "Corpo Docente",
        member1Name: "Prof. Maria José",
        member1Role: "Diretora Pedagógica",
      }),
      createContactSection({
        title: "Venha Conhecer-nos",
        email: "secretaria@escola.pt",
      }),
    ],
  },
  {
    id: "education-course-landing",
    name: "Curso Online",
    description: "Landing page para venda de cursos",
    category: "Educação",
    categoryId: "educacao",
    type: "landing",
    thumbnail: "/placeholder.svg",
    colors: {
      primary: "260 70% 55%",
      secondary: "200 60% 50%",
      accent: "45 100% 55%",
      background: "0 0% 100%",
      text: "260 40% 15%",
    },
    font: "Inter",
    sections: [
      createHeroSection({
        headline: "Aprenda [Skill] em 30 Dias",
        subheadline: "Método comprovado com +5000 alunos formados",
        ctaText: "Inscrever-me Agora",
      }),
      createFeaturesSection({
        feature1Title: "Aulas Práticas",
        feature2Title: "Certificado Incluído",
        feature3Title: "Suporte Vitalício",
      }),
      createTestimonialsSection(),
      createCtaSection({
        title: "Vagas Limitadas!",
        buttonText: "Garantir Minha Vaga",
      }),
    ],
  },
];

// 🏢 Serviços / Negócio Local
const servicesTemplates: WebsiteTemplate[] = [
  {
    id: "services-agency",
    name: "Agência de Serviços",
    description: "Site para agências e prestadores de serviços",
    category: "Serviços / Negócio Local",
    categoryId: "servicos",
    type: "institutional",
    thumbnail: "/placeholder.svg",
    colors: {
      primary: "240 50% 50%",
      secondary: "200 50% 45%",
      accent: "340 80% 55%",
      background: "0 0% 100%",
      text: "240 30% 15%",
    },
    font: "Inter",
    sections: [
      createHeroSection({
        headline: "Soluções à Medida do Seu Negócio",
        subheadline: "Serviços profissionais que fazem a diferença",
        ctaText: "Falar com Especialista",
      }),
      createAboutSection(),
      createServicesSection(),
      createTestimonialsSection(),
      createContactSection(),
    ],
  },
  {
    id: "services-local-business",
    name: "Negócio Local",
    description: "Presença online para negócios locais",
    category: "Serviços / Negócio Local",
    categoryId: "servicos",
    type: "landing",
    thumbnail: "/placeholder.svg",
    colors: {
      primary: "160 60% 45%",
      secondary: "180 50% 40%",
      accent: "45 100% 50%",
      background: "160 10% 98%",
      text: "160 40% 15%",
    },
    font: "Plus Jakarta Sans",
    sections: [
      createHeroSection({
        headline: "O Seu Negócio de Confiança",
        subheadline: "Servimos a comunidade há mais de 10 anos",
        ctaText: "Contactar",
      }),
      createFeaturesSection({
        feature1Title: "Serviço Local",
        feature2Title: "Preços Justos",
        feature3Title: "Qualidade Garantida",
      }),
      createTestimonialsSection(),
      createContactSection(),
    ],
  },
];

// 🚀 Templates em Branco (Modo Aberto - tipo Bolt/v0)
const blankTemplates: WebsiteTemplate[] = [
  {
    id: "blank-landing",
    name: "Landing Page em Branco",
    description: "Comece do zero com uma estrutura básica",
    category: "Em Branco",
    categoryId: "blank",
    type: "landing",
    thumbnail: "/placeholder.svg",
    colors: {
      primary: "220 70% 50%",
      secondary: "200 60% 45%",
      accent: "340 80% 55%",
      background: "0 0% 100%",
      text: "220 30% 15%",
    },
    font: "Inter",
    sections: [
      createHeroSection({
        headline: "O Título do Seu Projeto",
        subheadline: "Descreva aqui a proposta de valor do seu negócio ou produto",
        ctaText: "Começar Agora",
        ctaSecondaryText: "Saber Mais",
      }),
      createFeaturesSection({
        title: "Características Principais",
        feature1Title: "Característica 1",
        feature1Description: "Descreva a primeira característica.",
        feature2Title: "Característica 2",
        feature2Description: "Descreva a segunda característica.",
        feature3Title: "Característica 3",
        feature3Description: "Descreva a terceira característica.",
      }),
      createCtaSection({
        title: "Pronto para Começar?",
        description: "Entre em contacto e descubra como podemos ajudar.",
        buttonText: "Contactar",
      }),
    ],
  },
  {
    id: "blank-institutional",
    name: "Site Institucional em Branco",
    description: "Estrutura completa para personalizar como quiser",
    category: "Em Branco",
    categoryId: "blank",
    type: "institutional",
    thumbnail: "/placeholder.svg",
    colors: {
      primary: "220 70% 50%",
      secondary: "200 60% 45%",
      accent: "340 80% 55%",
      background: "0 0% 100%",
      text: "220 30% 15%",
    },
    font: "Inter",
    sections: [
      createHeroSection({
        headline: "Bem-vindo à Nossa Empresa",
        subheadline: "Soluções profissionais para o seu negócio",
        ctaText: "Conhecer Mais",
        ctaSecondaryText: "Fale Connosco",
      }),
      createAboutSection({
        title: "Sobre Nós",
        description: "Conte a história da sua empresa, os valores e a missão.",
        mission: "A nossa missão é proporcionar excelência.",
      }),
      createServicesSection({
        title: "Os Nossos Serviços",
        subtitle: "O que oferecemos",
        service1Title: "Serviço 1",
        service1Description: "Descrição do serviço.",
        service2Title: "Serviço 2",
        service2Description: "Descrição do serviço.",
        service3Title: "Serviço 3",
        service3Description: "Descrição do serviço.",
      }),
      createTestimonialsSection({
        title: "O Que Dizem Sobre Nós",
        testimonial1Text: "Excelente serviço!",
        testimonial1Author: "Cliente 1",
        testimonial1Role: "Empresa",
        testimonial2Text: "Recomendo a todos.",
        testimonial2Author: "Cliente 2",
        testimonial2Role: "Empresa",
      }),
      createContactSection({
        title: "Entre em Contacto",
        subtitle: "Estamos prontos para ajudar",
        email: "email@empresa.pt",
        phone: "+351 900 000 000",
        address: "Lisboa, Portugal",
      }),
    ],
  },
];

// Todas as categorias
export const TEMPLATE_CATEGORIES: TemplateCategory[] = [
  {
    id: "blank",
    name: "Em Branco",
    description: "Comece do zero e personalize como quiser",
    icon: "Globe",
    templates: blankTemplates,
  },
  {
    id: "saude",
    name: "Clínica / Saúde",
    description: "Templates para clínicas, consultórios e profissionais de saúde",
    icon: "Heart",
    templates: healthTemplates,
  },
  {
    id: "advocacia",
    name: "Advocacia",
    description: "Templates para escritórios de advocacia e advogados",
    icon: "Scale",
    templates: legalTemplates,
  },
  {
    id: "construcao",
    name: "Construção Civil",
    description: "Templates para construtoras e empresas de obras",
    icon: "HardHat",
    templates: constructionTemplates,
  },
  {
    id: "educacao",
    name: "Educação",
    description: "Templates para escolas, cursos e formações",
    icon: "GraduationCap",
    templates: educationTemplates,
  },
  {
    id: "servicos",
    name: "Serviços / Negócio Local",
    description: "Templates para prestadores de serviços e negócios locais",
    icon: "Briefcase",
    templates: servicesTemplates,
  },
];

// Obter todos os templates
export const getAllTemplates = (): WebsiteTemplate[] => {
  return TEMPLATE_CATEGORIES.flatMap((cat) => cat.templates);
};

// Obter template por ID
export const getTemplateById = (id: string): WebsiteTemplate | undefined => {
  return getAllTemplates().find((t) => t.id === id);
};

// Obter templates por categoria
export const getTemplatesByCategory = (categoryId: string): WebsiteTemplate[] => {
  const category = TEMPLATE_CATEGORIES.find((c) => c.id === categoryId);
  return category?.templates || [];
};

// Obter ícone da categoria
export const getCategoryIcon = (iconName: string) => {
  const icons: Record<string, typeof Heart> = {
    Heart,
    Scale,
    HardHat,
    GraduationCap,
    Briefcase,
    Building2,
    Globe,
  };
  return icons[iconName] || Globe;
};
