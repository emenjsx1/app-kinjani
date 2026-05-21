// Auto-generated reference: a hand-crafted premium landing page used as a QUALITY BAR
// in the system prompt of generate-site-html. The model should NOT copy this content
// literally — only borrow the craftsmanship level (composition, motion, polish).
export const QUALITY_REFERENCE_HTML = `<!DOCTYPE html>
<html lang="pt-PT" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sólido Engenharia | Construção e Inovação</title>
    <meta name="description" content="Sólido Engenharia: a sua parceira de confiança para projetos de construção civil, remodelação e gestão de obra com rigor, durabilidade e excelência em Portugal.">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree:wght@400;600;700&family=Inter:wght@400;500&display=swap" rel="stylesheet">
    
    <script src="https://cdn.tailwindcss.com"></script>
    
    <style>
        :root {
            --color-primary: #FFC700; /* A strong, confident yellow */
            --color-dark: #12141D;
            --color-light-gray: #E0E0E0;
            --color-mid-gray: #828282;
        }
        body {
            font-family: 'Inter', sans-serif;
            background-color: var(--color-dark);
            color: var(--color-light-gray);
        }
        h1, h2, h3, h4, h5, h6 {
            font-family: 'Bai Jamjuree', sans-serif;
            font-weight: 600;
        }
        .text-primary { color: var(--color-primary); }
        .bg-primary { background-color: var(--color-primary); }
        .border-primary { border-color: var(--color-primary); }
        
        .nav-link {
            position: relative;
            transition: color 0.3s ease;
        }
        .nav-link::after {
            content: '';
            position: absolute;
            width: 0;
            height: 2px;
            bottom: -4px;
            left: 50%;
            transform: translateX(-50%);
            background-color: var(--color-primary);
            transition: width 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
        }
        .nav-link:hover::after, .nav-link.active::after {
            width: 100%;
        }

        .scroll-reveal {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.8s cubic-bezier(0.5, 0, 0, 1), transform 0.8s cubic-bezier(0.5, 0, 0, 1);
        }
        .scroll-reveal.is-visible {
            opacity: 1;
            transform: translateY(0);
        }
        .hero-bg-zoom {
            animation: zoom-in 25s infinite alternate;
        }
        @keyframes zoom-in {
            0% { transform: scale(1); }
            100% { transform: scale(1.1); }
        }
    </style>
</head>
<body class="antialiased">

    <!-- Header / Navegação -->
    <header id="navbar" class="fixed top-0 left-0 w-full z-50 transition-all duration-300 ease-in-out bg-black/30 backdrop-blur-sm">
        <div class="container mx-auto px-6 py-4 flex justify-between items-center">
            <a href="#home" class="text-2xl font-bold tracking-wider">
                SÓLIDO<span class="text-primary">.</span>
            </a>
            <nav class="hidden md:flex items-center space-x-8">
                <a href="#sobre" class="nav-link text-sm uppercase tracking-widest font-semibold hover:text-primary">Sobre Nós</a>
                <a href="#servicos" class="nav-link text-sm uppercase tracking-widest font-semibold hover:text-primary">Serviços</a>
                <a href="#projectos" class="nav-link text-sm uppercase tracking-widest font-semibold hover:text-primary">Projectos</a>
                <a href="#contacto" class="nav-link text-sm uppercase tracking-widest font-semibold hover:text-primary">Contacto</a>
            </nav>
            <div class="md:hidden">
                <button id="mobile-menu-button" class="text-white focus:outline-none">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path></svg>
                </button>
            </div>
        </div>
        <!-- Mobile Menu -->
        <div id="mobile-menu" class="hidden md:hidden bg-black/80 backdrop-blur-lg">
            <a href="#sobre" class="block text-center py-3 text-sm uppercase tracking-widest font-semibold hover:bg-primary hover:text-dark">Sobre Nós</a>
            <a href="#servicos" class="block text-center py-3 text-sm uppercase tracking-widest font-semibold hover:bg-primary hover:text-dark">Serviços</a>
            <a href="#projectos" class="block text-center py-3 text-sm uppercase tracking-widest font-semibold hover:bg-primary hover:text-dark">Projectos</a>
            <a href="#contacto" class="block text-center py-3 text-sm uppercase tracking-widest font-semibold hover:bg-primary hover:text-dark">Contacto</a>
        </div>
    </header>

    <main>
        <!-- Secção Hero -->
        <section id="home" class="relative h-screen flex items-center justify-center overflow-hidden">
            <div class="absolute inset-0 bg-black/60 z-10"></div>
            <div class="absolute inset-0 w-full h-full">
                <img src="https://picsum.photos/seed/1541888946425-d81bb19240f5/2670/1502" alt="Obra de construção ao entardecer" class="w-full h-full object-cover hero-bg-zoom">
            </div>
            <div class="relative z-20 text-center px-6">
                <h1 class="text-4xl md:text-6xl lg:text-7xl font-bold uppercase tracking-tighter text-white mb-4 scroll-reveal">
                    Construímos o Futuro<span class="text-primary">.</span> Sólido<span class="text-primary">.</span>
                </h1>
                <p class="max-w-2xl mx-auto text-lg md:text-xl text-light-gray mb-8 scroll-reveal" style="transition-delay: 200ms;">
                    Da visão à estrutura. Transformamos conceitos ambiciosos em realidade duradoura com engenharia de precisão e gestão de excelência.
                </p>
                <a href="#projectos" class="bg-primary text-dark font-bold uppercase tracking-wider py-3 px-8 rounded-sm hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300 scroll-reveal" style="transition-delay: 400ms;">
                    Ver Projectos
                </a>
            </div>
        </section>

        <!-- Secção Sobre -->
        <section id="sobre" class="py-20 md:py-32 bg-dark">
            <div class="container mx-auto px-6">
                <div class="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div class="scroll-reveal">
                         <div class="relative">
                             <div class="absolute -top-4 -left-4 w-full h-full border-2 border-primary/50 rounded z-0"></div>
                             <img src="https://picsum.photos/seed/1519389950473-47ba0277781c/2670/1502" alt="Equipa de engenheiros a planear sobre uma planta" class="relative rounded z-10 w-full h-auto object-cover">
                         </div>
                    </div>
                    <div class="scroll-reveal" style="transition-delay: 200ms;">
                        <span class="text-primary uppercase tracking-widest font-semibold">A nossa base</span>
                        <h2 class="text-3xl md:text-4xl font-bold mt-2 mb-6 text-white">Engenharia de Precisão e Confiança</h2>
                        <p class="text-light-gray mb-4">
                            Na Sólido Engenharia, acreditamos que cada estrutura é mais do que betão e aço; é o alicerce de sonhos e o palco de futuras memórias. Fundada sobre os pilares da integridade, inovação e rigor técnico, a nossa missão é entregar projetos que não só cumprem, mas excedem as expectativas.
                        </p>
                        <p class="text-light-gray">
                            Com uma equipa multidisciplinar de especialistas, abraçamos cada desafio com uma metodologia focada na otimização de recursos, no cumprimento rigoroso de prazos e na garantia da máxima qualidade e segurança em cada fase do processo construtivo.
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Secção Serviços -->
        <section id="servicos" class="py-20 md:py-32 bg-[#1A1D29]">
            <div class="container mx-auto px-6">
                <div class="text-center mb-16">
                    <span class="text-primary uppercase tracking-widest font-semibold scroll-reveal">As Nossas Valências</span>
                    <h2 class="text-3xl md:text-4xl font-bold mt-2 text-white scroll-reveal" style="transition-delay: 100ms;">Serviços Integrados de Construção</h2>
                </div>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <!-- Serviço 1 -->
                    <div class="bg-dark p-8 rounded-lg border border-gray-800 hover:border-primary/50 hover:-translate-y-2 transition-all duration-300 scroll-reveal">
                        <div class="bg-primary/10 text-primary w-12 h-12 rounded-full flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.447 2.724A1 1 0 0021 16.382V5.618a1 1 0 00-1.447-.894L15 7m-6 3l6-3" /></svg>
                        </div>
                        <h3 class="text-xl font-bold mb-3 text-white">Planeamento e Gestão de Obra</h3>
                        <p class="text-mid-gray">Coordenação total do seu projeto, desde a conceção ao licenciamento, garantindo o controlo de custos, prazos e qualidade.</p>
                    </div>
                    <!-- Serviço 2 -->
                    <div class="bg-dark p-8 rounded-lg border border-gray-800 hover:border-primary/50 hover:-translate-y-2 transition-all duration-300 scroll-reveal" style="transition-delay: 200ms;">
                        <div class="bg-primary/10 text-primary w-12 h-12 rounded-full flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                        </div>
                        <h3 class="text-xl font-bold mb-3 text-white">Construção Nova</h3>
                        <p class="text-mid-gray">Execução de edifícios residenciais, comerciais e industriais, utilizando materiais de vanguarda e técnicas construtivas inovadoras.</p>
                    </div>
                    <!-- Serviço 3 -->
                    <div class="bg-dark p-8 rounded-lg border border-gray-800 hover:border-primary/50 hover:-translate-y-2 transition-all duration-300 scroll-reveal" style="transition-delay: 400ms;">
                        <div class="bg-primary/10 text-primary w-12 h-12 rounded-full flex items-center justify-center mb-6">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h5V4H4zm0 12v5h5v-5H4zM15 4v5h5V4h-5zm0 12v5h5v-5h-5z" /></svg>
                        </div>
                        <h3 class="text-xl font-bold mb-3 text-white">Remodelação e Reabilitação</h3>
                        <p class="text-mid-gray">Transformamos e modernizamos espaços existentes, valorizando o seu património e adaptando-o às novas necessidades funcionais e estéticas.</p>
                    </div>
                </div>
            </div>
        </section>

        <!-- Secção Projectos -->
        <section id="projectos" class="py-20 md:py-32 bg-dark">
            <div class="container mx-auto px-6">
                <div class="text-center mb-16">
                    <span class="text-primary uppercase tracking-widest font-semibold scroll-reveal">Portfólio</span>
                    <h2 class="text-3xl md:text-4xl font-bold mt-2 text-white scroll-reveal" style="transition-delay: 100ms;">Projectos Que Definem Horizontes</h2>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div class="group relative overflow-hidden rounded-lg col-span-1 md:col-span-2 scroll-reveal">
                        <img src="https://picsum.photos/seed/1588417835499-a416b3d754c9/2670/1502" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Moradia Moderna">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div class="absolute bottom-0 left-0 p-6">
                            <h3 class="text-2xl font-bold text-white">Moradia V4, Algarve</h3>
                            <p class="text-primary">Residencial</p>
                        </div>
                    </div>
                    <div class="group relative overflow-hidden rounded-lg scroll-reveal" style="transition-delay: 200ms;">
                        <img src="https://picsum.photos/seed/1613946069416-08a9c4b7a13f/2574/1448" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Interior moderno">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div class="absolute bottom-0 left-0 p-6">
                            <h3 class="text-xl font-bold text-white">Edifício de Escritórios, Lisboa</h3>
                            <p class="text-primary">Comercial</p>
                        </div>
                    </div>
                    <div class="group relative overflow-hidden rounded-lg scroll-reveal" style="transition-delay: 300ms;">
                        <img src="https://picsum.photos/seed/1512917774080-9991f1c4c750/2670/1502" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Casa com piscina">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div class="absolute bottom-0 left-0 p-6">
                            <h3 class="text-xl font-bold text-white">Reabilitação de Condomínio, Porto</h3>
                            <p class="text-primary">Reabilitação</p>
                        </div>
                    </div>
                    <div class="group relative overflow-hidden rounded-lg col-span-1 md:col-span-2 scroll-reveal" style="transition-delay: 400ms;">
                        <img src="https://picsum.photos/seed/1558036117-15d82a90b9b1/2574/1448" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Armazém industrial">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                        <div class="absolute bottom-0 left-0 p-6">
                            <h3 class="text-2xl font-bold text-white">Pavilhão Industrial, Aveiro</h3>
                            <p class="text-primary">Industrial</p>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- Secção Testemunho -->
        <section class="py-20 md:py-32 bg-[#1A1D29]">
            <div class="container mx-auto px-6 max-w-4xl text-center scroll-reveal">
                 <svg class="w-16 h-16 text-primary/50 mx-auto mb-6" fill="currentColor" viewBox="0 0 32 32"><path d="M9.333 22.667h-6v-10h6v10zm18.667 0h-6v-10h6v10zm-11.667 0c0-1.229-0.231-2.404-0.67-3.483-0.589-1.447-1.472-2.903-2.618-4.321-1.164-1.441-2.483-2.733-3.922-3.834-0.455-0.344-0.957-0.65-1.494-0.902 0.057-0.102 0.117-0.201 0.179-0.297 1.554-2.438 3.517-4.639 5.821-6.529l-3.333-3.333c-3.086 2.592-5.469 5.594-7.051 8.889-1.125 2.344-1.6 4.963-1.6 7.771v12h12v-12zM28 22.667c0-1.229-0.231-2.404-0.67-3.483-0.589-1.447-1.472-2.903-2.618-4.321-1.164-1.441-2.483-2.733-3.922-3.834-0.455-0.344-0.957-0.65-1.494-0.902 0.057-0.102 0.117-0.201 0.179-0.297 1.554-2.438 3.517-4.639 5.821-6.529l-3.333-3.333c-3.086 2.592-5.469 5.594-7.051 8.889-1.125 2.344-1.6 4.963-1.6 7.771v12h12v-12z"></path></svg>
                <p class="text-2xl md:text-3xl italic text-light-gray leading-relaxed">
                    "A Sólido Engenharia foi excecional. O rigor no planeamento e a transparência na comunicação superaram todas as nossas expectativas. O resultado final é a prova da sua dedicação e mestria."
                </p>
                <div class="mt-8">
                    <p class="font-bold text-white text-lg">Joana Martins</p>
                    <p class="text-mid-gray">Gestora de Projecto, Innovatech</p>
                </div>
            </div>
        </section>

        <!-- Secção Contacto -->
        <section id="contacto" class="py-20 md:py-32 bg-dark">
            <div class="container mx-auto px-6">
                <div class="grid lg:grid-cols-2 gap-16 items-center">
                    <div class="scroll-reveal">
                        <span class="text-primary uppercase tracking-widest font-semibold">Vamos construir juntos</span>
                        <h2 class="text-3xl md:text-4xl font-bold mt-2 mb-8 text-white">Tem um Projecto em Mente?</h2>

                        <div class="space-y-6">
                            <div class="flex items-start space-x-4">
                               <div class="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg></div>
                                <div>
                                    <h4 class="font-semibold text-white">Localização</h4>
                                    <p class="text-mid-gray">Maputo Av rio Tembe rua Major couto casa 1</p>
                                </div>
                            </div>
                            <div class="flex items-start space-x-4">
                                <div class="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg></div>
                                <div>
                                    <h4 class="font-semibold text-white">Email</h4>
                                    <a href="mailto:emenjoseph7@gmail.com" class="text-mid-gray hover:text-primary transition">emenjoseph7@gmail.com</a>
                                </div>
                            </div>
                            <div class="flex items-start space-x-4">
                                <div class="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mt-1"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></div>
                                <div>
                                    <h4 class="font-semibold text-white">Telefone</h4>
                                    <a href="tel:225885525361" class="text-mid-gray hover:text-primary transition">225885525361</a>
                                </div>
                            </div>
                        </div>

                        <a href="mailto:emenjoseph7@gmail.com" class="mt-10 inline-block bg-primary text-dark font-bold uppercase tracking-wider py-3 px-8 rounded-sm hover:bg-yellow-300 transform hover:scale-105 transition-all duration-300">
                            Enviar Mensagem
                        </a>
                    </div>
                    <div class="h-80 md:h-full w-full rounded-lg overflow-hidden scroll-reveal" style="transition-delay: 200ms;">
                        <img src="https://picsum.photos/seed/1521791136064-7986c2920216/2670/1502" alt="Aperto de mão a selar um negócio" class="w-full h-full object-cover">
                    </div>
                </div>
            </div>
        </section>
</main>

    <!-- Footer -->
    <footer class="bg-[#0D0F16] py-12">
        <div class="container mx-auto px-6 text-center text-mid-gray">
            <a href="#home" class="text-2xl font-bold tracking-wider text-light-gray mb-4 inline-block">
                SÓLIDO<span class="text-primary">.</span>
            </a>
            <p class="max-w-md mx-auto mb-6 text-sm">Construindo o futuro com a solidez da experiência e a visão da inovação.</p>
            <div class="flex justify-center space-x-6 mb-8">
                <a href="#" class="hover:text-primary transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd" /></svg></a>
                <a href="#" class="hover:text-primary transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg></a>
                <a href="#" class="hover:text-primary transition-colors"><svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fill-rule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.085-.62-.073-1.353.03-2.022.19-.638.933-3.951.933-3.951s-.239-.478-.239-1.186c0-1.115.648-1.944 1.458-1.944.685 0 1.013.513 1.013 1.127 0 .686-.437 1.712-.663 2.663-.186.791.396 1.442 1.18 1.442 1.421 0 2.518-1.503 2.518-3.682 0-1.934-1.37-3.32-3.155-3.32-2.132 0-3.386 1.596-3.386 3.201 0 .615.228 1.284.512 1.664a.37.37 0 01.077.28c-.078.301-.253.995-.298 1.18-.052.215-.201.265-.402.16-1.55-.6-2.52-2.322-2.52-4.215 0-2.844 2.06-5.328 5.782-5.328 3.034 0 5.132 2.15 5.132 4.882 0 3.01-1.843 5.25-4.402 5.25-1.196 0-2.31-.611-2.688-1.319l-.764 2.899c-.266 1.026-.995 2.34-1.495 3.127C9.366 21.604 10.655 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" clip-rule="evenodd" /></svg></a>
            </div>
            <p class="text-sm">&copy; <span id="year"></span> Sólido Engenharia. Todos os direitos reservados.</p>
        </div>
    </footer>

    <script>
        // Navbar scroll effect
        const navbar = document.getElementById('navbar');
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('py-2', 'bg-dark');
                navbar.classList.remove('py-4', 'bg-black/30');
            } else {
                navbar.classList.remove('py-2', 'bg-dark');
                navbar.classList.add('py-4', 'bg-black/30');
            }
        });

        // Mobile menu toggle
        const mobileMenuButton = document.getElementById('mobile-menu-button');
        const mobileMenu = document.getElementById('mobile-menu');
        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        
        // Close mobile menu on link click
        mobileMenu.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                mobileMenu.classList.add('hidden');
            }
        });

        // Footer year
        document.getElementById('year').textContent = new Date().getFullYear();

        // Scroll Reveal animation
        const revealElements = document.querySelectorAll('.scroll-reveal');
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    // observer.unobserve(entry.target); // Optional: unobserve after revealing
                }
            });
        }, {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        });

        revealElements.forEach(el => {
            observer.observe(el);
        });
    </script>
</body>
</html>`;
