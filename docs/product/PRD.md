# isA IDE — Product Requirements Document

> Product-centric CDD+TDD Agentic Coding IDE
> Last updated: 2026-04-04

## Vision

A lightweight desktop IDE (~30MB idle) where product people, non-developer operators, and non-tester QA describe intent in natural language and watch contracts form, tests pass, code generate, and features ship — without writing code, configuring infra, or killing their machine.

## Architecture

- **Client**: Tauri 2.0 (Rust shell) + Vite + React 19 + Tailwind CSS 4
- **Backend**: isA_Vibe API (CDD+TDD orchestration) + isA_Orch (code intelligence)
- **Protocol**: REST + WebSocket to isA_Vibe on port 8240
- **Differentiator**: No LSP, no file watchers, no local AI — all compute server-side

## Core UX: Persona-Aware Workspace

Navigation is **persona-first**, not pipeline-first. Users choose their role (Product, Developer, Test, Ops) and see the same CDD+TDD data rendered in their language.

| Persona | Sections |
|---------|----------|
| **Product** | Stories, Contracts, Progress, Decisions |
| **Developer** | Architecture, Models, Code, Logic |
| Test (Phase 2) | Coverage, Scenarios, Results, Edge Cases |
| Ops (Phase 2) | Infrastructure, Deploy, Health, Config |

"Intent" is shared across all personas — everyone enters their goal the same way.

---

## Feature: UX Polish Pass — Breathing Room, Hierarchy, Readability

**Status**: Ready for dev
**Priority**: P1-High
**Epic**: #24
**Why**: Screenshot audit revealed flat surfaces, no breathing room, text running edge-to-edge, hero stats at body-text size, and monotonous card styling. The Ethereal Glass dark theme needs elevation and spacing to work.

### Requirements

- Global content max-width (max-w-4xl) on all persona panels
- Floating nav bar (mx-3 mt-2) detached from viewport edges
- Inspector width reduced to 240px default
- Section transitions with framer-motion fade+y
- PersonaPicker: larger icons (40px+), subtle ambient gradient, brighter active cards
- Intent: vertical centering, pill-shaped quick actions, smaller Go button
- PM Progress: text-4xl hero stats, progress visualization, wider gate timeline
- PM Stories: status-colored left borders, larger criteria icons
- PM Contracts: max-w-[65ch] on text, visual separators between rules
- Dev Architecture: collapsible sections or tabs for L3/L6
- Dev Logic: vertical test stacking in matrix, coverage stat at top

### Acceptance Criteria

- [ ] No text line exceeds 75ch on any panel
- [ ] Nav bar has visible margin from viewport edges
- [ ] Hero stats on PM Progress are text-3xl+ and visually dominant
- [ ] Story cards have colored left border by status (emerald/amber/red)
- [ ] Architecture panel has collapsible or tabbed L3/L6 sections
- [ ] Test pills in verification matrix display one-per-line
- [ ] Section transitions animate smoothly (fade + y offset)
- [ ] Inspector defaults to 240px width

### Stories

| Issue | Title | Priority |
|-------|-------|----------|
| #23 | Global layout — nav, spacing, inspector, transitions | P1 |
| #16 | PersonaPicker — depth, hierarchy, warmth | P1 |
| #17 | Intent page — breathing room, CTA sizing | P1 |
| #18 | PM Progress — hero stats, progress visualization | P1 |
| #19 | PM Stories — status differentiation, breathing room | P2 |
| #20 | PM Contracts — text width, visual separation | P2 |
| #21 | Dev Architecture — content chunking, navigation | P1 |
| #22 | Dev Logic — verification matrix readability | P2 |

---

## Feature: Demo Mode with Mock Orchestration

**Status**: Implemented (v0.1.0)
**Priority**: P1-High
**Why**: Enable UX iteration and stakeholder demos without requiring live isA_Vibe backend

### Requirements

- Mock orchestration provider that simulates the full CDD+TDD pipeline
- Realistic timing (delays between events to show progression)
- Sample CDD outputs: 6 layers with realistic domain/PRD/design/contract content
- Sample TDD outputs: 5-layer test results with mix of pass/fail/skip
- Toggle between demo mode and live mode via config or UI switch
- Demo mode activates automatically when Vibe API is unreachable

### User Stories

1. As a **product stakeholder**, I can see the full pipeline flow (Intent → CDD → TDD) with realistic data so I can evaluate the UX
2. As a **developer**, I can iterate on IDE components without running backend services
3. As a **demo presenter**, I can trigger a full pipeline run that completes in ~15 seconds with visual progression

### Acceptance Criteria

- [ ] Typing a prompt and clicking "Go" in demo mode streams mock events
- [ ] CDD stage populates all 6 layers with sample content
- [ ] TDD stage shows test pyramid with realistic pass/fail counts
- [ ] Events appear in trace stream with realistic timing
- [ ] Gates progress from locked → active → complete
- [ ] Demo mode indicator visible in StatusBar

### Out of Scope

- Real file content loading (Phase 2)
- Session persistence in demo mode

---

## Feature: UI Polish & Missing Pieces

**Status**: Implemented (v0.1.0)
**Priority**: P1-High
**Why**: Complete the IDE shell before wiring to real backend

### Requirements

- Session management UI: list previous sessions, resume, delete
- CDD layer content rendering: display markdown and Python contract previews
- Code stage placeholder: file change summary with diff indicators
- Keyboard shortcuts: Cmd+Enter (go), Cmd+1-5 (stage nav), Esc (cancel)
- Responsive layout: inspector panel toggle, mobile-aware sizing
- Dark theme refinements: consistent use of color tokens, focus states

### User Stories

1. As a **user**, I can resume a previous session from the Sessions panel
2. As a **user**, I can expand a CDD layer and see the rendered contract content
3. As a **user**, I can navigate between stages using keyboard shortcuts
4. As a **user**, I can toggle the inspector panel to maximize stage panel space

### Acceptance Criteria

- [ ] Session list shows previous sessions with prompt, project, phase, timestamp
- [ ] Clicking a session loads its SharedState and navigates to the active stage
- [ ] CDD layers render markdown content (L1-L3) and code blocks (L4-L6)
- [ ] Cmd+1 through Cmd+5 switch stages; Cmd+Enter triggers "Go"
- [ ] Inspector can be collapsed/expanded; state persists
- [ ] All interactive elements have visible focus states

### Out of Scope

- Monaco editor integration (separate feature)
- Multi-user collaboration

---

## Feature: Live Vibe API Integration

**Status**: Ready for design
**Priority**: P2-Medium
**Why**: Connect the IDE to real isA_Vibe orchestration for end-to-end pipeline execution

### Requirements

- WebSocket connection to isA_Vibe stream endpoint
- Real SharedState event parsing and state updates
- File content loading from Vibe API for CDD layer preview
- Session resume via Vibe session API
- Connection status indicator (connected/disconnected/reconnecting)
- Error handling: timeout, disconnection, malformed events
- Human-in-the-loop: pause pipeline at gate transitions, approve/reject

### User Stories

1. As a **product person**, I type "Build a notification service" and watch real CDD contracts appear
2. As a **user**, I can see connection status and reconnect if disconnected
3. As a **user**, I can approve CDD contracts before TDD starts (HIL gate)
4. As a **user**, I can resume an interrupted session where it left off

### Acceptance Criteria

- [ ] WebSocket connects to Vibe API and receives real orchestration events
- [ ] SharedState updates correctly from live team_delegated/team_complete events
- [ ] CDD layers load real file content when expanded
- [ ] Connection indicator shows status in StatusBar
- [ ] HIL gate shows approval dialog between CDD and TDD phases
- [ ] Session resume loads prior state from Vibe session API

### Out of Scope

- isA_Orch code intelligence integration (separate feature)
- Deploy/Ship stage (requires Ops team integration)

---

## Roadmap

| Phase | Features | Status |
|-------|----------|--------|
| **Phase 1A** | Scaffold, Demo Mode, UI Shell, Persona System | Done |
| **Phase 1B** (current) | UX Polish — breathing room, hierarchy, readability (#24) | In Progress |
| **Phase 2** | Live Vibe API, Test + Ops personas, Monaco editor | Planned |
| **Phase 3** | Orch integration, Offline mode, Collaboration | Planned |
