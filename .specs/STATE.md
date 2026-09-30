# STATE

## Decisions

### AD-001
- **Decision**: Vite + React 18 + TypeScript como stack frontend (sem Create React App)
- **Reason**: CRA está descontinuado; Vite oferece HMR instantâneo e zero-config para TS+React
- **Trade-off**: Menor ecossistema de plugins vs CRA, mas sem custo prático no escopo MVP
- **Scope**: toda a aplicação frontend
- **Date**: 2026-09-29
- **Status**: superseded by AD-008

### AD-002
- **Decision**: Tailwind CSS para todos os estilos (sem CSS Modules ou styled-components)
- **Reason**: Velocidade de iteração no MVP; classes auto-documentadas; sem problemas de escopo
- **Trade-off**: Verbosidade no JSX; migração para CSS Modules possível se o app crescer
- **Scope**: todos os componentes de UI
- **Date**: 2026-09-29
- **Status**: superseded by AD-009

### AD-003
- **Decision**: Zustand para estado global de StudyState (preferência sobre React Context)
- **Reason**: API simples sem Provider wrapping; sem re-renders desnecessários; integra bem com storage persistente
- **Trade-off**: Dependência extra vs Context nativo do React
- **Scope**: hook useStudyState e toda a lógica de progressão
- **Date**: 2026-09-29
- **Status**: active

### AD-004
- **Decision**: Chamada direta à API Anthropic do app mobile (sem backend proxy)
- **Reason**: MVP pessoal; sem dados sensíveis além da API key do próprio usuário; evita custo de infraestrutura
- **Trade-off**: API key armazenada localmente no device — aceitável para uso pessoal single-user; mitigado pelo AD-010 (SecureStore)
- **Scope**: módulo claudeApi.ts e hook useClaudeChat
- **Date**: 2026-09-29
- **Status**: active

### AD-005
- **Decision**: localStorage para persistência de estado (sem IndexedDB ou backend)
- **Reason**: Estado de progresso < 5KB; síncrono e simples; single-user sem necessidade de sync entre dispositivos
- **Trade-off**: Limite ~5MB por origem; sem backup automático — aceitável no escopo MVP
- **Scope**: storage.ts e chave "ia-assistente-estudos-state-v1"
- **Date**: 2026-09-29
- **Status**: superseded by AD-010

### AD-006
- **Decision**: marked + DOMPurify para renderização de Markdown nas respostas de Claude
- **Reason**: Claude frequentemente responde com código e bullets; Markdown melhora legibilidade; DOMPurify previne XSS
- **Trade-off**: Dependências extras (~30KB); alternativa seria react-markdown
- **Scope**: componente MessageBubble
- **Date**: 2026-09-29
- **Status**: superseded by AD-011

### AD-008
- **Decision**: React Native + Expo SDK 52 (managed workflow) + TypeScript como stack mobile
- **Reason**: App precisa rodar em iOS e Android; Expo managed workflow reduz fricção de build nativo; OTA updates via EAS Update; suporte oficial a TypeScript
- **Trade-off**: Managed workflow limita acesso a módulos nativos arbitrários — aceitável pois todas as libs necessárias têm suporte Expo; ejetar para bare workflow possível se necessário
- **Scope**: toda a aplicação (substitui Vite+React web)
- **Date**: 2026-09-29
- **Status**: active

### AD-009
- **Decision**: NativeWind v4 (Tailwind CSS para React Native) como solução de styling
- **Reason**: Preserva o DX de Tailwind do projeto web anterior; classes utilitárias funcionam em RN via `className`; sem necessidade de aprender StyleSheet API separada
- **Trade-off**: NativeWind v4 ainda tem algumas classes web sem equivalente nativo (ex: `grid`) — usar Flexbox nativo nesses casos
- **Scope**: todos os componentes de UI
- **Date**: 2026-09-29
- **Status**: active

### AD-010
- **Decision**: react-native-mmkv para estado de progresso + expo-secure-store para API key
- **Reason**: MMKV é síncrono e ~30x mais rápido que AsyncStorage; expo-secure-store usa iOS Keychain / Android Keystore para a API key, eliminando o risco de exposição que existia com localStorage
- **Trade-off**: Duas libs de storage em vez de uma — trade-off intencional: MMKV para dados não-sensíveis (performance), SecureStore para dados sensíveis (segurança)
- **Scope**: storage.ts; chave de progresso "ia-assistente-estudos-state-v1"; chave da API key "anthropic-api-key"
- **Date**: 2026-09-29
- **Status**: active

### AD-011
- **Decision**: react-native-markdown-display para renderização de Markdown nas respostas de Claude
- **Reason**: Única lib madura de Markdown para React Native com suporte a code blocks; DOMPurify não é necessário em RN (sem injeção de HTML no DOM)
- **Trade-off**: Menos customizável que marked; estilo via `StyleSheet` em vez de CSS
- **Scope**: componente MessageBubble
- **Date**: 2026-09-29
- **Status**: active

### AD-012
- **Decision**: Tab navigation via Expo Router (duas abas: Dashboard e Chat)
- **Reason**: Layout de dois painéis lado a lado não faz sentido em telas mobile; tabs são o padrão nativo para alternar entre duas visões principais; Expo Router simplifica deep linking e navegação declarativa
- **Trade-off**: Usuário precisa trocar de aba para ver Dashboard e Chat simultaneamente — aceitável pois são contextos distintos de uso (estudar vs perguntar)
- **Scope**: estrutura de navegação do app (`app/(tabs)/index.tsx` e `app/(tabs)/chat.tsx`)
- **Date**: 2026-09-29
- **Status**: active

### AD-013
- **Decision**: EAS Build (Expo Application Services) para geração de binários iOS e Android
- **Reason**: Integração nativa com Expo SDK; CI/CD para builds na nuvem sem Mac local para iOS; suporte a OTA updates via EAS Update
- **Trade-off**: Custo de build na nuvem (tier gratuito tem limite mensal) vs alternativa local com Xcode/Android Studio
- **Scope**: pipeline de build e distribuição
- **Date**: 2026-09-29
- **Status**: active

### AD-007
- **Decision**: Modelo padrão claude-sonnet-5-5 com opção de mudar para claude-opus-5-5
- **Reason**: Sonnet oferece boa qualidade a menor custo para uso diário; Opus disponível para sessões mais exigentes
- **Trade-off**: Respostas levemente menos detalhadas vs Opus, mas significativamente mais baratas
- **Scope**: claudeApi.ts e campo de configuração (pós-MVP)
- **Date**: 2026-09-29
- **Status**: active

### AD-014
- **Decision**: Cross-tab prefill (QuickActions → Chat) via campo `pendingChatInput` no Zustand store, excluído do persist MMKV via `partialize`
- **Reason**: Tabs do Expo Router preservam estado independente; navigation params com `router.push` são voláteis e complicam deep linking; Zustand já é global — um campo transiente é a solução mais simples
- **Trade-off**: Estado de UI no store de domínio — aceitável porque é um único campo claramente nomeado e excluído da persistência
- **Scope**: useStudyState.ts, ChatInput.tsx, QuickActions.tsx
- **Date**: 2026-09-29
- **Status**: active

## Handoff

- **Feature**: assistente-estudos-mvp
- **Phase / Task**: ✅ FEATURE COMPLETA — todos os gaps fechados, validate_state.py exit 0.
- **Completed**: 24 tasks + 2 fix tests (ESTD-47, ESTD-50). 186 testes passando, 0 falhas, 19 suites. Commits: c8bb252..8abb412 (16 commits).
- **In-progress**: none
- **Next step**: Pronto para ship. Próximo: EAS Build para gerar binários iOS/Android (AD-013), ou início de nova feature.
- **Blockers**: none
- **Uncommitted files**: .specs/STATE.md (este update)
- **Branch**: main
