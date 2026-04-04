# isA IDE

Product-centric CDD+TDD Agentic Coding IDE. Same pipeline data, rendered for your role.

## Quick Start

```bash
# Prerequisites: Rust, Node.js 20+, pnpm
pnpm install
cargo tauri dev
```

The native desktop window opens at 1400x900. First launch shows the persona picker.

## How It Works

### 1. Pick Your Role

On first open, choose how you work:

- **Product** — see user stories, business rules, acceptance criteria, decisions
- **Developer** — see architecture, data models, code changes, logic verification

Test and Operations personas are coming soon.

Your choice is remembered. Switch anytime via the persona badge in the bottom status bar.

### 2. Describe Your Intent

Click **Intent** in the nav bar. Type what you want to build:

> Build a notification service that sends alerts via email and Slack when pipeline runs fail

Click **Go** (or Cmd+Enter). The agentic pipeline starts.

### 3. Watch the Pipeline

The IDE connects to the isA Vibe orchestration engine. Three agent teams work in sequence:

1. **Product Team** generates CDD contracts (6 layers: domain, PRD, design, data/logic/system contracts)
2. **Dev Team** runs TDD (5 layers: unit, component, integration, API, smoke tests)
3. **Ops Team** handles deployment

You see this through your persona lens — not raw files.

### 4. What Each Persona Sees

#### Product Persona

| Section | What's There |
|---------|-------------|
| **Stories** | User stories as "As a [role], I want [action], so that [benefit]" with acceptance criteria checklists. Each story shows Complete / Needs Work / In Progress. |
| **Contracts** | Business rules in plain English. "BR-001: Retry Policy — Failed deliveries are retried up to 3 times..." with Verified / Pending status. |
| **Progress** | Dashboard: "7 of 12 acceptance criteria passing", "3 of 5 rules verified", gate timeline showing CDD/TDD/Deploy status. |
| **Decisions** | Architecture decisions in business language: what was decided, and why. |

#### Developer Persona

| Section | What's There |
|---------|-------------|
| **Architecture** | Tabbed view of L3 System Design (component diagrams, DB schema, outbox pattern) and L6 System Contract (DI container, event bus, health endpoints). |
| **Models** | Data model tables (field, type, description) with a toggle to view raw Pydantic/Python contract code. |
| **Code** | Generated file list with coverage bar and pass/fail badge. |
| **Logic** | L5 Logic Contract (business rules, state machine) plus a Rule Verification Matrix mapping each rule to its tests with pass/fail status. |

### 5. Approve Gates

Between pipeline phases, an approval dialog appears:

- **"Approve Contracts?"** — after CDD completes, before TDD starts
- **"Tests Pass — Deploy?"** — after TDD completes

Click **Approve** to proceed, or **Reject** with feedback to send back to the team.

### 6. Inspector Panel

The right-side panel shows:

- **Trace** tab — live event stream from the orchestration engine
- **Gates** tab — pipeline gate status with handoff notes from each team

Toggle with Cmd+\. Collapse to save space.

## Demo Mode

By default the IDE runs in **Demo** mode — no backend needed. Clicking Go simulates a full pipeline run (~13 seconds) with realistic sample data for a Notification Service.

Switch to **Live** mode via the status bar toggle when the isA Vibe API is running on port 8240.

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd+Enter | Trigger "Go" from Intent |
| Cmd+1-5 | Switch between sections |
| Cmd+\ | Toggle Inspector panel |
| Esc | Stop running pipeline |

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Desktop shell | Tauri 2.0 (Rust) | ~30MB idle, native webview, no Chromium |
| Frontend | Vite + React 19 + Tailwind CSS 4 | Fast builds, component reuse |
| Animations | framer-motion | Spring physics, layout transitions |
| Typography | Geist Sans + Geist Mono | Clean, technical, not Inter |
| Backend | isA Vibe API (Python, port 8240) | CDD+TDD orchestration |
| Code index | isA Orch (Python) | Cross-project symbol resolution |

## Project Structure

```
src/
  App.tsx                          — root: persona state, section routing
  stages/
    IntentStage.tsx                — prompt input, quick actions, sessions
    pm/                            — Product persona panels
      PMStoriesPanel.tsx           — user stories + acceptance criteria
      PMContractsPanel.tsx         — business rules
      PMProgressPanel.tsx          — dashboard metrics
      PMDecisionsPanel.tsx         — architecture decisions
    dev/                           — Developer persona panels
      DevArchitecturePanel.tsx     — L3 design + L6 system contract (tabbed)
      DevModelsPanel.tsx           — data models + raw contract toggle
      DevCodePanel.tsx             — file changes + coverage
      DevLogicPanel.tsx            — logic contract + rule verification matrix
  components/
    persona/                       — PersonaPicker, PersonaNav, PersonaSwitcher
    layout/                        — Inspector, StatusBar
    trace/                         — TraceStream, GateProgress, TeamBadge
    ui/                            — GateApprovalDialog, MarkdownRenderer
    cdd/                           — LayerContent
    session/                       — SessionList, SessionCard
  hooks/
    usePersona.ts                  — persona selection (localStorage)
    useMockOrchestration.ts        — demo mode event streamer
    useOrchestration.ts            — live WebSocket to Vibe API
    useSession.ts                  — session persistence
    useKeyboardShortcuts.ts        — global keyboard bindings
    useFileContent.ts              — file content loading with cache
  lib/
    types.ts                       — all TypeScript types
    mock-data.ts                   — sample CDD/TDD content
    mock-persona-data.ts           — structured business rules, stories, models
    api.ts                         — HTTP/WebSocket client for Vibe API
    events.ts                      — event processing + persona section routing
    config.ts                      — service URLs, demo mode flag
src-tauri/
  src/main.rs                      — Tauri entry point
  src/lib.rs                       — IPC commands
  tauri.conf.json                  — window config, build settings
```

## Building for Production

```bash
cargo tauri build
```

Output: native .app bundle (macOS) or .exe (Windows) in `src-tauri/target/release/bundle/`.
