# Assistente de Estudos de IA — MVP Specification

## Problem Statement

Um plano de estudos de 14 semanas em IA aplicada existe apenas como documento estático Markdown. A cada sessão de estudo, o usuário começa do zero: não sabe onde parou, não tem contexto para pedir ajuda ao Claude, e não visualiza progresso. O app resolve os três problemas com um único dashboard + chat contextualizado persistido no browser.

## Goals

- [ ] Usuário abre o app e vê imediatamente: semana atual, fase, conceito e projeto em andamento — sem precisar consultar o plano
- [ ] Usuário pode pedir ajuda ao Claude com um clique, recebendo resposta contextualizada à fase/conceito/projeto atual
- [ ] Progresso (conceitos lidos, projetos concluídos, checklists) persiste entre sessões sem backend

## Out of Scope

Documentado para prevenir scope creep no MVP.

| Feature | Reason |
| ------- | ------ |
| Autenticação e múltiplos usuários | App pessoal single-user por design |
| Backend ou banco remoto | MMKV local cobre o caso de uso; sem necessidade de sync |
| Integração com Telegram, GitHub ou APIs externas (exceto Anthropic) | Fora do domínio do assistente de estudos |
| Web search ou RAG nos materiais | O currículo é estático e embutido no bundle |
| Notificações push ou agendamento | App on-demand, sem ciclo de notificação |
| App web / PWA (browser) | O app é nativo iOS e Android; não há target web |
| Exportação de progresso | Baixa prioridade pós-MVP |
| Edição de currículo via UI | Alta complexidade; currículo muda raramente |
| Dark mode | Baixa prioridade pós-MVP |
| Desfazer "marcar como lido" | MVP sem desfazer; baixo custo de re-visitar |
| Distribuição via App Store / Play Store no MVP | EAS Build gera o binário; submissão às lojas é pós-MVP |

---

## Assumptions & Open Questions

Todas as ambiguidades resolvidas ou registradas aqui.

| Assumption / decisão | Chosen default | Rationale | Confirmed? |
| -------------------- | -------------- | --------- | ---------- |
| Exibição do material do conceito | Modal full-screen nativa (React Native Modal ou Bottom Sheet) aberta ao tocar "MOSTRAR MATERIAL" | Padrão nativo mobile; permite scroll completo sem sair do contexto | n |
| Navegação principal | Tab navigation com 2 abas: "Dashboard" (ícone home) e "Chat" (ícone chat) via Expo Router | Padrão nativo iOS/Android para alternar entre visões principais; dois painéis side-by-side não funciona em telas mobile | n |
| Streaming vs resposta completa | Streaming desde o início | UX superior; streaming via fetch SSE funciona em React Native | n |
| Modelo padrão da API | `claude-sonnet-5-5` (hardcoded no MVP, sem campo de seleção na UI) | Custo-benefício superior para uso diário; configurável via código | n |
| Fase 1 tem dois projetos (P2 e P3) | Exibidos sequencialmente: P2 primeiro, P3 depois de P2 estar concluído | Sequência linear preserva o fluxo natural do currículo | n |
| Histórico de chat — escopo | Um único histórico global por sessão (não por conceito/projeto); não persistido entre sessões | Simplicidade; histórico de 20 msgs é suficiente para uma sessão de estudo | n |
| Semana atual calculada por | Tempo real desde `startDate` (não por progresso do usuário) | Implementação simples; pós-MVP pode adicionar modo manual | n |
| Inicialização zero-state | `startDate = Date.now()` na primeira carga | Usuário pode ajustar `startDate` diretamente no storage se necessário no MVP | n |
| Validação básica da API key | Verificar se começa com `"sk-ant-"` | Suficiente para feedback imediato sem chamar a API desnecessariamente | n |
| IDs de modelo Anthropic corretos | `claude-sonnet-5-5` e `claude-opus-5-5` (nomes exatos da API em setembro 2026) | Spec original menciona `claude-opus-5` que não é o ID exato; usar IDs reais da API | n |
| Storage de progresso | react-native-mmkv (síncrono, chave `"ia-assistente-estudos-state-v1"`); API key em expo-secure-store (chave `"anthropic-api-key"`) | MMKV para performance; SecureStore para segurança da API key usando Keychain/Keystore nativo | n |

**Open questions:** none — all resolved or logged above.

---

## User Stories

### P1: Dashboard de Progresso Atual ⭐ MVP

**User Story**: Como usuário, quero ver imediatamente ao abrir o app em que semana, fase, conceito e projeto estou, para não precisar consultar o plano a cada sessão.

**Why P1**: É a proposta de valor central do app — sem isso, o app não existe.

**Acceptance Criteria**:

1. WHEN the app loads THEN the system SHALL display the current week number (calculated as `ceil((Date.now() - startDate) / (7 * 24 * 3600 * 1000))`), current phase name, current concept title (or project title when mode is "project"), and current project title. <!-- event-driven -->
2. WHEN the user marks a concept as read or a project as done THEN the system SHALL update all dashboard elements without a page reload within 100ms. <!-- event-driven -->
3. The system SHALL display phase progress as the percentage of completed concepts in the current phase (e.g., "2/3 — 66%"). <!-- ubiquitous -->
4. The system SHALL display overall progress as the percentage of completed projects out of 9 total projects. <!-- ubiquitous -->
5. WHILE mode is "concept" the system SHALL display "Conceito X de Y" in the PhaseHeader, where X is the 1-based current concept index and Y is the total concepts in the phase. <!-- state-driven -->
6. WHILE mode is "project" the system SHALL display "Projeto X de Y" in the PhaseHeader instead of a concept reference. <!-- state-driven -->

**Independent Test**: Open the app with a pre-seeded localStorage state of Week 4 / Phase 1 / Concept 2 and verify the header renders "Semana 4/14 | FASE 1 — Ferramentas e Memória | Conceito 2 de 3".

---

### P1: Material do Conceito ⭐ MVP

**User Story**: Como usuário, quero ler o conteúdo completo do conceito atual sem sair do app, para estudar sem abrir documentos externos.

**Why P1**: Sem o material embutido, o app é apenas um rastreador — sem valor de estudo.

**Acceptance Criteria**:

1. WHEN the user clicks "MOSTRAR MATERIAL" THEN the system SHALL display the full concept content with sections: "Por que importa", "O que aprender", "Como aprender", "Recursos sugeridos", "Armadilhas comuns". <!-- event-driven -->
2. WHEN the user clicks "MOSTRAR MATERIAL" THEN the system SHALL display the estimated reading time for the concept in minutes. <!-- event-driven -->
3. WHEN the material panel is open and the user closes it THEN the system SHALL hide the material panel and restore the dashboard to its previous layout. <!-- event-driven -->
4. The system SHALL render concept content as plain text (no Markdown rendering required for concept material in MVP). <!-- ubiquitous -->

**Independent Test**: Click "MOSTRAR MATERIAL" for any concept and verify all 5 sections appear with a reading time label; click close and verify the panel disappears.

---

### P1: Progressão de Conceitos ⭐ MVP

**User Story**: Como usuário, quero marcar um conceito como lido com um clique e ter o app avançando automaticamente para o próximo, para manter o ritmo de estudo sem navegação manual.

**Why P1**: É o loop principal de interação do app — estudar → marcar → avançar.

**Acceptance Criteria**:

1. WHEN the user clicks "MARCAR COMO LIDO" on a concept AND remaining unread concepts exist in the current phase THEN the system SHALL add the concept ID to `completedConcepts`, increment `currentConceptIndex`, and display the next concept card. <!-- event-driven -->
2. WHEN the user clicks "MARCAR COMO LIDO" on the last concept of a phase THEN the system SHALL set `mode` to "project", set `currentProjectIndex` to 0, and display the first project card of the current phase. <!-- event-driven -->
3. WHEN a concept is marked as read THEN the system SHALL persist the updated `StudyState` to localStorage before updating the UI. <!-- event-driven -->
4. The system SHALL NOT provide an undo button for "MARCAR COMO LIDO" in MVP. <!-- ubiquitous -->

**Independent Test**: Pre-seed state at Phase 0 / Concept 2 (last concept). Click "MARCAR COMO LIDO" and verify mode switches to "project" and the project card for Phase 0 appears.

---

### P1: Checklist do Projeto ⭐ MVP

**User Story**: Como usuário, quero ver os passos e critérios de pronto do projeto atual com checkboxes individuais, para rastrear meu progresso no projeto sem documentos externos.

**Why P1**: Sem visibilidade dos passos do projeto, o modo "project" fica incompleto.

**Acceptance Criteria**:

1. WHILE mode is "project" the system SHALL display the project title, description, all project steps with individual checkboxes, and all readiness criteria with individual checkboxes. <!-- state-driven -->
2. WHILE mode is "project" AND no step is checked the system SHALL display project status as "Não iniciado". <!-- state-driven -->
3. WHEN any step checkbox is checked AND at least one step remains unchecked THEN the system SHALL display project status as "Em Progresso". <!-- event-driven -->
4. WHEN all step checkboxes are checked AND the project has not been marked as done THEN the system SHALL display project status as "Aguardando Revisão". <!-- event-driven -->
5. WHEN a step or criteria checkbox state changes THEN the system SHALL persist the updated `projectStepStates` / `projectCriteriaStates` to localStorage before updating the UI. <!-- event-driven -->

**Independent Test**: Pre-seed state in project mode for Project 2 with 2 of 5 steps checked. Verify status shows "Em Progresso". Check all remaining steps and verify status changes to "Aguardando Revisão".

---

### P1: Conclusão de Projeto e Avanço de Fase ⭐ MVP

**User Story**: Como usuário, quero marcar um projeto como pronto e ter o app avançando para a próxima fase, com aviso se os critérios ainda não estiverem satisfeitos.

**Why P1**: Sem conclusão de projeto, não há progressão entre fases — o app fica preso na Fase 0.

**Acceptance Criteria**:

1. WHEN the user clicks "MARCAR COMO PRONTO" AND all readiness criteria checkboxes are checked THEN the system SHALL add the project ID to `completedProjects`, advance to the next phase (or next project within Phase 1), and update the PhaseHeader. <!-- event-driven -->
2. WHEN the user clicks "MARCAR COMO PRONTO" AND one or more readiness criteria are unchecked THEN the system SHALL display an inline warning message "Ainda há critérios de pronto não marcados. Deseja avançar mesmo assim?" with Confirm and Cancel buttons. <!-- event-driven -->
3. WHEN the user confirms advancement despite unchecked criteria THEN the system SHALL advance to the next phase following the same logic as AC-1. <!-- event-driven -->
4. WHEN the user cancels the advancement dialog THEN the system SHALL return to the project card without modifying any state. <!-- event-driven -->
5. WHEN a project is marked as done THEN the system SHALL persist the updated state to localStorage before updating the UI. <!-- event-driven -->

**Independent Test**: In project mode with all criteria unchecked, click "MARCAR COMO PRONTO". Verify warning appears. Click Cancel, verify state unchanged. Check all criteria, click again — verify no warning and phase advances.

---

### P1: Chat com Claude Contextualizado ⭐ MVP

**User Story**: Como usuário, quero conversar com Claude já ciente da minha fase, conceito e projeto atuais, para obter ajuda relevante sem precisar dar contexto manualmente.

**Why P1**: O chat contextualizado é o segundo diferencial central do app — é o "professor sempre informado".

**Acceptance Criteria**:

1. WHEN the user sends a chat message THEN the system SHALL send the Anthropic Messages API a request with a system prompt containing: current week number, current phase name and objective, current concept title, whyItMatters, whatToLearn, howToLearn, resources, and current project title, steps, and readiness criteria. <!-- event-driven -->
2. WHEN a chat request starts THEN the system SHALL display a loading indicator in the message list and disable the send button until the response stream completes. <!-- event-driven -->
3. WHEN Claude's response streams THEN the system SHALL update the assistant message content progressively with each SSE chunk delta. <!-- event-driven -->
4. WHEN any chat message is appended to the list THEN the system SHALL scroll the message list to the bottom automatically. <!-- event-driven -->
5. IF the Anthropic API returns HTTP 401 THEN the system SHALL display "API key inválida. Verifique a configuração." as an error message without clearing the existing chat history. <!-- unwanted-behavior -->
6. IF the Anthropic API returns HTTP 429 THEN the system SHALL display "Limite de requisições atingido. Aguarde um momento." without clearing the existing chat history. <!-- unwanted-behavior -->
7. IF the Anthropic API returns HTTP 500, 502, or 503 THEN the system SHALL display "Erro nos servidores da Anthropic. Tente novamente." without clearing the existing chat history. <!-- unwanted-behavior -->
8. IF the network request fails due to no connectivity THEN the system SHALL display "Sem conexão com a internet." without clearing the existing chat history. <!-- unwanted-behavior -->
9. WHEN the in-flight chat message history exceeds 20 messages THEN the system SHALL truncate the oldest user/assistant messages before sending to the API, preserving the system prompt in every request. <!-- event-driven -->
10. The system SHALL render Claude's responses as Markdown using `react-native-markdown-display` with a custom style object applied to code blocks and body text. <!-- ubiquitous -->
11. The system SHALL use model `claude-sonnet-5-5` for all API calls in MVP. <!-- ubiquitous -->

**Independent Test**: With a valid API key set, send a message "O que é o loop ReAct?" while in Phase 0 / Concept 1. Verify the response streams progressively and references Phase 0 context. Verify XSS sanitization by checking that a simulated response containing `<script>alert(1)</script>` renders as escaped text.

---

### P1: Ações Rápidas no Chat ⭐ MVP

**User Story**: Como usuário, quero botões que pré-preenchem o chat com perguntas contextuais comuns, para iniciar conversas com Claude com um único clique.

**Why P1**: Reduz a fricção de formular a pergunta certa — especialmente importante em sessões de estudo focadas.

**Acceptance Criteria**:

1. WHEN the user clicks "Explique este conceito" THEN the system SHALL set the chat input value to "Me explique o conceito atual: [currentConcept.title]". <!-- event-driven -->
2. WHEN the user clicks "Ajude no projeto" THEN the system SHALL set the chat input value to "Preciso de ajuda com o projeto atual: [currentProject.title]. Estou no passo: [title of the first uncompleted step]". <!-- event-driven -->
3. WHEN the user clicks "Próximos passos" THEN the system SHALL set the chat input value to "Quais são os próximos passos no meu plano depois de completar o conceito/projeto atual?". <!-- event-driven -->
4. WHEN the user clicks "AJUDA COM ESTE CONCEITO" on the ConceptCard THEN the system SHALL pre-fill the input with the same text as "Explique este conceito" and scroll the chat panel into view. <!-- event-driven -->
5. WHILE the API key is not configured THEN the system SHALL not display the quick action buttons. <!-- state-driven -->

**Independent Test**: In concept mode (Phase 1 / Concept 2: RAG), click "Explique este conceito". Verify input contains "Me explique o conceito atual: RAG — Recall Semântico". Do not submit; clear and verify no side effects.

---

### P1: Configuração de API Key ⭐ MVP

**User Story**: Como usuário, quero configurar minha Anthropic API key diretamente no app e tê-la salva para sessões futuras, sem precisar reconfigurar cada vez.

**Why P1**: Sem API key, o chat não funciona — é um prerequisite para a funcionalidade principal.

**Acceptance Criteria**:

1. WHEN the user opens the API key configuration screen, enters a string starting with "sk-ant-", and taps "Salvar" THEN the system SHALL save the key to expo-secure-store under key `"anthropic-api-key"` and enable the chat interface. <!-- event-driven -->
2. IF the user enters a string that does not start with "sk-ant-" and clicks "Salvar" THEN the system SHALL display a validation error message inline and not save the key. <!-- unwanted-behavior -->
3. WHILE the API key is not configured THEN the system SHALL display the chat panel in a disabled state with the message "Configure sua API key para usar o chat". <!-- state-driven -->
4. WHEN the API key is already configured THEN the system SHALL display only the last 4 characters of the key masked (e.g., "••••••••••••abcd") in the configuration field. <!-- event-driven -->
5. The system SHALL never display the full API key in any UI element or pass it to any destination other than the `x-api-key` header of Anthropic API requests. <!-- ubiquitous -->
6. WHEN the API key is saved successfully THEN the system SHALL close the configuration popover and show a brief confirmation state on the settings icon. <!-- event-driven -->

**Independent Test**: Open a fresh app (no localStorage). Verify chat is disabled. Click ⚙️, enter "sk-ant-testkey1234", click Salvar. Verify chat becomes enabled. Reload the page, open ⚙️, verify key shows as "••••1234".

---

### P1: Persistência entre Sessões ⭐ MVP

**User Story**: Como usuário, quero que meu progresso (fase, conceito, checklists) seja restaurado automaticamente ao recarregar o app, para nunca perder onde estava.

**Why P1**: Sem persistência, o app é inútil após um refresh — perde todo o valor de rastreamento.

**Acceptance Criteria**:

1. WHEN the app resumes from background or is reopened THEN the system SHALL restore: `currentPhaseId`, `currentConceptIndex`, `currentProjectIndex`, `mode`, `completedConcepts`, `completedProjects`, `projectStepStates`, and `projectCriteriaStates` from MMKV storage, and `apiKey` from expo-secure-store. <!-- event-driven -->
2. WHEN the app resumes THEN the system SHALL NOT restore the chat message history (ephemeral by design). <!-- event-driven -->
3. IF the MMKV value for `"ia-assistente-estudos-state-v1"` is absent THEN the system SHALL initialize state with defaults: Phase 0, conceptIndex 0, projectIndex 0, mode "concept", startDate `Date.now()`, empty completed arrays and checklist maps. <!-- unwanted-behavior -->
4. IF the MMKV value is present but fails JSON parsing THEN the system SHALL initialize with the default state, log a warning to `console.warn`, and continue normally without throwing. <!-- unwanted-behavior -->
5. The system SHALL use the MMKV key `"ia-assistente-estudos-state-v1"` for progress state and the SecureStore key `"anthropic-api-key"` for the API key. <!-- ubiquitous -->
6. WHEN the state changes THEN the system SHALL write the updated state to MMKV synchronously (via Zustand persist middleware with MMKV adapter) before the next render. <!-- event-driven -->

**Independent Test**: Set state to Phase 1 / Concept 3, mark one project step as checked. Hard-reload the page. Verify all fields are restored exactly. Verify chat history is empty.

---

### P2: Layout e Navegação Nativa

**User Story**: Como usuário, quero navegar entre o dashboard e o chat com a experiência nativa do meu dispositivo (iOS ou Android), sem estranheza de UX.

**Why P2**: Usabilidade nativa é esperada; o diferencial do app está no conteúdo, não na navegação.

**Acceptance Criteria**:

1. The system SHALL display a bottom tab bar with two tabs: "Dashboard" (home icon) and "Chat" (chat bubble icon), following the native tab bar conventions of iOS and Android. <!-- ubiquitous -->
2. WHEN the user taps a tab THEN the system SHALL navigate to that screen without losing the state of the other screen. <!-- event-driven -->
3. WHEN the user taps "MOSTRAR MATERIAL" THEN the system SHALL present the concept material as a full-screen modal with a close button, overlaying the current tab. <!-- event-driven -->
4. The system SHALL meet WCAG AA minimum color contrast ratio (4.5:1 for normal text, 3:1 for large text) for all text elements. <!-- ubiquitous -->

**Independent Test**: Open the app, tap between Dashboard and Chat tabs multiple times — verify state is preserved. On Dashboard tab, tap "MOSTRAR MATERIAL" — verify full-screen modal appears with close button. Tap close — verify modal dismisses and dashboard is intact.

---

### P2: Timeline Visual de 14 Semanas

**User Story**: Como usuário, quero visualizar minha jornada de 14 semanas em uma barra horizontal colorida por fase, para ter perspectiva do progresso total.

**Why P2**: Motivacional e orientador, mas o app é funcionalmente completo sem isso.

**Acceptance Criteria**:

1. WHEN the app loads THEN the system SHALL display a horizontal timeline with 14 week slots grouped into 7 phase segments, each segment with a distinct color per the color table (Phase 0: dark blue, Phase 1: purple, Phase 2: orange, Phase 3: green, Phase 4: yellow, Phase 5: red, Capstone: gold). <!-- event-driven -->
2. The system SHALL visually highlight the current week slot in the timeline (distinct border or indicator). <!-- ubiquitous -->
3. WHEN a phase is completed THEN the system SHALL display that phase's segment with reduced opacity (≤ 50%) in the timeline. <!-- event-driven -->
4. WHEN the user presses and holds a phase segment THEN the system SHALL display a popover with the phase name and project titles for that phase. <!-- event-driven -->

**Independent Test**: Pre-seed state at Week 5 / Phase 1 complete / Phase 2 active. Verify Phase 1 segment is low-opacity, Week 5 slot is highlighted. Press and hold Phase 2 segment and verify popover shows "FASE 2 — Sensores: Evals e Guardrails" with project names.

---

## Edge Cases

- IF the user navigates to the app after Week 14 (startDate + 98 days) THEN the system SHALL cap the displayed week at 14 and continue normal operation. <!-- unwanted-behavior -->
- IF `currentConceptIndex` in stored state is out of bounds for the loaded curriculum THEN the system SHALL reset to index 0 of the current phase and log a `console.warn`. <!-- unwanted-behavior -->
- IF all phases and projects are marked complete THEN the system SHALL display a completion state ("Parabéns! Plano concluído.") without crashing. <!-- unwanted-behavior -->
- WHEN the chat send button is clicked with an empty input THEN the system SHALL NOT send the request and SHALL keep the input focused. <!-- event-driven -->
- IF the streaming response is interrupted mid-stream (network drop) THEN the system SHALL display the accumulated partial response and an error indicator without clearing previous messages. <!-- unwanted-behavior -->
- IF localStorage is full (quota exceeded) THEN the system SHALL catch the storage error, display a warning "Não foi possível salvar o progresso. Espaço de armazenamento insuficiente.", and continue operating without crashing. <!-- unwanted-behavior -->
- WHEN the app is used offline (no network) AND the API key is configured THEN the system SHALL allow all non-chat features (progress tracking, material viewing) to work normally. <!-- event-driven -->

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| ESTD-01 | P1: Dashboard — current state display | Design | Pending |
| ESTD-02 | P1: Dashboard — real-time update < 100ms | Design | Pending |
| ESTD-03 | P1: Dashboard — phase progress % | Design | Pending |
| ESTD-04 | P1: Dashboard — overall progress % | Design | Pending |
| ESTD-05 | P1: Dashboard — concept X of Y in header | Design | Pending |
| ESTD-06 | P1: Dashboard — project X of Y in header | Design | Pending |
| ESTD-07 | P1: Material — display 5 sections | Design | Pending |
| ESTD-08 | P1: Material — display reading time | Design | Pending |
| ESTD-09 | P1: Material — close panel | Design | Pending |
| ESTD-10 | P1: Material — plain text rendering | Design | Pending |
| ESTD-11 | P1: Concept progression — advance to next concept | Design | Pending |
| ESTD-12 | P1: Concept progression — last concept triggers project mode | Design | Pending |
| ESTD-13 | P1: Concept progression — persist before UI update | Design | Pending |
| ESTD-14 | P1: Concept progression — no undo | Design | Pending |
| ESTD-15 | P1: Checklist — display steps and criteria | Design | Pending |
| ESTD-16 | P1: Checklist — status "Não iniciado" | Design | Pending |
| ESTD-17 | P1: Checklist — status "Em Progresso" | Design | Pending |
| ESTD-18 | P1: Checklist — status "Aguardando Revisão" | Design | Pending |
| ESTD-19 | P1: Checklist — persist on checkbox change | Design | Pending |
| ESTD-20 | P1: Project done — advance with all criteria checked | Design | Pending |
| ESTD-21 | P1: Project done — warning if criteria unchecked | Design | Pending |
| ESTD-22 | P1: Project done — confirm advance despite warning | Design | Pending |
| ESTD-23 | P1: Project done — cancel keeps state | Design | Pending |
| ESTD-24 | P1: Project done — persist before UI update | Design | Pending |
| ESTD-25 | P1: Chat — system prompt with full context | Design | Pending |
| ESTD-26 | P1: Chat — loading indicator + disabled send | Design | Pending |
| ESTD-27 | P1: Chat — progressive streaming render | Design | Pending |
| ESTD-28 | P1: Chat — auto-scroll to bottom | Design | Pending |
| ESTD-29 | P1: Chat — error 401 handling | Design | Pending |
| ESTD-30 | P1: Chat — error 429 handling | Design | Pending |
| ESTD-31 | P1: Chat — error 5xx handling | Design | Pending |
| ESTD-32 | P1: Chat — offline error handling | Design | Pending |
| ESTD-33 | P1: Chat — message truncation at 20 | Design | Pending |
| ESTD-34 | P1: Chat — Markdown via react-native-markdown-display | Design | Pending |
| ESTD-35 | P1: Chat — model claude-sonnet-5-5 | Design | Pending |
| ESTD-36 | P1: Quick actions — "Explique este conceito" | Design | Pending |
| ESTD-37 | P1: Quick actions — "Ajude no projeto" | Design | Pending |
| ESTD-38 | P1: Quick actions — "Próximos passos" | Design | Pending |
| ESTD-39 | P1: Quick actions — ConceptCard button | Design | Pending |
| ESTD-40 | P1: Quick actions — hidden when no API key | Design | Pending |
| ESTD-41 | P1: API key — save valid key and enable chat | Design | Pending |
| ESTD-42 | P1: API key — reject invalid format | Design | Pending |
| ESTD-43 | P1: API key — disabled state message | Design | Pending |
| ESTD-44 | P1: API key — masked display | Design | Pending |
| ESTD-45 | P1: API key — never expose full key in UI | Design | Pending |
| ESTD-46 | P1: API key — close config screen on save | Design | Pending |
| ESTD-47 | P1: Persistence — restore all state fields (MMKV + SecureStore) | Design | Pending |
| ESTD-48 | P1: Persistence — chat NOT restored | Design | Pending |
| ESTD-49 | P1: Persistence — init default state when absent | Design | Pending |
| ESTD-50 | P1: Persistence — init default on parse error | Design | Pending |
| ESTD-51 | P1: Persistence — MMKV key + SecureStore key constants | Design | Pending |
| ESTD-52 | P1: Persistence — sync write via Zustand+MMKV adapter | Design | Pending |
| ESTD-53 | P2: Layout — bottom tab bar (Dashboard + Chat) | - | Pending |
| ESTD-54 | P2: Layout — tab navigation preserves screen state | - | Pending |
| ESTD-55 | P2: Layout — concept material as full-screen modal | - | Pending |
| ESTD-56 | P2: Layout — WCAG AA contrast | - | Pending |
| ESTD-57 | P2: Timeline — 14 slots with phase colors | - | Pending |
| ESTD-58 | P2: Timeline — current week highlight | - | Pending |
| ESTD-59 | P2: Timeline — completed phase low opacity | - | Pending |
| ESTD-60 | P2: Timeline — press tooltip (replaces hover, mobile) | - | Pending |

**ID format:** `ESTD-NN`

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 60 total, 0 mapped to tasks, 60 unmapped ⚠️

---

## Success Criteria

How we know the MVP is successful:

- [ ] User can open the app, see current week/phase/concept/project, and not need to open the study plan document
- [ ] User can click "AJUDA COM ESTE CONCEITO", send a message, and receive a response from Claude that references the specific concept being studied
- [ ] User can mark all concepts in Phase 0 as read, mark Project 1 as done, and verify Phase 1 starts correctly — all without page reload
- [ ] After a hard page reload, all progress (completed concepts, project steps, API key) is fully restored
- [ ] App loads in < 3 seconds and all UI interactions respond in < 100ms
- [ ] No unhandled JavaScript exceptions in the happy path flows (Flows 1–4 from the original spec)
