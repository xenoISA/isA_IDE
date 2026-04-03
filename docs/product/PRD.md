# isA IDE — Product Requirements Document

> Product-centric CDD+TDD Agentic Coding IDE
> Last updated: 2026-04-03

## Vision

A lightweight desktop IDE (~30MB idle) where product people, non-developer operators, and non-tester QA describe intent in natural language and watch contracts form, tests pass, code generate, and features ship — without writing code, configuring infra, or killing their machine.

## Architecture

- **Client**: Tauri 2.0 (Rust shell) + Vite + React 19 + Tailwind CSS 4
- **Backend**: isA_Vibe API (CDD+TDD orchestration) + isA_Orch (code intelligence)
- **Protocol**: REST + WebSocket to isA_Vibe on port 8240
- **Differentiator**: No LSP, no file watchers, no local AI — all compute server-side

## Core UX: Pipeline-First Navigation

Stages: **Intent → CDD → TDD → Code → Ship**

Each stage is a visual panel, not a file editor. The pipeline is the primary navigation.

---

## Feature: Demo Mode with Mock Orchestration

**Status**: Ready for dev
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

**Status**: Ready for dev
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

| Phase | Features | Priority |
|-------|----------|----------|
| **Phase 1** (current) | Scaffold ✓, Demo Mode, UI Polish | P1 |
| **Phase 2** | Live API, Code Stage (Monaco), Ship Stage | P1-P2 |
| **Phase 3** | Orch integration, Offline mode, Collaboration | P2-P3 |
