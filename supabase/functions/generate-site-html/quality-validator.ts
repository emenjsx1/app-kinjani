// Sistema de validação de qualidade para HTML gerado
// Verifica se o output atende aos padrões modernos e profissionais

export interface QualityCheckResult {
  passed: boolean;
  score: number; // 0-100
  issues: string[];
  warnings: string[];
  suggestions: string[];
}

export function validateHTMLQuality(html: string): QualityCheckResult {
  const issues: string[] = [];
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Remove espaços extras para análise
  const cleanHtml = html.trim();

  // ============================================================================
  // VERIFICAÇÕES CRÍTICAS (Falha automática se não passar)
  // ============================================================================

  // 1. Verifica se começa com DOCTYPE
  if (!cleanHtml.toLowerCase().startsWith('<!doctype html>')) {
    issues.push('HTML não começa com <!DOCTYPE html>');
    score -= 20;
  }

  // 2. Verifica se tem Tailwind CDN
  if (!html.includes('cdn.tailwindcss.com')) {
    issues.push('Tailwind CSS CDN não encontrado');
    score -= 15;
  }

  // 3. Verifica se tem Google Fonts
  if (!html.includes('fonts.googleapis.com') && !html.includes('fonts.gstatic.com')) {
    warnings.push('Google Fonts não carregadas - usando fontes system');
    score -= 10;
  }

  // 4. Verifica Lorem Ipsum (PROIBIDO)
  if (html.toLowerCase().includes('lorem ipsum') || html.includes('Lorem Ipsum')) {
    issues.push('CRÍTICO: Contém Lorem Ipsum - texto placeholder não é permitido');
    score -= 25;
  }

  // 5. Verifica meta viewport
  if (!html.includes('viewport')) {
    issues.push('Meta viewport ausente - não é responsivo');
    score -= 15;
  }

  // 6. Verifica title e description
  if (!html.match(/<title>.*?<\/title>/)) {
    warnings.push('Tag <title> ausente ou vazia');
    score -= 5;
  }
  if (!html.includes('name="description"')) {
    warnings.push('Meta description ausente');
    score -= 5;
  }

  // ============================================================================
  // VERIFICAÇÕES DE DESIGN MODERNO
  // ============================================================================

  // 7. Verifica CSS variables (cores customizadas)
  if (!html.includes('--') || !html.includes(':root') && !html.includes('--primary')) {
    warnings.push('CSS variables não definidas - paleta de cores pode não ser coerente');
    score -= 8;
  }

  // 8. Verifica animações CSS
  if (!html.includes('@keyframes') && !html.includes('animation:')) {
    warnings.push('Nenhuma animação CSS encontrada - site pode parecer estático');
    score -= 10;
  }

  // 9. Verifica IntersectionObserver (scroll reveal)
  if (!html.includes('IntersectionObserver')) {
    warnings.push('IntersectionObserver não implementado - sem scroll reveal');
    score -= 10;
  }

  // 10. Verifica backdrop-blur (glassmorphism)
  if (!html.includes('backdrop-blur')) {
    suggestions.push('Considere usar backdrop-blur para efeitos modernos');
    score -= 3;
  }

  // 11. Verifica gradientes
  const hasGradients = html.includes('gradient') || html.includes('from-') && html.includes('to-');
  if (!hasGradients) {
    suggestions.push('Considere adicionar gradientes para visual mais moderno');
    score -= 3;
  }

  // 12. Verifica hover effects
  const hoverCount = (html.match(/hover:/g) || []).length;
  if (hoverCount < 5) {
    warnings.push(`Poucos hover effects (${hoverCount}) - adicione mais interatividade`);
    score -= 8;
  }

  // 13. Verifica transitions
  if (!html.includes('transition')) {
    warnings.push('Nenhuma transition CSS - interações podem parecer bruscas');
    score -= 8;
  }

  // ============================================================================
  // VERIFICAÇÕES DE ESTRUTURA
  // ============================================================================

  // 14. Verifica número de secções
  const sectionCount = (html.match(/<section/g) || []).length;
  if (sectionCount < 4) {
    warnings.push(`Poucas secções (${sectionCount}) - site pode parecer vazio`);
    score -= 10;
  }

  // 15. Verifica navbar
  const hasNav = html.includes('<nav') || html.includes('<header');
  if (!hasNav) {
    issues.push('Navbar/Header não encontrado');
    score -= 15;
  }

  // 16. Verifica footer
  if (!html.includes('<footer')) {
    warnings.push('Footer não encontrado');
    score -= 8;
  }

  // 17. Verifica mobile menu
  if (hasNav && !html.includes('mobile-menu') && !html.includes('hamburger')) {
    warnings.push('Mobile menu pode não estar implementado');
    score -= 8;
  }

  // ============================================================================
  // VERIFICAÇÕES DE RESPONSIVIDADE
  // ============================================================================

  // 18. Verifica breakpoints Tailwind
  const breakpoints = ['sm:', 'md:', 'lg:', 'xl:'];
  const breakpointCount = breakpoints.reduce((count, bp) => {
    return count + (html.match(new RegExp(bp, 'g')) || []).length;
  }, 0);

  if (breakpointCount < 10) {
    warnings.push('Poucos breakpoints responsivos - pode não funcionar bem em mobile');
    score -= 10;
  }

  // ============================================================================
  // VERIFICAÇÕES DE QUALIDADE DE CÓDIGO
  // ============================================================================

  // 19. Verifica tags semânticas
  const semanticTags = ['<section', '<article', '<header', '<footer', '<nav', '<main'];
  const semanticCount = semanticTags.reduce((count, tag) => {
    return count + (html.match(new RegExp(tag, 'g')) || []).length;
  }, 0);

  if (semanticCount < 5) {
    suggestions.push('Use mais tags semânticas (section, article, etc)');
    score -= 3;
  }

  // 20. Verifica espaçamento generoso
  const hasPadding = html.includes('py-20') || html.includes('py-24') || html.includes('py-32');
  if (!hasPadding) {
    warnings.push('Espaçamento pode ser insuficiente - use py-20 ou py-32');
    score -= 5;
  }

  // 21. Verifica se tem JavaScript funcional
  if (!html.includes('<script>') && !html.includes('<script ')) {
    warnings.push('Nenhum JavaScript encontrado - funcionalidades podem não funcionar');
    score -= 8;
  }

  // ============================================================================
  // VERIFICAÇÕES DE CONTEÚDO
  // ============================================================================

  // 22. Verifica comprimento do conteúdo
  if (html.length < 5000) {
    warnings.push('HTML muito curto - site pode parecer vazio');
    score -= 10;
  }

  // 23. Verifica imagens
  const imgCount = (html.match(/<img/g) || []).length;
  if (imgCount < 3) {
    suggestions.push('Considere adicionar mais imagens para visual mais rico');
    score -= 3;
  }

  // 24. Verifica CTAs (Call to Actions)
  const ctaCount = (html.match(/button|btn|cta/gi) || []).length;
  if (ctaCount < 2) {
    warnings.push('Poucos CTAs - adicione mais calls to action');
    score -= 5;
  }

  // ============================================================================
  // VERIFICAÇÕES DE PADRÕES MODERNOS
  // ============================================================================

  // 25. Verifica rounded corners modernos
  const hasModernRounding = html.includes('rounded-2xl') || html.includes('rounded-3xl');
  if (!hasModernRounding) {
    suggestions.push('Use rounded-2xl ou rounded-3xl para visual mais moderno');
    score -= 2;
  }

  // 26. Verifica shadow effects
  const hasShadows = html.includes('shadow-') && (html.includes('shadow-lg') || html.includes('shadow-xl') || html.includes('shadow-2xl'));
  if (!hasShadows) {
    suggestions.push('Adicione shadows (shadow-lg, shadow-xl) para profundidade');
    score -= 2;
  }

  // 27. Verifica grid assimétrico
  const hasAsymmetricGrid = html.includes('col-span-2') || html.includes('row-span-2');
  if (!hasAsymmetricGrid) {
    suggestions.push('Use grids assimétricos (col-span, row-span) para layouts mais interessantes');
    score -= 3;
  }

  // ============================================================================
  // CÁLCULO FINAL
  // ============================================================================

  // Garante que score não seja negativo
  score = Math.max(0, Math.min(100, score));

  const passed = issues.length === 0 && score >= 70;

  return {
    passed,
    score,
    issues,
    warnings,
    suggestions
  };
}

// Função auxiliar para formatar o relatório de qualidade
export function formatQualityReport(result: QualityCheckResult): string {
  let report = `\n═══════════════════════════════════════════════════════════════════════════════\n`;
  report += `📊 RELATÓRIO DE QUALIDADE DO HTML\n`;
  report += `═══════════════════════════════════════════════════════════════════════════════\n\n`;

  report += `Score: ${result.score}/100 ${result.passed ? '✅ APROVADO' : '❌ REPROVADO'}\n\n`;

  if (result.issues.length > 0) {
    report += `🚨 PROBLEMAS CRÍTICOS (${result.issues.length}):\n`;
    result.issues.forEach((issue, i) => {
      report += `   ${i + 1}. ${issue}\n`;
    });
    report += `\n`;
  }

  if (result.warnings.length > 0) {
    report += `⚠️  AVISOS (${result.warnings.length}):\n`;
    result.warnings.forEach((warning, i) => {
      report += `   ${i + 1}. ${warning}\n`;
    });
    report += `\n`;
  }

  if (result.suggestions.length > 0) {
    report += `💡 SUGESTÕES (${result.suggestions.length}):\n`;
    result.suggestions.forEach((suggestion, i) => {
      report += `   ${i + 1}. ${suggestion}\n`;
    });
    report += `\n`;
  }

  report += `═══════════════════════════════════════════════════════════════════════════════\n`;

  return report;
}
