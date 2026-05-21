// Biblioteca de componentes modernos e padrões de design para referência do AI
// O modelo deve usar estes exemplos como inspiração para criar designs únicos e criativos

export const MODERN_DESIGN_PATTERNS = {

  // HERO SECTIONS - Variações modernas e criativas
  heroes: `
<!-- HERO 1: Cinematic with Ken Burns effect -->
<section class="relative h-screen overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-transparent z-10"></div>
  <img src="..." class="absolute inset-0 w-full h-full object-cover animate-[zoom_25s_ease-in-out_infinite_alternate]" />
  <div class="relative z-20 h-full flex items-center justify-center text-center px-6">
    <div class="max-w-4xl">
      <h1 class="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6">
        Título <span class="text-gradient">Impactante</span>
      </h1>
      <p class="text-xl text-white/80 mb-8">Subtítulo persuasivo e direto</p>
      <button class="px-8 py-4 bg-white text-black font-bold rounded-full hover:scale-105 transition">
        Call to Action
      </button>
    </div>
  </div>
</section>

<!-- HERO 2: Split screen asymmetric -->
<section class="min-h-screen grid lg:grid-cols-[1.2fr_1fr] items-center gap-0">
  <div class="bg-gradient-to-br from-indigo-600 to-purple-700 p-12 lg:p-20 min-h-screen flex items-center">
    <div class="max-w-xl">
      <span class="text-white/60 uppercase tracking-[0.3em] text-xs font-bold">Categoria</span>
      <h1 class="text-5xl lg:text-7xl font-black text-white mt-4 mb-6 leading-[0.95]">
        Design Ousado e Moderno
      </h1>
      <p class="text-white/90 text-lg mb-8">Copy persuasivo que vende a proposta de valor.</p>
      <button class="px-8 py-4 bg-white text-black font-bold rounded-lg hover:shadow-2xl transition">
        Começar Agora
      </button>
    </div>
  </div>
  <div class="relative min-h-[600px] lg:min-h-screen">
    <img src="..." class="absolute inset-0 w-full h-full object-cover" />
  </div>
</section>

<!-- HERO 3: Glassmorphism with floating cards -->
<section class="relative min-h-screen flex items-center justify-center overflow-hidden">
  <div class="absolute inset-0 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500"></div>
  <div class="absolute inset-0 backdrop-blur-3xl bg-white/10"></div>

  <!-- Floating shapes -->
  <div class="absolute top-20 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-pulse"></div>
  <div class="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl animate-pulse delay-1000"></div>

  <div class="relative z-10 text-center px-6 max-w-5xl">
    <h1 class="text-6xl md:text-8xl font-black text-white mb-6">
      Futuro do Design
    </h1>
    <p class="text-2xl text-white/90 mb-12">Interfaces que inspiram e convertem</p>

    <!-- Floating cards -->
    <div class="grid md:grid-cols-3 gap-6 mt-16">
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:-translate-y-2 transition">
        <h3 class="text-white font-bold text-xl mb-2">Feature 1</h3>
        <p class="text-white/70">Descrição concisa</p>
      </div>
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:-translate-y-2 transition delay-100">
        <h3 class="text-white font-bold text-xl mb-2">Feature 2</h3>
        <p class="text-white/70">Descrição concisa</p>
      </div>
      <div class="backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-6 hover:-translate-y-2 transition delay-200">
        <h3 class="text-white font-bold text-xl mb-2">Feature 3</h3>
        <p class="text-white/70">Descrição concisa</p>
      </div>
    </div>
  </div>
</section>
`,

  // BENTO GRIDS - Layouts assimétricos modernos
  bentoGrids: `
<!-- BENTO GRID: Asymmetric masonry -->
<section class="py-20 px-6">
  <div class="max-w-7xl mx-auto">
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">

      <!-- Large feature card -->
      <div class="md:col-span-2 md:row-span-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 flex flex-col justify-end relative overflow-hidden group">
        <img src="..." class="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-110 transition duration-700" />
        <div class="relative z-10">
          <h3 class="text-3xl font-bold text-white mb-2">Feature Principal</h3>
          <p class="text-white/80">Descrição impactante</p>
        </div>
      </div>

      <!-- Stat card -->
      <div class="bg-black text-white rounded-3xl p-8 flex flex-col justify-center">
        <div class="text-5xl font-black mb-2">99%</div>
        <div class="text-white/60">Satisfação</div>
      </div>

      <!-- Image card -->
      <div class="rounded-3xl overflow-hidden">
        <img src="..." class="w-full h-full object-cover hover:scale-110 transition duration-500" />
      </div>

      <!-- Text card -->
      <div class="md:col-span-2 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8">
        <h3 class="text-2xl font-bold mb-3">Outro Destaque</h3>
        <p class="text-gray-600">Copy persuasivo com call to action.</p>
      </div>

      <!-- Icon card -->
      <div class="bg-yellow-400 rounded-3xl p-8 flex items-center justify-center">
        <svg class="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z"/>
        </svg>
      </div>

    </div>
  </div>
</section>
`,

  // CARDS - Variações modernas
  cards: `
<!-- CARD 1: Glassmorphism hover effect -->
<div class="group relative backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">
  <div class="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition"></div>
  <div class="relative z-10">
    <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 flex items-center justify-center">
      <svg class="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">...</svg>
    </div>
    <h3 class="text-xl font-bold mb-2">Título do Card</h3>
    <p class="text-gray-600">Descrição concisa e persuasiva do benefício.</p>
  </div>
</div>

<!-- CARD 2: Neumorphism style -->
<div class="bg-gray-100 rounded-3xl p-8 shadow-[8px_8px_16px_#d1d1d1,-8px_-8px_16px_#ffffff] hover:shadow-[12px_12px_24px_#d1d1d1,-12px_-12px_24px_#ffffff] transition-all duration-300">
  <div class="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 flex items-center justify-center">
    <span class="text-2xl">🚀</span>
  </div>
  <h3 class="text-2xl font-bold mb-3">Feature</h3>
  <p class="text-gray-600 mb-4">Copy que explica o benefício de forma clara.</p>
  <a href="#" class="text-indigo-600 font-semibold hover:underline">Saber mais →</a>
</div>

<!-- CARD 3: Image overlay with gradient -->
<div class="group relative rounded-3xl overflow-hidden h-96 cursor-pointer">
  <img src="..." class="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition duration-700" />
  <div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
  <div class="absolute bottom-0 left-0 right-0 p-8 text-white">
    <span class="text-sm uppercase tracking-wider text-white/60">Categoria</span>
    <h3 class="text-3xl font-bold mt-2 mb-3">Título Impactante</h3>
    <p class="text-white/80">Descrição que gera curiosidade.</p>
  </div>
</div>
`,

  // NAVBARS - Modernas e funcionais
  navbars: `
<!-- NAVBAR 1: Glassmorphism fixed -->
<nav class="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/70 border-b border-white/20 transition-all duration-300">
  <div class="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
    <a href="#" class="text-2xl font-black">
      Logo<span class="text-blue-600">.</span>
    </a>
    <div class="hidden md:flex items-center space-x-8">
      <a href="#" class="text-sm font-semibold hover:text-blue-600 transition">Sobre</a>
      <a href="#" class="text-sm font-semibold hover:text-blue-600 transition">Serviços</a>
      <a href="#" class="text-sm font-semibold hover:text-blue-600 transition">Portfolio</a>
      <a href="#" class="text-sm font-semibold hover:text-blue-600 transition">Contacto</a>
    </div>
    <button class="px-6 py-2 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition">
      CTA
    </button>
  </div>
</nav>

<!-- NAVBAR 2: Dark with animated underline -->
<nav class="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-lg border-b border-white/10">
  <div class="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
    <a href="#" class="text-2xl font-black text-white">BRAND</a>
    <div class="hidden md:flex items-center space-x-10">
      <a href="#" class="relative text-white/80 hover:text-white transition group">
        <span>Home</span>
        <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
      </a>
      <a href="#" class="relative text-white/80 hover:text-white transition group">
        <span>About</span>
        <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
      </a>
      <a href="#" class="relative text-white/80 hover:text-white transition group">
        <span>Work</span>
        <span class="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></span>
      </a>
    </div>
  </div>
</nav>
`,

  // ANIMAÇÕES E MICRO-INTERAÇÕES
  animations: `
<style>
/* Scroll reveal animation */
.scroll-reveal {
  opacity: 0;
  transform: translateY(40px);
  transition: opacity 0.8s cubic-bezier(0.5, 0, 0, 1),
              transform 0.8s cubic-bezier(0.5, 0, 0, 1);
}
.scroll-reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

/* Gradient text */
.text-gradient {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Hover lift effect */
.hover-lift {
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.hover-lift:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0,0,0,0.15);
}

/* Ken Burns zoom */
@keyframes zoom {
  0% { transform: scale(1); }
  100% { transform: scale(1.1); }
}

/* Fade in up */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Pulse glow */
@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.5); }
  50% { box-shadow: 0 0 40px rgba(99, 102, 241, 0.8); }
}
</style>

<script>
// Intersection Observer for scroll reveals
const revealElements = document.querySelectorAll('.scroll-reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
    }
  });
}, { threshold: 0.1 });

revealElements.forEach(el => observer.observe(el));
</script>
`,

  // FOOTERS - Modernos e completos
  footers: `
<!-- FOOTER 1: Minimal centered -->
<footer class="bg-black text-white py-16">
  <div class="max-w-7xl mx-auto px-6 text-center">
    <a href="#" class="text-3xl font-black mb-6 inline-block">BRAND</a>
    <p class="text-white/60 max-w-md mx-auto mb-8">
      Tagline ou descrição curta da marca.
    </p>
    <div class="flex justify-center space-x-6 mb-8">
      <a href="#" class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">...</svg>
      </a>
      <a href="#" class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">...</svg>
      </a>
      <a href="#" class="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20 transition">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">...</svg>
      </a>
    </div>
    <p class="text-white/40 text-sm">© 2026 Brand. Todos os direitos reservados.</p>
  </div>
</footer>

<!-- FOOTER 2: Multi-column with newsletter -->
<footer class="bg-gradient-to-br from-gray-900 to-black text-white py-20">
  <div class="max-w-7xl mx-auto px-6">
    <div class="grid md:grid-cols-4 gap-12 mb-12">
      <div class="md:col-span-2">
        <h3 class="text-2xl font-black mb-4">BRAND</h3>
        <p class="text-white/60 mb-6">Descrição da empresa ou proposta de valor.</p>
        <div class="flex gap-3">
          <input type="email" placeholder="Seu email" class="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-blue-500" />
          <button class="px-6 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-700 transition">
            Subscrever
          </button>
        </div>
      </div>
      <div>
        <h4 class="font-bold mb-4">Links</h4>
        <ul class="space-y-2 text-white/60">
          <li><a href="#" class="hover:text-white transition">Sobre</a></li>
          <li><a href="#" class="hover:text-white transition">Serviços</a></li>
          <li><a href="#" class="hover:text-white transition">Portfolio</a></li>
          <li><a href="#" class="hover:text-white transition">Contacto</a></li>
        </ul>
      </div>
      <div>
        <h4 class="font-bold mb-4">Legal</h4>
        <ul class="space-y-2 text-white/60">
          <li><a href="#" class="hover:text-white transition">Privacidade</a></li>
          <li><a href="#" class="hover:text-white transition">Termos</a></li>
        </ul>
      </div>
    </div>
    <div class="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
      <p class="text-white/40 text-sm">© 2026 Brand. Todos os direitos reservados.</p>
      <div class="flex gap-4 mt-4 md:mt-0">
        <a href="#" class="text-white/40 hover:text-white transition">Instagram</a>
        <a href="#" class="text-white/40 hover:text-white transition">LinkedIn</a>
        <a href="#" class="text-white/40 hover:text-white transition">Twitter</a>
      </div>
    </div>
  </div>
</footer>
`,

  // PALETAS DE CORES MODERNAS
  colorPalettes: `
/* PALETA 1: Tech/SaaS - Blue & Purple */
--primary: #6366f1;
--secondary: #8b5cf6;
--accent: #ec4899;
--dark: #0f172a;
--light: #f8fafc;

/* PALETA 2: Luxury - Gold & Black */
--primary: #d4af37;
--secondary: #1a1a1a;
--accent: #ffffff;
--dark: #000000;
--light: #f5f5f5;

/* PALETA 3: Health/Wellness - Mint & Teal */
--primary: #14b8a6;
--secondary: #06b6d4;
--accent: #10b981;
--dark: #134e4a;
--light: #f0fdfa;

/* PALETA 4: Creative/Agency - Vibrant */
--primary: #f59e0b;
--secondary: #ef4444;
--accent: #8b5cf6;
--dark: #1f2937;
--light: #fef3c7;

/* PALETA 5: Corporate - Navy & Gray */
--primary: #1e40af;
--secondary: #475569;
--accent: #3b82f6;
--dark: #0f172a;
--light: #f1f5f9;
`
};
