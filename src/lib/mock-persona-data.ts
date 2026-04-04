import type {
  BusinessRule,
  UserStory,
  DataModel,
  DomainEvent,
  ArchDecision,
  RuleTestMapping,
} from "./types";

// ─── Business Rules (extracted from L5 Logic Contract) ──────────

export const MOCK_BUSINESS_RULES: BusinessRule[] = [
  {
    id: "BR-001",
    title: "Retry Policy",
    description:
      "Failed notification deliveries are retried up to 3 times using exponential backoff (1s, 4s, 16s). After all retries exhaust, the notification is marked as permanently failed.",
    status: "verified",
  },
  {
    id: "BR-002",
    title: "Channel Fallback",
    description:
      "When the primary delivery channel exhausts all retries, the system automatically attempts delivery through the recipient's configured fallback channel before marking as failed.",
    status: "verified",
  },
  {
    id: "BR-003",
    title: "Rate Limiting",
    description:
      "Each recipient receives a maximum of 100 notifications per minute. Notifications exceeding this limit are queued and delivered in the next available window.",
    status: "pending",
  },
  {
    id: "BR-004",
    title: "Template Validation",
    description:
      "All template variables referenced in the template must be present in the notification's variables dictionary. Missing variables cause the notification to be rejected at submission time, not at delivery.",
    status: "verified",
  },
  {
    id: "BR-005",
    title: "Quiet Hours",
    description:
      "Non-critical notifications are deferred during the recipient's configured quiet hours (default: 10pm-8am local time). Critical notifications bypass quiet hours.",
    status: "pending",
  },
];

// ─── User Stories (extracted from L2 PRD) ────────────────────────

export const MOCK_USER_STORIES: UserStory[] = [
  {
    id: "US-1",
    as: "a platform service",
    want: "to send notifications through multiple channels",
    soThat: "users receive alerts via their preferred communication method",
    criteria: [
      { text: "Supports email, Slack, and SMS channels", status: "pass" },
      { text: "Channel selection is per-notification", status: "pass" },
      { text: "Delivery confirmation returned for each channel", status: "pass" },
    ],
  },
  {
    id: "US-2",
    as: "an operations engineer",
    want: "failed notifications to automatically retry",
    soThat: "transient delivery failures don't require manual intervention",
    criteria: [
      { text: "Retries up to 3 times with backoff", status: "pass" },
      { text: "Falls back to alternate channel on exhaustion", status: "pass" },
      { text: "Permanent failures are logged with reason", status: "fail" },
    ],
  },
  {
    id: "US-3",
    as: "a product manager",
    want: "to define notification templates with variables",
    soThat: "messages are consistent and customizable without code changes",
    criteria: [
      { text: "Templates support variable interpolation", status: "pass" },
      { text: "Missing variables rejected at submission", status: "pass" },
      { text: "Template preview available before sending", status: "pending" },
    ],
  },
  {
    id: "US-4",
    as: "a recipient",
    want: "to not receive notifications during my quiet hours",
    soThat: "I'm not disturbed outside my preferred contact window",
    criteria: [
      { text: "Quiet hours configurable per recipient", status: "pending" },
      { text: "Critical notifications bypass quiet hours", status: "pending" },
      { text: "Deferred notifications sent at next available window", status: "pending" },
    ],
  },
];

// ─── Data Models (extracted from L1 Domain + L4 Data Contract) ───

export const MOCK_DATA_MODELS: DataModel[] = [
  {
    name: "Notification",
    fields: [
      { name: "notification_id", type: "str (UUID)", description: "Unique identifier" },
      { name: "recipient_id", type: "str", description: "Target user ID" },
      { name: "channel", type: "email | slack | sms", description: "Delivery channel" },
      { name: "template_id", type: "str", description: "Message template reference" },
      { name: "variables", type: "dict[str, str]", description: "Template variable values" },
      { name: "status", type: "queued | sending | sent | failed", description: "Current delivery state" },
      { name: "created_at", type: "datetime", description: "Submission timestamp" },
      { name: "delivered_at", type: "datetime | null", description: "Successful delivery timestamp" },
    ],
  },
  {
    name: "DeliveryAttempt",
    fields: [
      { name: "attempt_id", type: "str (UUID)", description: "Unique attempt identifier" },
      { name: "notification_id", type: "str (FK)", description: "Parent notification" },
      { name: "attempt_number", type: "int", description: "Retry count (1-based)" },
      { name: "channel", type: "email | slack | sms", description: "Channel used for this attempt" },
      { name: "status", type: "success | failed | timeout", description: "Attempt outcome" },
      { name: "error_message", type: "str | null", description: "Failure reason if applicable" },
      { name: "attempted_at", type: "datetime", description: "When this attempt was made" },
    ],
  },
];

// ─── Domain Events ───────────────────────────────────────────────

export const MOCK_DOMAIN_EVENTS: DomainEvent[] = [
  { name: "NotificationRequested", description: "A new notification has been submitted for delivery" },
  { name: "NotificationQueued", description: "Notification accepted and placed in delivery queue" },
  { name: "DeliveryAttempted", description: "A delivery attempt was made on a specific channel" },
  { name: "NotificationDelivered", description: "Notification successfully delivered to recipient" },
  { name: "DeliveryFailed", description: "A delivery attempt failed, may trigger retry" },
  { name: "AllRetriesExhausted", description: "All retry attempts failed, triggering fallback or permanent failure" },
  { name: "NotificationDeferred", description: "Notification held for quiet hours, will retry later" },
];

// ─── Architecture Decisions (extracted from L3 Design) ───────────

export const MOCK_ARCH_DECISIONS: ArchDecision[] = [
  {
    title: "Event-Driven Architecture",
    description: "Notifications flow through an event bus (NATS) rather than direct service calls.",
    rationale: "Decouples sender from delivery, enables retry/fallback without blocking the caller, supports multiple consumers for analytics and logging.",
  },
  {
    title: "Transactional Outbox Pattern",
    description: "Notifications are written to an outbox table in the same transaction as the business event, then relayed to the message bus.",
    rationale: "Guarantees at-least-once delivery even if the message bus is temporarily unavailable. Prevents lost notifications during infrastructure issues.",
  },
  {
    title: "Per-Channel Delivery Workers",
    description: "Each channel (email, Slack, SMS) has its own worker pool consuming from channel-specific queues.",
    rationale: "Isolates channel failures — a Slack API outage doesn't block email delivery. Allows independent scaling based on channel volume.",
  },
  {
    title: "Idempotent Delivery",
    description: "Each delivery attempt carries a unique idempotency key to prevent duplicate sends.",
    rationale: "Retry logic and at-least-once semantics can cause duplicate processing. Idempotency keys ensure recipients never receive the same notification twice.",
  },
];

// ─── Rule-to-Test Mappings ───────────────────────────────────────

export const MOCK_RULE_TEST_MAPPINGS: RuleTestMapping[] = [
  {
    ruleId: "BR-001",
    ruleName: "Retry Policy",
    tests: [
      { name: "test_retry_on_transient_failure", layer: "unit", status: "pass" },
      { name: "test_exponential_backoff_timing", layer: "unit", status: "pass" },
      { name: "test_max_retries_exhausted", layer: "component", status: "pass" },
      { name: "test_retry_with_real_queue", layer: "integration", status: "pass" },
    ],
  },
  {
    ruleId: "BR-002",
    ruleName: "Channel Fallback",
    tests: [
      { name: "test_fallback_channel_selection", layer: "unit", status: "pass" },
      { name: "test_fallback_after_primary_exhaustion", layer: "component", status: "pass" },
      { name: "test_no_fallback_when_none_configured", layer: "unit", status: "fail" },
    ],
  },
  {
    ruleId: "BR-003",
    ruleName: "Rate Limiting",
    tests: [
      { name: "test_rate_limit_enforcement", layer: "unit", status: "pass" },
      { name: "test_queuing_on_limit_exceeded", layer: "component", status: "skip" },
    ],
  },
  {
    ruleId: "BR-004",
    ruleName: "Template Validation",
    tests: [
      { name: "test_missing_variable_rejected", layer: "unit", status: "pass" },
      { name: "test_extra_variables_ignored", layer: "unit", status: "pass" },
      { name: "test_empty_template_rejected", layer: "unit", status: "pass" },
      { name: "test_validation_via_api", layer: "api", status: "pass" },
    ],
  },
  {
    ruleId: "BR-005",
    ruleName: "Quiet Hours",
    tests: [],
  },
];
