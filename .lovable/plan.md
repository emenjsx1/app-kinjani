## Panorama de Melhorias Identificadas

### 1. Erro de Build (TypeScript) — Em progresso
- `src/hooks/useWebsites.ts` tem um erro de tipo na função `updateWebsite`. Vou corrigir agora.

### 2. Warnings do Linter do Supabase (23 no total)
- **4x** Buckets de storage públicos permitem listagem de todos os ficheiros
- **7x** Funções `SECURITY DEFINER` podem ser executadas por utilizadores anónimos
- Outros warnings de schema/RLS

### 3. Edge Functions com `verify_jwt = false`
- Todas as edge functions (`whatsapp-agent`, `whatsapp-instance`, `agent-chat`, etc.) estão configuradas sem verificação JWT. Isto significa que podem ser chamadas por qualquer pessoa sem autenticação.

### 4. Integração WhatsApp / Evolution API
- O webhook foi configurado, mas pode haver problemas de sincronização entre instâncias e agentes.

---

**Sugestão de prioridade:**
1. Corrigir o erro de build (impede deploy)
2. Resolver os warnings de segurança mais críticos (funções públicas + buckets)
3. Revisar as edge functions que não exigem JWT

Queres que eu prossiga nesta ordem, ou tens outras prioridades em mente?