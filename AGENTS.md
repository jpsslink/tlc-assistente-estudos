# AGENTS.md

## Project Overview

Mobile app (iOS + Android) that acts as a personal AI study assistant for a structured 14-week AI learning plan. The app tracks the user's current phase, concept, and project; surfaces curriculum content inline; and connects to the Anthropic API for context-aware chat with Claude acting as a tutor.

Single user, no backend, no authentication. All state lives on-device.

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React Native + Expo SDK 52 (managed workflow) |
| Language | TypeScript (strict mode) |
| Styling | NativeWind v4 (Tailwind CSS for React Native) |
| State management | Zustand with MMKV persist adapter |
| Progress storage | `react-native-mmkv`, key `"ia-assistente-estudos-state-v1"` |
| API key storage | `expo-secure-store`, key `"anthropic-api-key"` |
| Markdown rendering | `react-native-markdown-display` |
| Navigation | Expo Router, tab-based (two tabs: Dashboard and Chat) |
| Build | EAS Build (Expo Application Services) |
| AI | Anthropic Messages API, direct `fetch` from the app (no backend proxy) |
| Default model | `claude-sonnet-5-5` |

## File Structure

```
app/
  (tabs)/
    index.tsx        # Dashboard tab
    chat.tsx         # Chat tab
  _layout.tsx
components/
  Dashboard/         # PhaseHeader, ProgressBar, ConceptCard, ProjectCard, Timeline
  Chat/              # ChatPanel, MessageList, MessageBubble, QuickActions, ChatInput
  shared/            # ApiKeyConfig, ChecklistItem
hooks/
  useStudyState.ts   # Zustand store — all progression logic and MMKV persistence
  useClaudeChat.ts   # Anthropic API streaming, message history
data/
  curriculum.ts      # Static curriculum data — all phases, concepts, projects
utils/
  storage.ts         # MMKV and SecureStore wrappers
  claudeApi.ts       # fetch wrapper for Anthropic Messages API
  systemPrompt.ts    # Builds contextualized system prompt from current study state
types/
  index.ts           # All TypeScript interfaces
```

## Architecture Rules

- **`curriculum.ts` is the single source of truth** for all study content. Adding a concept or project requires only editing this file — no component changes needed.
- **`useStudyState`** owns all progression logic (`markConceptRead`, `markProjectDone`, `updateChecklist`). Components call its actions; they never mutate state directly.
- **`useClaudeChat`** handles only API communication. It does not read or modify study progress.
- **Chat history is ephemeral** — never persisted to storage. Only the last 20 messages are sent to the Anthropic API per request.
- The system prompt sent to Claude always includes: current week, phase name and objective, full concept content, and current project steps and readiness criteria.

## Design System

For all UI decisions — colors, typography, spacing, border radius, components, and do/don'ts — read `DESIGN.md` before writing any UI code.

## NativeWind Constraints

- CSS Grid classes (`grid`, `grid-cols-*`) do not work in React Native. Use Flexbox (`flex`, `flex-row`, `flex-1`, `w-2/5`) for all layout.
- There is no `hover:` in React Native. Use `pressed:` states or `Pressable` `onPress`/`onLongPress` handlers instead.
- There is no `dangerouslySetInnerHTML` — this is React Native, not web. Use `react-native-markdown-display` for all Markdown rendering. No DOMPurify needed.

## Security Rules

- **API key must be stored in `expo-secure-store`**, not MMKV. SecureStore uses iOS Keychain and Android Keystore. MMKV is not encrypted by default.
- The API key is transmitted only in the `x-api-key` header of HTTPS requests to `api.anthropic.com`. Never log it, never include it in error messages, never expose it in any state object that could be serialized.
- Display only the last 4 characters of the key in the UI, masked (e.g., `••••abcd`). Never render the full key.
- No `.env` file — the API key is user-supplied at runtime through the in-app settings screen.

## Development Commands

Before running any command, ensure the Expo project is initialized. Once initialized:

```bash
npx expo start          # Start dev server (Metro bundler)
npx expo start --ios    # Open in iOS Simulator
npx expo start --android # Open in Android emulator
npx expo run:ios        # Native build for iOS
npx expo run:android    # Native build for Android
eas build --platform all # Production build via EAS
```

No custom `npm run` scripts exist beyond what Expo scaffolds. Check `package.json` for the current list.

## Commit Convention

One atomic commit per task. Mark the task complete in `.specs/features/assistente-estudos-mvp/tasks.md` before committing, and include that file update in the same commit. Tests must pass before a task is considered done.
