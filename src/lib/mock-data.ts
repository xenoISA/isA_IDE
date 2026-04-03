import type {
  OrchestrationEvent,
  CDDOutputs,
  TDDOutputs,
  CDDLayer,
} from "./types";

// ─── Mock CDD Content (Notification Service) ───────────────────

export const MOCK_CDD_CONTENT: Record<CDDLayer, string> = {
  domain: `# L1 Domain Model — Notification Service

## Bounded Context
The Notification Service owns the lifecycle of all outbound notifications,
from request through delivery confirmation or failure escalation.

## Core Entities

### Notification
The root aggregate. Represents a single outbound message.
- \`notification_id\` (UUID) — unique identifier
- \`recipient_id\` (str) — target user
- \`channel\` (enum: email | slack | sms) — delivery channel
- \`template_id\` (str) — message template reference
- \`variables\` (dict) — template interpolation context
- \`status\` (enum: queued | sending | sent | failed | retrying)
- \`created_at\`, \`updated_at\` (datetime)

### Channel
Value object describing a delivery mechanism.
- \`type\` — email, slack, sms
- \`provider\` — sendgrid, slack-webhook, twilio
- \`rate_limit\` — max messages per minute

### Recipient
Value object referencing the target user.
- \`recipient_id\` — external user ID
- \`preferences\` — preferred channels, quiet hours

### DeliveryStatus
Value object tracking a single delivery attempt.
- \`attempt_number\` (int)
- \`status\` (enum: pending | success | failure)
- \`provider_response\` (str | null)
- \`attempted_at\` (datetime)

## Ubiquitous Language
| Term | Definition |
|------|-----------|
| Notification | A message dispatched to a recipient through a channel |
| Channel | A delivery mechanism (email, Slack, SMS) |
| Delivery Attempt | A single try to send a notification via a provider |
| Fallback | Automatic switch to an alternative channel on failure |
| Quiet Hours | Time window during which non-critical notifications are deferred |
| Template | A parameterized message body with variable interpolation |

## Domain Events
- **NotificationRequested** — A new notification has been submitted
- **NotificationQueued** — Notification accepted and placed in the outbox
- **DeliveryAttempted** — A send attempt was made to the provider
- **NotificationDelivered** — Provider confirmed successful delivery
- **DeliveryFailed** — Provider reported a failure; may trigger retry
- **FallbackTriggered** — Primary channel failed; switching to fallback
- **NotificationExpired** — Max retries exhausted; notification marked terminal
`,

  prd: `# L2 Product Requirements — Notification Service

## Overview
A centralized notification service that delivers messages across multiple
channels with retry logic, template rendering, and rate limiting.

## Features

### F1: Multi-Channel Delivery
Send notifications via email (SendGrid), Slack (webhook), and SMS (Twilio)
through a unified API. Channel selection is explicit per request, with
fallback configuration at the recipient level.

### F2: Retry Logic with Exponential Backoff
Failed deliveries are retried up to 3 times with exponential backoff
(1s, 4s, 16s). After exhausting retries on the primary channel, the
system falls back to the recipient's secondary channel if configured.

### F3: Template Engine
Notifications reference a template ID. The engine resolves the template,
interpolates variables, and validates required fields before dispatch.
Templates support Markdown for email and plain text for SMS/Slack.

### F4: Rate Limiting
Per-recipient rate limiting of 100 notifications per minute prevents
abuse and protects downstream providers. Excess notifications are
queued with a backpressure signal to callers.

### F5: Delivery Tracking Dashboard
Real-time visibility into notification status, delivery rates, and
failure patterns. Exposes metrics for Grafana integration.

## User Stories

- **US-1**: As a platform service, I can send a notification by POSTing to
  \`/api/v1/notifications\` with recipient, channel, template, and variables.
- **US-2**: As an ops engineer, I can view delivery success rates per channel
  in the monitoring dashboard.
- **US-3**: As a platform service, I receive a webhook callback when delivery
  status changes (sent, failed, expired).
- **US-4**: As a recipient, my quiet hours are respected and non-critical
  notifications are deferred.

## API Specification

### POST /api/v1/notifications
\`\`\`json
{
  "recipient_id": "usr_abc123",
  "channel": "email",
  "template_id": "welcome_v2",
  "variables": { "name": "Alice", "org": "Acme" },
  "priority": "normal"
}
\`\`\`
Response: \`201 Created\`
\`\`\`json
{
  "notification_id": "ntf_xyz789",
  "status": "queued"
}
\`\`\`

### GET /api/v1/notifications/{id}
Returns full notification status with delivery attempt history.

### GET /api/v1/notifications?recipient_id=usr_abc123&status=failed
Filtered listing with pagination.
`,

  design: `# L3 Architecture Design — Notification Service

## Architecture Style
Event-driven microservice with transactional outbox pattern for
reliable message dispatch.

## Component Diagram
\`\`\`
[API Gateway] --> [Notification API]
                       |
                       v
              [Outbox Table (PG)]
                       |
                       v
              [Outbox Poller] --> [Channel Router]
                                      |
                          +-----------+-----------+
                          |           |           |
                       [Email]    [Slack]      [SMS]
                     (SendGrid)  (Webhook)   (Twilio)
                          |           |           |
                          v           v           v
                      [Delivery Callback Handler]
                                |
                                v
                       [Status Updater]
\`\`\`

## Outbox Pattern
Notifications are written to the \`outbox\` table in the same transaction
as the notification record. A background poller reads unpublished rows,
dispatches them to the event bus, and marks them as published. This
guarantees at-least-once delivery without distributed transactions.

## Database Schema

### notifications
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| recipient_id | VARCHAR(64) | Indexed |
| channel | VARCHAR(16) | email/slack/sms |
| template_id | VARCHAR(64) | FK to templates |
| variables | JSONB | Template context |
| status | VARCHAR(16) | queued/sending/sent/failed/retrying |
| priority | VARCHAR(16) | critical/normal/low |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### delivery_attempts
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK |
| notification_id | UUID | FK to notifications |
| attempt_number | INT | 1-indexed |
| channel | VARCHAR(16) | May differ from original (fallback) |
| status | VARCHAR(16) | pending/success/failure |
| provider_response | TEXT | Raw provider response |
| attempted_at | TIMESTAMPTZ | |
| duration_ms | INT | Round-trip time |

### outbox
| Column | Type | Notes |
|--------|------|-------|
| id | BIGSERIAL | PK |
| aggregate_type | VARCHAR(32) | "notification" |
| aggregate_id | UUID | notification.id |
| event_type | VARCHAR(64) | Domain event name |
| payload | JSONB | Serialized event |
| published | BOOLEAN | Default false |
| created_at | TIMESTAMPTZ | |

## Sequence: Happy Path
1. Client POSTs to \`/api/v1/notifications\`
2. API validates input, renders template, writes notification + outbox row in one TX
3. Outbox poller picks up event, publishes to event bus
4. Channel router selects provider, calls external API
5. Provider responds with success
6. Status updater marks notification as "sent", fires NotificationDelivered event
7. Webhook callback notifies the caller
`,

  data_contract: `# L4 Data Contract — Notification Service

\`\`\`python
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


# ─── Input Models ────────────────────────────────────────────────

class NotificationInput(BaseModel):
    """Request payload for creating a new notification."""
    recipient_id: str = Field(..., description="Target user ID")
    channel: Literal["email", "slack", "sms"] = Field(
        ..., description="Delivery channel"
    )
    template_id: str = Field(..., description="Message template ID")
    variables: dict[str, str] = Field(
        default_factory=dict,
        description="Template interpolation variables",
    )
    priority: Literal["critical", "normal", "low"] = Field(
        default="normal", description="Dispatch priority"
    )


class NotificationFilter(BaseModel):
    """Query parameters for listing notifications."""
    recipient_id: str | None = None
    status: Literal["queued", "sending", "sent", "failed", "retrying"] | None = None
    channel: Literal["email", "slack", "sms"] | None = None
    limit: int = Field(default=50, ge=1, le=200)
    offset: int = Field(default=0, ge=0)


# ─── Output Models ───────────────────────────────────────────────

class DeliveryAttemptOutput(BaseModel):
    """A single delivery attempt record."""
    attempt_number: int
    channel: Literal["email", "slack", "sms"]
    status: Literal["pending", "success", "failure"]
    provider_response: str | None = None
    attempted_at: datetime
    duration_ms: int


class NotificationOutput(BaseModel):
    """Response payload for a notification."""
    notification_id: str
    recipient_id: str
    channel: Literal["email", "slack", "sms"]
    template_id: str
    status: Literal["queued", "sending", "sent", "failed", "retrying"]
    priority: Literal["critical", "normal", "low"]
    delivered_at: datetime | None = None
    created_at: datetime
    updated_at: datetime
    delivery_attempts: list[DeliveryAttemptOutput] = Field(default_factory=list)


class NotificationCreated(BaseModel):
    """Acknowledgement returned after successful creation."""
    notification_id: str
    status: Literal["queued"] = "queued"


# ─── Event Payloads ─────────────────────────────────────────────

class NotificationRequestedEvent(BaseModel):
    notification_id: str
    recipient_id: str
    channel: Literal["email", "slack", "sms"]
    template_id: str
    priority: Literal["critical", "normal", "low"]
    requested_at: datetime


class DeliveryResultEvent(BaseModel):
    notification_id: str
    attempt_number: int
    channel: Literal["email", "slack", "sms"]
    success: bool
    provider_response: str | None = None
    attempted_at: datetime
\`\`\`
`,

  logic_contract: `# L5 Logic Contract — Notification Service

## Business Rules

### BR-001: Retry Policy
- Failed deliveries MUST be retried up to **3 times**
- Backoff schedule: attempt 1 at +1s, attempt 2 at +4s, attempt 3 at +16s
- After 3 failures on the primary channel, trigger fallback (BR-002)
- Critical-priority notifications retry immediately (no backoff)

### BR-002: Fallback Channel
- When primary channel exhausts retries, attempt delivery on the
  recipient's configured fallback channel
- Fallback order: email -> slack -> sms (configurable per recipient)
- Fallback resets the retry counter (3 new attempts on fallback channel)
- If no fallback is configured, mark notification as **failed** (terminal)

### BR-003: Rate Limiting
- Maximum **100 notifications per minute** per recipient
- Rate limit is enforced at the API gateway and the outbox poller
- Excess notifications return HTTP 429 with \`Retry-After\` header
- Critical-priority notifications bypass rate limiting

### BR-004: Template Validation
- All template variables referenced in the template body MUST be present
  in the \`variables\` dict
- Missing variables cause a **synchronous 422 error** (not queued)
- Templates are cached with a 5-minute TTL

### BR-005: Quiet Hours
- Non-critical notifications to recipients with quiet hours configured
  are deferred until the quiet window ends
- Critical-priority notifications ignore quiet hours
- Deferred notifications are re-queued with original timestamp preserved

## State Machine

\`\`\`
                  +--------+
                  | queued |
                  +---+----+
                      |
                      v
                  +---------+
             +--->| sending |
             |    +----+----+
             |         |
             |    +----+----+
             |    |         |
             v    v         v
        +---------+    +--------+
        | retrying|    |  sent  |  (terminal)
        +----+----+    +--------+
             |
             v
        +--------+
        | failed |  (terminal — retries + fallback exhausted)
        +--------+
\`\`\`

## Invariants
- A notification in "sent" status MUST have at least one successful delivery attempt
- A notification in "failed" status MUST have exactly (retries * channels_tried) failed attempts
- \`delivered_at\` is set if and only if status is "sent"
- Attempt numbers are strictly monotonically increasing per notification
`,

  system_contract: `# L6 System Contract — Notification Service

## Dependency Injection Container

\`\`\`python
# DI bindings (using dependency-injector or manual wiring)
container = {
    "notification_repo":    NotificationRepository,      # PostgreSQL
    "template_service":     TemplateService,              # Template cache + renderer
    "channel_router":       ChannelRouter,                # Selects provider by channel
    "email_provider":       SendGridProvider,             # implements ChannelProvider
    "slack_provider":       SlackWebhookProvider,         # implements ChannelProvider
    "sms_provider":         TwilioProvider,               # implements ChannelProvider
    "outbox_poller":        OutboxPoller,                 # Background task
    "rate_limiter":         SlidingWindowRateLimiter,     # Redis-backed
    "event_bus":            EventBus,                     # Internal pub/sub
    "delivery_tracker":     DeliveryTracker,              # Writes delivery_attempts
}
\`\`\`

## Event Bus Contract

| Event | Producer | Consumer(s) |
|-------|----------|-------------|
| NotificationRequested | NotificationAPI | OutboxPoller |
| DeliveryAttempted | ChannelRouter | DeliveryTracker, MetricsCollector |
| NotificationDelivered | DeliveryTracker | WebhookDispatcher, MetricsCollector |
| DeliveryFailed | ChannelRouter | RetryScheduler, DeliveryTracker |
| FallbackTriggered | RetryScheduler | ChannelRouter |
| NotificationExpired | RetryScheduler | WebhookDispatcher, AlertManager |

## Outbox Table Schema

Refer to L3 Design outbox table. The poller:
1. Queries \`SELECT * FROM outbox WHERE published = false ORDER BY created_at LIMIT 100\`
2. Publishes each event to the internal event bus
3. Marks rows as \`published = true\` in a batch update
4. Runs every 500ms via \`asyncio.create_task\`

## Health Check Endpoint

### GET /health
\`\`\`json
{
  "status": "healthy",
  "checks": {
    "database": "ok",
    "redis": "ok",
    "sendgrid": "ok",
    "slack_webhook": "ok",
    "twilio": "ok",
    "outbox_lag_seconds": 0.3
  },
  "version": "1.2.0"
}
\`\`\`
Returns 200 if all checks pass, 503 if any critical check fails.
Database and Redis are critical; provider checks are non-critical.

## Configuration (Environment Variables)
| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | required | PostgreSQL connection string |
| REDIS_URL | redis://localhost:6379 | Rate limiter backend |
| SENDGRID_API_KEY | required | Email provider |
| SLACK_WEBHOOK_URL | required | Slack provider |
| TWILIO_ACCOUNT_SID | required | SMS provider |
| TWILIO_AUTH_TOKEN | required | SMS provider |
| OUTBOX_POLL_INTERVAL_MS | 500 | Poller frequency |
| RATE_LIMIT_PER_MIN | 100 | Per-recipient rate cap |
| RETRY_MAX_ATTEMPTS | 3 | Max retries per channel |
`,
};

// ─── Mock CDD Outputs (file paths) ─────────────────────────────

export const MOCK_CDD_OUTPUTS: CDDOutputs = {
  research: null,
  domain: "docs/domain/notification_service.md",
  prd: "docs/prd/notification_service.md",
  design: "docs/design/notification_service.md",
  data_contract: "tests/contracts/notification_service/data_contract.py",
  logic_contract: "tests/contracts/notification_service/logic_contract.md",
  system_contract: "tests/contracts/notification_service/system_contract.md",
};

// ─── Mock TDD Outputs ───────────────────────────────────────────

export const MOCK_TDD_OUTPUTS: TDDOutputs = {
  test_results: {
    unit: { passed: 42, failed: 2, skipped: 3 },
    component: { passed: 25, failed: 1, skipped: 2 },
    integration: { passed: 15, failed: 0, skipped: 1 },
    api: { passed: 10, failed: 0, skipped: 0 },
    smoke: { passed: 5, failed: 0, skipped: 0 },
  },
  code_changes: [
    "src/services/notification_service.py",
    "src/models/notification.py",
    "src/models/delivery_attempt.py",
    "src/providers/sendgrid_provider.py",
    "src/providers/slack_provider.py",
    "src/providers/twilio_provider.py",
    "src/routes/notification_routes.py",
    "src/repositories/notification_repo.py",
    "src/services/template_service.py",
    "src/workers/outbox_poller.py",
  ],
  coverage: 78,
  all_passing: false,
};

// ─── Mock Event Sequence ────────────────────────────────────────

const SESSION_ID = "ses_ntf_20260403_001";

export const MOCK_EVENTS: OrchestrationEvent[] = [
  // 1. Orchestrator initializes
  {
    type: "orchestrator_init",
    session_id: SESSION_ID,
    message: "Orchestration session initialized for Notification Service",
  },

  // 2. Intent classification
  {
    type: "intent_classified",
    session_id: SESSION_ID,
    workflow: "full",
    message:
      'Intent classified: full CDD+TDD pipeline for "Build a notification service with multi-channel delivery, retry logic, and rate limiting"',
  },

  // 3. Shared state initialized
  {
    type: "shared_state_init",
    session_id: SESSION_ID,
    message: "Shared state created for notification_service",
    shared_state: {
      session_id: SESSION_ID,
      service_name: "notification_service",
      current_phase: "planning",
      current_team: null,
      cdd_outputs: {
        research: null,
        domain: null,
        prd: null,
        design: null,
        data_contract: null,
        logic_contract: null,
        system_contract: null,
      },
      tdd_outputs: {
        test_results: {
          unit: { passed: 0, failed: 0, skipped: 0 },
          component: { passed: 0, failed: 0, skipped: 0 },
          integration: { passed: 0, failed: 0, skipped: 0 },
          api: { passed: 0, failed: 0, skipped: 0 },
          smoke: { passed: 0, failed: 0, skipped: 0 },
        },
        code_changes: [],
        coverage: 0,
        all_passing: false,
      },
      ops_outputs: {
        local_dev_ready: false,
        docker_image: null,
        k8s_deployed: false,
        health_status: null,
        pr_url: null,
        ci_status: null,
      },
      gates: {
        cdd_complete: false,
        tests_pass: false,
        deploy_success: false,
      },
      handoff_notes: {},
      errors: [],
      history: [],
    },
  },

  // 4. Codebase context loaded
  {
    type: "codebase_context",
    session_id: SESSION_ID,
    message:
      "Codebase context loaded: Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, PostgreSQL 16, Redis 7",
  },

  // 5. Product team delegated
  {
    type: "team_delegated",
    session_id: SESSION_ID,
    team: "product_team",
    message:
      "Delegating to product_team: generate CDD layers L1-L6 for notification_service",
  },

  // 6. Phase detected: product
  {
    type: "phase_detected",
    session_id: SESSION_ID,
    message: "Phase transition: planning -> product",
  },

  // 7. Product team complete with CDD outputs
  {
    type: "team_complete",
    session_id: SESSION_ID,
    team: "product_team",
    gate: "cdd_complete",
    message:
      "Product team completed all 6 CDD layers. Domain model, PRD, architecture, data contracts, logic contracts, and system contracts generated.",
    outputs: MOCK_CDD_OUTPUTS,
  },

  // 8. Dev team delegated
  {
    type: "team_delegated",
    session_id: SESSION_ID,
    team: "dev_team",
    message:
      "Delegating to dev_team: implement notification_service with TDD pyramid (unit -> component -> integration -> API -> smoke)",
  },

  // 9. TDD preflight
  {
    type: "tdd_preflight",
    session_id: SESSION_ID,
    message:
      "TDD preflight: 6 contract files parsed, 47 test cases planned across 5 layers",
  },

  // 10. Phase detected: dev
  {
    type: "phase_detected",
    session_id: SESSION_ID,
    message: "Phase transition: product -> dev",
  },

  // 11. Dev team complete with TDD outputs
  {
    type: "team_complete",
    session_id: SESSION_ID,
    team: "dev_team",
    gate: "tests_pass",
    message:
      "Dev team completed TDD cycle. 97 tests total: 95 passed, 3 failed, 6 skipped. Coverage: 78%. 10 source files created/modified.",
    outputs: MOCK_TDD_OUTPUTS,
  },
];
