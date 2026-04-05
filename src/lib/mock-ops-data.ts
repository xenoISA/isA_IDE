// ─── Ops Persona Mock Data (extracted from L6 System Contract) ───

export interface InfraRequirement {
  service: string;
  type: string;
  port: number;
  required: boolean;
  notes: string;
}

export interface DeployCheckItem {
  name: string;
  category: "container" | "orchestration" | "ci" | "monitoring";
  status: "ready" | "missing" | "partial";
  path?: string;
}

export interface EnvVariable {
  name: string;
  defaultValue: string;
  description: string;
  required: boolean;
  secret: boolean;
}

export interface HealthCheck {
  name: string;
  critical: boolean;
  description: string;
}

export const MOCK_INFRA_REQUIREMENTS: InfraRequirement[] = [
  { service: "PostgreSQL", type: "database", port: 5432, required: true, notes: "Notification + outbox tables, WAL replication" },
  { service: "Redis", type: "cache", port: 6379, required: true, notes: "Rate limiting counters, delivery dedup" },
  { service: "NATS JetStream", type: "messaging", port: 4222, required: true, notes: "CDC events, channel-specific delivery queues" },
  { service: "MinIO", type: "object-storage", port: 9000, required: false, notes: "Template storage, attachment hosting" },
  { service: "Neo4j", type: "graph-db", port: 7687, required: false, notes: "Notification dependency graph (optional)" },
];

export const MOCK_DEPLOY_CHECKLIST: DeployCheckItem[] = [
  { name: "Dockerfile", category: "container", status: "ready", path: "Dockerfile" },
  { name: "Docker Compose (dev)", category: "container", status: "ready", path: "docker-compose.yml" },
  { name: "K8s Deployment", category: "orchestration", status: "missing" },
  { name: "K8s Service", category: "orchestration", status: "missing" },
  { name: "K8s ConfigMap", category: "orchestration", status: "missing" },
  { name: "Health endpoint", category: "monitoring", status: "ready", path: "src/api/health.py" },
  { name: "Readiness probe", category: "monitoring", status: "partial" },
  { name: "GitHub Actions CI", category: "ci", status: "missing" },
  { name: "Liveness probe", category: "monitoring", status: "missing" },
];

export const MOCK_ENV_VARIABLES: EnvVariable[] = [
  { name: "DATABASE_URL", defaultValue: "postgresql://localhost:5432/notifications", description: "PostgreSQL connection string", required: true, secret: true },
  { name: "REDIS_URL", defaultValue: "redis://localhost:6379", description: "Redis connection string", required: true, secret: false },
  { name: "NATS_URL", defaultValue: "nats://localhost:4222", description: "NATS JetStream endpoint", required: true, secret: false },
  { name: "SENDGRID_API_KEY", defaultValue: "", description: "Email delivery provider key", required: true, secret: true },
  { name: "SLACK_WEBHOOK_URL", defaultValue: "", description: "Slack notification webhook", required: true, secret: true },
  { name: "TWILIO_ACCOUNT_SID", defaultValue: "", description: "SMS provider account", required: false, secret: true },
  { name: "LOG_LEVEL", defaultValue: "INFO", description: "Application log level", required: false, secret: false },
  { name: "RATE_LIMIT_PER_MIN", defaultValue: "100", description: "Max notifications per recipient per minute", required: false, secret: false },
  { name: "RETRY_MAX_ATTEMPTS", defaultValue: "3", description: "Max delivery retry attempts", required: false, secret: false },
  { name: "QUIET_HOURS_START", defaultValue: "22:00", description: "Default quiet hours start (local time)", required: false, secret: false },
  { name: "QUIET_HOURS_END", defaultValue: "08:00", description: "Default quiet hours end (local time)", required: false, secret: false },
];

export const MOCK_HEALTH_CHECKS: HealthCheck[] = [
  { name: "database", critical: true, description: "PostgreSQL connection and query execution" },
  { name: "redis", critical: true, description: "Redis connection and key read/write" },
  { name: "nats", critical: true, description: "NATS JetStream connection and stream availability" },
  { name: "outbox_poller", critical: true, description: "Outbox background poller is running and processing" },
  { name: "email_provider", critical: false, description: "SendGrid API reachability" },
  { name: "slack_provider", critical: false, description: "Slack webhook reachability" },
  { name: "sms_provider", critical: false, description: "Twilio API reachability (if configured)" },
];

export const MOCK_HEALTH_RESPONSE = `GET /health

{
  "status": "healthy",
  "version": "0.1.0",
  "checks": {
    "database": { "status": "ok", "latency_ms": 2.3 },
    "redis": { "status": "ok", "latency_ms": 0.8 },
    "nats": { "status": "ok", "latency_ms": 1.1 },
    "outbox_poller": { "status": "ok", "last_poll": "2026-04-04T12:00:00Z" },
    "email_provider": { "status": "ok" },
    "slack_provider": { "status": "degraded", "error": "timeout" },
    "sms_provider": { "status": "unconfigured" }
  }
}

Returns 200 if all critical checks pass.
Returns 503 if any critical check fails.`;
