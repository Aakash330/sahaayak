# SAHAAYAK — AI Daily Life Companion
## Complete Project Context & Continuation Guide

> **Purpose of this document:** Give this file to any AI assistant (AI Studio, Claude, ChatGPT, Cursor, etc.) and it will have full context to understand what Sahaayak is, what has been built, what architecture decisions were made, what security rules to follow, and what remains to be implemented.

---

## 1. WHAT IS SAHAAYAK?

Sahaayak is a **GenAI-powered web companion for senior citizens**. Most digital tools are built for tech-savvy users. Seniors feel overwhelmed by complex messages, bills, notifications, and scam attempts. Sahaayak helps them through a simple flow:

**NOTICE → UNDERSTAND → PLAN → DO**

It is **NOT a chatbot**. The main experience is a proactive "My Day" dashboard that tells the senior what needs attention and helps them complete tasks step by step.

### Design Principles
```
"Don't overwhelm. Don't assume. Don't rush."
```

---

## 2. TECH STACK

| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| TypeScript (strict) | Type safety |
| Vite 8 | Build tool + dev server |
| Tailwind CSS 4 | Styling |
| @google/genai | Gemini AI SDK |
| lucide-react | Icons |
| Web Speech API | Read Aloud / TTS |
| localStorage | Persist user preferences (text size) |
| Vitest + React Testing Library | Testing |

### Dependencies Already Installed (package.json)
```
@google/genai, @tailwindcss/vite, @vitejs/plugin-react, dotenv, express,
lucide-react, motion, react, react-dom, vite
```

### Dev Dependencies Needed BUT NOT YET INSTALLED
```
vitest, @testing-library/react, @testing-library/dom, @testing-library/jest-dom, jsdom, @testing-library/user-event
```

> **IMPORTANT:** The `npm install` for test dependencies failed/timed out repeatedly. Before running tests, you MUST run:
> ```bash
> npm install --no-audit --no-fund -D vitest @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom @testing-library/user-event
> ```

---

## 3. COMPLETE FILE TREE (current state)

```
/
├── .env.example                        # Environment variable template
├── .gitignore
├── index.html                          # Vite entry HTML
├── metadata.json                       # AI Studio metadata
├── package.json                        # Dependencies & scripts
├── tsconfig.json                       # TypeScript config (includes vitest/globals)
├── vite.config.ts                      # Vite + Vitest config
├── public/
│   └── assets/aistudio/.gitignore
│
└── src/
    ├── main.tsx                         # React entry point
    ├── App.tsx                          # Root app with basic navigation
    ├── index.css                        # Tailwind + text-size modes + reduced-motion
    │
    ├── accessibility/
    │   ├── index.tsx                    # VisuallyHidden, LiveAnnouncer components
    │   └── TextSizeContext.tsx          # Normal/Large/Extra-Large text size (persisted)
    │
    ├── components/ui/
    │   ├── index.ts                    # Barrel export
    │   ├── Button.tsx                  # Primary/Secondary/Back/Danger, 48px targets
    │   ├── Card.tsx                    # Spacious container
    │   ├── ConfirmationState.tsx       # Success state with continue action
    │   ├── EmptyState.tsx              # No-data state
    │   ├── ErrorState.tsx              # Error display with retry
    │   ├── Layout.tsx                  # AppShell, Header (w/ text-size toggle), PageContainer
    │   ├── LoadingState.tsx            # Loading spinner with aria-live
    │   ├── Modal.tsx                   # Native <dialog> modal
    │   ├── ProgressIndicator.tsx       # Step X of Y progress bar
    │   └── StatusBadge.tsx             # success/warning/info/neutral badges
    │
    ├── features/
    │   ├── dashboard/
    │   │   ├── Dashboard.tsx           # ✅ DONE — "My Day" proactive briefing
    │   │   └── mockData.ts            # ✅ DONE — 3 example DailyItems
    │   │
    │   ├── understand/
    │   │   └── UnderstandFeature.tsx   # ✅ DONE — Simplify messages/bills/emails
    │   │
    │   ├── safety/                     # ❌ NOT YET IMPLEMENTED
    │   ├── guided-task/                # ❌ NOT YET IMPLEMENTED
    │   └── voice/                      # ❌ NOT YET IMPLEMENTED (hook exists)
    │
    ├── hooks/
    │   ├── index.ts                    # useAsync hook
    │   └── useReadAloud.ts            # ✅ DONE — Web Speech API TTS hook
    │
    ├── models/
    │   └── index.ts                    # DailyItem, Priority, Status, Task, DailyBriefing
    │
    ├── services/gemini/
    │   ├── index.ts                    # Barrel export
    │   ├── client.ts                   # ✅ DONE — callGemini(), AiError, timeout, validation
    │   ├── dailyBriefing.ts           # ✅ DONE — generateDailyBriefing() + validator
    │   └── understand.ts             # ✅ DONE — explainMessage() + validator
    │
    ├── test/
    │   ├── setup.ts                    # jest-dom import
    │   ├── App.test.tsx               # Basic render test (needs update — old testid)
    │   ├── components/
    │   │   ├── Button.test.tsx         # Touch target, disabled, loading tests
    │   │   └── Layout.test.tsx         # Text-size cycling tests
    │   ├── features/
    │   │   ├── dashboard.test.tsx      # Dashboard rendering tests
    │   │   └── understandFeature.test.tsx  # Understand UI tests
    │   └── services/
    │       ├── gemini.test.ts          # Client tests (timeout, malformed, empty, etc.)
    │       ├── dailyBriefing.test.ts   # Validator tests (hallucination rejection)
    │       └── understand.test.ts      # Validator tests (defaults, invalid arrays)
    │
    └── utils/
        └── index.ts                    # formatDate utility
```

---

## 4. ARCHITECTURE PATTERN

```
User Input
   ↓
React Component (UI only — no API logic)
   ↓
Service Layer (src/services/gemini/)
   ↓
callGemini() → Gemini API
   ↓
JSON.parse()
   ↓
Schema Validator (typed, defensive defaults)
   ↓
Typed Result → Component renders plain text
```

**Key Rule:** React components NEVER call Gemini directly. They call service functions which return typed data.

---

## 5. WHAT HAS BEEN BUILT (✅ DONE)

### 5a. Design System (src/components/ui/)
- AppShell with Header + skip-to-content link
- Text size toggle (Normal / Large / Extra Large) persisted in localStorage
- Reduced-motion CSS support
- Button (primary/secondary/back/danger) — all ≥48×48px
- Card, StatusBadge, ProgressIndicator
- LoadingState, ErrorState, EmptyState, ConfirmationState — all with aria-live
- Modal using native `<dialog>`

### 5b. Feature: My Day Dashboard
- Proactive greeting: "Good morning, Ravi. I've prepared your day."
- Shows max 3 DailyItems with: title, category badge, "Why it matters", "Suggested action"
- 3 action buttons per item: Explain this, Help me do this, Remind me later
- Uses mock data so it always works without Gemini
- Gemini briefing service exists but Dashboard currently uses mock data directly

### 5c. Feature: Understand
- Large textarea input (max 2000 chars)
- Calls `explainMessage()` → Gemini → structured JSON
- Displays: "What this means", "Important Details", "What you need to do", "Watch out for"
- Read Aloud button (Web Speech API)
- Copy text button
- "Help me do this" button (placeholder — not wired yet)

### 5d. Centralized Gemini Service
- `callGemini<T>()` — generic typed caller with timeout (15s), input validation (5000 char limit)
- `AiError` class with types: network, timeout, validation, parsing, empty
- Prompt injection protection via system instruction directives
- `responseMimeType: 'application/json'` enforced
- `validateBriefingResult()` — rejects hallucinated items by matching IDs to originals
- `validateUnderstandResult()` — safe defaults for all fields

### 5e. Accessibility
- VisuallyHidden + LiveAnnouncer primitives
- TextSizeContext with localStorage persistence
- All buttons ≥48px, labeled, keyboard-navigable
- Semantic HTML (header, main, h1-h3, lists)
- Focus-within ring on cards
- No color-only indicators

### 5f. Tests (written but NOT runnable — see note about missing deps)
- Button: touch targets, disabled, loading, onClick
- Layout: text-size cycling
- Dashboard: greeting, max 3 items, titles, action buttons
- Understand UI: input state, API call, error handling, maxLength
- Gemini client: valid response, malformed JSON, empty, network failure, timeout, over-length input
- Daily briefing validator: hallucination rejection, invalid priority revert, missing fields
- Understand validator: defaults, invalid arrays, null input

---

## 6. WHAT IS LEFT TO BUILD (❌ REMAINING)

### 6a. Safety Feature (src/features/safety/)
**Purpose:** Scan suspicious messages for scam/fraud indicators.

Needed:
- `SafetyFeature.tsx` — UI for pasting a suspicious message
- Gemini service: `checkSafety()` in `src/services/gemini/safety.ts`
- Structured response: `{ riskLevel, warningFlags[], explanation, safeActions[], neverDo[] }`
- Validator that never claims 100% certainty
- Tests

### 6b. Guided Task / "Do It With Me" (src/features/guided-task/)
**Purpose:** Break any task into simple sequential steps. Show 1-2 steps at a time.

Needed:
- `GuidedTask.tsx` — step-by-step wizard UI
- Uses ProgressIndicator component (already built)
- Gemini service: `breakIntoSteps()` in `src/services/gemini/guidedTask.ts`
- Structured response: `{ steps: [{ stepNumber, instruction, tip? }] }`
- User moves forward at own pace (Next Step / Previous Step buttons)
- ConfirmationState at end (already built)
- Tests

### 6c. Voice Feature (src/features/voice/)
**Purpose:** Dedicated Read Aloud interface.

Needed:
- `VoiceFeature.tsx` — centralized TTS controls
- Uses `useReadAloud` hook (already built)
- Speed/volume controls if time permits
- Always provide text alternative — never force voice interaction
- Tests

### 6d. Wire Dashboard Buttons
Currently the "Explain this", "Help me do this", and "Remind me later" buttons on Dashboard items are not connected. They need to:
- "Explain this" → Navigate to Understand feature with the item's content pre-filled
- "Help me do this" → Navigate to Guided Task feature
- "Remind me later" → Save a reminder in localStorage

### 6e. Navigation
Currently using simple `useState` switching between views. Needs:
- Add Safety and Guided Task views to navigation
- Consider bottom tab bar for senior-friendly mobile navigation
- Keep it simple — no complex routing library needed for MVP

### 6f. Install Test Dependencies & Run Tests
```bash
npm install --no-audit --no-fund -D vitest @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom @testing-library/user-event
npm test
```
Fix any test failures. The `App.test.tsx` file references `data-testid="app-container"` which no longer exists in App.tsx — it needs updating or removing.

### 6g. Optional Enhancements (if time permits)
- Gemini-powered daily briefing (service exists, just needs to be called instead of mock data)
- Dark mode / high contrast mode toggle
- Onboarding flow for first-time users
- Reminder system using localStorage + notifications

---

## 7. SECURITY RULES (MUST FOLLOW)

1. **Never hardcode API keys** — use `import.meta.env.VITE_GEMINI_API_KEY`
2. **Never use `dangerouslySetInnerHTML`** — render AI output as plain text only
3. **Never execute AI-generated JavaScript**
4. **Never trust AI output** — always validate with typed schema validators
5. **Never request** OTP, PIN, CVV, password, banking credentials, or full card numbers
6. **Treat all user input as untrusted** — limit length, sanitize
7. **Do not log** user messages or AI responses (PII protection)
8. **Prompt injection protection** — system instructions include security directives
9. **Gemini can never invent** dates, amounts, people, appointments, bills, deadlines
10. **Safely handle malformed JSON** — catch parse errors, return defaults
11. **Safely handle unexpected enums** — revert to safe default values
12. **Client-side API key is NOT production safe** — document clearly, design for backend proxy migration

---

## 8. ACCESSIBILITY RULES (MUST FOLLOW)

1. **Minimum 48×48px** interactive targets
2. **Large readable typography** — text-xl minimum for body, text-2xl+ for headings
3. **High contrast** — dark text on light backgrounds
4. **No color-only indicators** — always use icon + text
5. **Keyboard navigable** — visible focus rings
6. **Semantic HTML** — proper heading hierarchy (h1→h2→h3)
7. **aria-live="polite"** for dynamic AI results
8. **Labeled inputs** — `<label htmlFor>` on all form elements
9. **Never force voice interaction** — always provide text alternative
10. **Reduced-motion support** via `prefers-reduced-motion: reduce`
11. **Simple navigation** — minimal cognitive load

---

## 9. GEMINI API USAGE PATTERNS

### Environment Variable
```
VITE_GEMINI_API_KEY=your_key_here
```

### Calling Pattern
```typescript
import { callGemini } from './services/gemini/client';

const result = await callGemini<MyType>(
  userInput,            // The prompt (user's message)
  systemInstruction,    // What role Gemini plays + output schema
  myValidator           // (data: unknown) => MyType — validates & returns typed data
);
```

### Creating a New Gemini Feature
1. Create `src/services/gemini/myFeature.ts`
2. Define the response interface (e.g., `MyFeatureResult`)
3. Write a validator function that handles missing fields, bad enums, etc.
4. Write an async function that calls `callGemini()` with system prompt + validator
5. Export from `src/services/gemini/index.ts`
6. Call the service function from your React component — never call `callGemini` directly from UI

---

## 10. HOW TO RUN

```bash
# Install dependencies (if fresh clone)
npm install

# Install test deps (REQUIRED — not yet installed)
npm install --no-audit --no-fund -D vitest @testing-library/react @testing-library/dom @testing-library/jest-dom jsdom @testing-library/user-event

# Set API key
cp .env.example .env
# Edit .env and set VITE_GEMINI_API_KEY

# Dev server
npm run dev

# Run tests
npm test

# Build
npm run build
```

---

## 11. KNOWN ISSUES

| Issue | Details |
|---|---|
| Test deps missing | `vitest`, `@testing-library/*`, `jsdom` are NOT in package.json yet |
| App.test.tsx stale | References `data-testid="app-container"` which no longer exists |
| Dashboard buttons not wired | "Explain this", "Help me do this", "Remind me later" are visual-only |
| No routing | Using `useState` view switching — works for MVP but limited |
| Mock data only | Dashboard never calls Gemini; uses hardcoded mock items |
| tsconfig not strict | `"strict": true` is not set in tsconfig.json |

---

## 12. EVALUATION CRITERIA (HACKATHON)

The project is evaluated on:

1. **Code Quality** — TypeScript strict, small components, single responsibility, no duplication
2. **Security** — All rules in Section 7 above
3. **Efficiency** — No unnecessary API calls, loading states, caching
4. **Testing** — Validation, error states, accessibility, security rendering
5. **Accessibility** — Everything in Section 8 above

---

*Last updated: 2026-09-19. Generated from actual project source code.*
