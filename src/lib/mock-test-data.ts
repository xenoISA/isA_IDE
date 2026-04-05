// ─── Test Persona Mock Data ──────────────────────────────────────

export interface GivenWhenThen {
  id: string;
  storyId: string;
  given: string;
  when: string;
  then: string;
  status: "pass" | "fail" | "pending";
  testFunction?: string;
}

export interface EdgeCase {
  id: string;
  ruleId: string;
  description: string;
  tested: boolean;
  testFunction?: string;
}

export interface RuleResult {
  ruleId: string;
  ruleName: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
}

export const MOCK_SCENARIOS: GivenWhenThen[] = [
  {
    id: "SC-001",
    storyId: "US-1",
    given: "a notification request with channel='email'",
    when: "the notification is submitted via POST /api/v1/notifications",
    then: "the notification is queued and a delivery attempt is made via SendGrid",
    status: "pass",
    testFunction: "test_email_delivery_e2e",
  },
  {
    id: "SC-002",
    storyId: "US-1",
    given: "a notification request with channel='slack'",
    when: "the notification is submitted",
    then: "the notification is delivered via Slack webhook",
    status: "pass",
    testFunction: "test_slack_delivery_e2e",
  },
  {
    id: "SC-003",
    storyId: "US-1",
    given: "a notification request with channel='sms'",
    when: "the notification is submitted",
    then: "the notification is delivered via Twilio SMS",
    status: "pass",
    testFunction: "test_sms_delivery_e2e",
  },
  {
    id: "SC-004",
    storyId: "US-2",
    given: "an email delivery that fails with a transient error",
    when: "the retry scheduler runs",
    then: "the delivery is retried with exponential backoff (1s, 4s, 16s)",
    status: "pass",
    testFunction: "test_retry_exponential_backoff",
  },
  {
    id: "SC-005",
    storyId: "US-2",
    given: "all 3 retry attempts on the primary channel have failed",
    when: "the fallback handler runs",
    then: "delivery is attempted on the recipient's fallback channel",
    status: "pass",
    testFunction: "test_fallback_channel_activation",
  },
  {
    id: "SC-006",
    storyId: "US-2",
    given: "all retries and fallback have failed",
    when: "the notification is finalized",
    then: "the notification is marked 'failed' with error reason logged",
    status: "fail",
    testFunction: "test_permanent_failure_logging",
  },
  {
    id: "SC-007",
    storyId: "US-3",
    given: "a template with variables {name} and {action}",
    when: "a notification is submitted with variables={name: 'Alice', action: 'deploy'}",
    then: "the rendered message contains 'Alice' and 'deploy'",
    status: "pass",
    testFunction: "test_template_interpolation",
  },
  {
    id: "SC-008",
    storyId: "US-3",
    given: "a template with variable {name} but variables dict is empty",
    when: "the notification is submitted",
    then: "the submission is rejected with 422 and error 'missing variable: name'",
    status: "pass",
    testFunction: "test_missing_variable_rejection",
  },
  {
    id: "SC-009",
    storyId: "US-3",
    given: "a template and valid variables",
    when: "a user previews the notification before sending",
    then: "the rendered preview is returned without creating a notification",
    status: "pending",
  },
  {
    id: "SC-010",
    storyId: "US-4",
    given: "a recipient with quiet hours 22:00-08:00 and current time is 23:30",
    when: "a non-critical notification is submitted",
    then: "the notification is deferred until 08:00",
    status: "pending",
  },
  {
    id: "SC-011",
    storyId: "US-4",
    given: "a recipient in quiet hours",
    when: "a critical notification is submitted",
    then: "the notification is delivered immediately (bypasses quiet hours)",
    status: "pending",
  },
];

export const MOCK_EDGE_CASES: EdgeCase[] = [
  { id: "EC-001", ruleId: "BR-001", description: "Retry timer fires but the notification was already delivered by a concurrent attempt", tested: true, testFunction: "test_idempotent_delivery" },
  { id: "EC-002", ruleId: "BR-001", description: "Retry attempt fails with a non-transient error (e.g., invalid recipient)", tested: true, testFunction: "test_non_transient_error_stops_retry" },
  { id: "EC-003", ruleId: "BR-002", description: "Recipient has no fallback channel configured", tested: false },
  { id: "EC-004", ruleId: "BR-002", description: "Fallback channel is the same as primary channel", tested: true, testFunction: "test_same_fallback_skipped" },
  { id: "EC-005", ruleId: "BR-003", description: "Rate limit counter overflows at exactly 100/min boundary", tested: true, testFunction: "test_rate_limit_boundary" },
  { id: "EC-006", ruleId: "BR-003", description: "Burst of 200 notifications in 1 second for same recipient", tested: false },
  { id: "EC-007", ruleId: "BR-004", description: "Template contains nested variable syntax: {{name}}", tested: true, testFunction: "test_nested_variable_syntax" },
  { id: "EC-008", ruleId: "BR-004", description: "Variables dict contains keys not referenced in template (extra variables)", tested: true, testFunction: "test_extra_variables_ignored" },
  { id: "EC-009", ruleId: "BR-005", description: "Quiet hours span midnight (22:00 - 08:00 next day)", tested: false },
  { id: "EC-010", ruleId: "BR-005", description: "Recipient timezone changes while notification is deferred", tested: false },
];

export const MOCK_RULE_RESULTS: RuleResult[] = [
  { ruleId: "BR-001", ruleName: "Retry Policy", totalTests: 4, passed: 4, failed: 0, skipped: 0 },
  { ruleId: "BR-002", ruleName: "Channel Fallback", totalTests: 3, passed: 2, failed: 1, skipped: 0 },
  { ruleId: "BR-003", ruleName: "Rate Limiting", totalTests: 2, passed: 1, failed: 0, skipped: 1 },
  { ruleId: "BR-004", ruleName: "Template Validation", totalTests: 4, passed: 4, failed: 0, skipped: 0 },
  { ruleId: "BR-005", ruleName: "Quiet Hours", totalTests: 0, passed: 0, failed: 0, skipped: 0 },
];
