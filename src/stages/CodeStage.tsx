import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CodeViewer } from "@/components/ui/CodeViewer";

interface CodeStageProps {
  codeChanges: string[];
  mode?: "demo" | "live";
}

function getFileType(filePath: string): "test" | "init" | "code" {
  const name = filePath.toLowerCase();
  if (name.includes("test")) return "test";
  if (name.includes("__init__")) return "init";
  return "code";
}

function getLanguage(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "py":
      return "python";
    case "ts":
    case "tsx":
      return "typescript";
    case "js":
    case "jsx":
      return "javascript";
    case "yaml":
    case "yml":
      return "yaml";
    case "md":
      return "markdown";
    case "json":
      return "json";
    case "toml":
      return "toml";
    case "sql":
      return "sql";
    case "sh":
    case "bash":
      return "shell";
    default:
      return "plaintext";
  }
}

function getDemoContent(filePath: string): string {
  const name = filePath.toLowerCase();
  const lang = getLanguage(filePath);

  if (lang === "python") {
    if (name.includes("test")) {
      return `"""Tests for ${filePath.split("/").pop()}"""
import pytest
from unittest.mock import AsyncMock, MagicMock

from src.services.notification_service import NotificationService
from src.models.notification import Notification, NotificationStatus


class TestNotificationService:
    """Unit tests for the notification service."""

    @pytest.fixture
    def service(self):
        repo = AsyncMock()
        template_svc = MagicMock()
        channel_router = AsyncMock()
        return NotificationService(repo, template_svc, channel_router)

    @pytest.mark.asyncio
    async def test_create_notification_queues_message(self, service):
        """A new notification should be queued with status QUEUED."""
        result = await service.create(
            recipient_id="usr_abc123",
            channel="email",
            template_id="welcome_v2",
            variables={"name": "Alice"},
        )
        assert result.status == NotificationStatus.QUEUED
        assert result.recipient_id == "usr_abc123"

    @pytest.mark.asyncio
    async def test_create_notification_validates_template(self, service):
        """Missing template variables should raise ValidationError."""
        service._template_svc.validate.side_effect = ValueError("Missing: name")
        with pytest.raises(ValueError, match="Missing: name"):
            await service.create(
                recipient_id="usr_abc123",
                channel="email",
                template_id="welcome_v2",
                variables={},
            )

    @pytest.mark.asyncio
    async def test_retry_policy_exponential_backoff(self, service):
        """Retries should use exponential backoff: 1s, 4s, 16s."""
        delays = service._calculate_backoff_delays(max_attempts=3)
        assert delays == [1, 4, 16]
`;
    }

    if (name.includes("model")) {
      return `"""Domain models for the notification service."""
from datetime import datetime
from enum import Enum
from typing import Literal

from pydantic import BaseModel, Field


class NotificationStatus(str, Enum):
    QUEUED = "queued"
    SENDING = "sending"
    SENT = "sent"
    FAILED = "failed"
    RETRYING = "retrying"


class ChannelType(str, Enum):
    EMAIL = "email"
    SLACK = "slack"
    SMS = "sms"


class Notification(BaseModel):
    """Root aggregate for outbound notifications."""
    notification_id: str = Field(..., description="Unique notification ID")
    recipient_id: str = Field(..., description="Target user ID")
    channel: ChannelType = Field(..., description="Delivery channel")
    template_id: str = Field(..., description="Message template reference")
    variables: dict[str, str] = Field(default_factory=dict)
    status: NotificationStatus = Field(default=NotificationStatus.QUEUED)
    priority: Literal["critical", "normal", "low"] = "normal"
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    delivered_at: datetime | None = None
`;
    }

    if (name.includes("service")) {
      return `"""Notification service — orchestrates delivery lifecycle."""
from __future__ import annotations

import uuid
from datetime import datetime

from src.models.notification import Notification, NotificationStatus
from src.repositories.notification_repo import NotificationRepository
from src.services.template_service import TemplateService
from src.providers.channel_router import ChannelRouter


class NotificationService:
    """Handles notification creation, retry, and fallback logic."""

    def __init__(
        self,
        repo: NotificationRepository,
        template_svc: TemplateService,
        channel_router: ChannelRouter,
    ) -> None:
        self._repo = repo
        self._template_svc = template_svc
        self._channel_router = channel_router

    async def create(
        self,
        recipient_id: str,
        channel: str,
        template_id: str,
        variables: dict[str, str] | None = None,
        priority: str = "normal",
    ) -> Notification:
        """Create and queue a new notification."""
        # Validate template variables
        self._template_svc.validate(template_id, variables or {})

        notification = Notification(
            notification_id=f"ntf_{uuid.uuid4().hex[:8]}",
            recipient_id=recipient_id,
            channel=channel,
            template_id=template_id,
            variables=variables or {},
            priority=priority,
            status=NotificationStatus.QUEUED,
        )

        await self._repo.save(notification)
        return notification

    def _calculate_backoff_delays(self, max_attempts: int = 3) -> list[int]:
        """Exponential backoff: 4^(attempt-1) seconds."""
        return [4 ** i for i in range(max_attempts)]
`;
    }

    if (name.includes("provider") || name.includes("sendgrid") || name.includes("slack") || name.includes("twilio")) {
      return `"""Channel provider implementation."""
from __future__ import annotations

import abc
from dataclasses import dataclass


@dataclass
class DeliveryResult:
    success: bool
    provider_response: str | None = None
    duration_ms: int = 0


class ChannelProvider(abc.ABC):
    """Abstract base for channel delivery providers."""

    @abc.abstractmethod
    async def send(
        self,
        recipient_id: str,
        rendered_body: str,
        subject: str | None = None,
    ) -> DeliveryResult:
        """Send a message and return the delivery result."""
        ...

    @abc.abstractmethod
    async def health_check(self) -> bool:
        """Check if the provider is available."""
        ...
`;
    }

    if (name.includes("repo")) {
      return `"""Notification repository — PostgreSQL persistence."""
from __future__ import annotations

from src.models.notification import Notification


class NotificationRepository:
    """Handles notification CRUD against PostgreSQL."""

    def __init__(self, session_factory) -> None:
        self._session_factory = session_factory

    async def save(self, notification: Notification) -> None:
        """Persist a notification to the database."""
        async with self._session_factory() as session:
            session.add(notification)
            await session.commit()

    async def get_by_id(self, notification_id: str) -> Notification | None:
        """Retrieve a notification by ID."""
        async with self._session_factory() as session:
            return await session.get(Notification, notification_id)

    async def update_status(
        self, notification_id: str, status: str
    ) -> None:
        """Update the status of a notification."""
        async with self._session_factory() as session:
            notif = await session.get(Notification, notification_id)
            if notif:
                notif.status = status
                await session.commit()
`;
    }

    if (name.includes("route")) {
      return `"""Notification API routes — FastAPI endpoints."""
from fastapi import APIRouter, HTTPException, status

from src.models.notification import NotificationInput, NotificationCreated
from src.services.notification_service import NotificationService

router = APIRouter(prefix="/api/v1/notifications", tags=["notifications"])


@router.post("/", response_model=NotificationCreated, status_code=status.HTTP_201_CREATED)
async def create_notification(payload: NotificationInput, service: NotificationService):
    """Create and queue a new notification for delivery."""
    try:
        result = await service.create(
            recipient_id=payload.recipient_id,
            channel=payload.channel,
            template_id=payload.template_id,
            variables=payload.variables,
            priority=payload.priority,
        )
        return NotificationCreated(notification_id=result.notification_id)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))


@router.get("/{notification_id}")
async def get_notification(notification_id: str, service: NotificationService):
    """Retrieve a notification with its delivery history."""
    result = await service.get(notification_id)
    if not result:
        raise HTTPException(status_code=404, detail="Notification not found")
    return result
`;
    }

    if (name.includes("worker") || name.includes("poller")) {
      return `"""Outbox poller — reliable event dispatch via transactional outbox."""
from __future__ import annotations

import asyncio
import logging

logger = logging.getLogger(__name__)


class OutboxPoller:
    """Polls the outbox table and publishes events to the event bus."""

    def __init__(self, session_factory, event_bus, poll_interval_ms: int = 500):
        self._session_factory = session_factory
        self._event_bus = event_bus
        self._poll_interval = poll_interval_ms / 1000
        self._running = False

    async def start(self) -> None:
        """Start the polling loop."""
        self._running = True
        logger.info("Outbox poller started (interval=%.1fs)", self._poll_interval)
        while self._running:
            await self._poll_once()
            await asyncio.sleep(self._poll_interval)

    async def stop(self) -> None:
        """Stop the polling loop."""
        self._running = False
        logger.info("Outbox poller stopped")

    async def _poll_once(self) -> None:
        """Fetch unpublished outbox rows and dispatch events."""
        async with self._session_factory() as session:
            rows = await session.execute(
                "SELECT * FROM outbox WHERE published = false "
                "ORDER BY created_at LIMIT 100"
            )
            for row in rows:
                await self._event_bus.publish(row.event_type, row.payload)
                row.published = True
            await session.commit()
`;
    }

    // Generic Python fallback
    return `"""Module: ${filePath.split("/").pop()}"""
# Generated by isA Vibe — CDD+TDD pipeline
# This file implements part of the notification service.

from __future__ import annotations


def main():
    """Entry point for this module."""
    pass
`;
  }

  if (lang === "yaml" || lang === "yml") {
    return `# Configuration for ${filePath.split("/").pop()}
# Generated by isA Vibe pipeline

service:
  name: notification-service
  version: 1.0.0
  port: 8080

database:
  host: localhost
  port: 5432
  name: notifications
  pool_size: 10

redis:
  url: redis://localhost:6379
  ttl: 300

channels:
  email:
    provider: sendgrid
    rate_limit: 100
  slack:
    provider: webhook
    rate_limit: 200
  sms:
    provider: twilio
    rate_limit: 50
`;
  }

  if (lang === "markdown") {
    return `# ${filePath.split("/").pop()?.replace(/\.\w+$/, "")}

## Overview
This document describes the notification service component.

## Architecture
The service follows an event-driven architecture with a transactional
outbox pattern for reliable message dispatch.

## Key Decisions
- **Outbox pattern** for at-least-once delivery guarantees
- **Exponential backoff** with channel fallback for resilience
- **Template engine** with variable validation before queueing
`;
  }

  if (lang === "json") {
    return `{
  "name": "notification-service",
  "version": "1.0.0",
  "description": "Multi-channel notification service",
  "dependencies": {
    "fastapi": ">=0.100.0",
    "pydantic": ">=2.0.0",
    "sqlalchemy": ">=2.0.0"
  }
}
`;
  }

  return `// Content for ${filePath}\n`;
}

/** SVG icons per file type */
function FileIcon({ type }: { type: "test" | "init" | "code" }) {
  if (type === "test") {
    return (
      <svg
        className="w-3.5 h-3.5 text-accent"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 8l3 3 5-6"
        />
      </svg>
    );
  }
  if (type === "init") {
    return (
      <svg
        className="w-3.5 h-3.5 text-text-muted"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <rect x="3" y="3" width="10" height="10" rx="2" />
        <path strokeLinecap="round" d="M6 8h4" />
      </svg>
    );
  }
  // code
  return (
    <svg
      className="w-3.5 h-3.5 text-info"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5"
      />
    </svg>
  );
}

export function CodeStage({ codeChanges, mode = "demo" }: CodeStageProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  if (codeChanges.length === 0) {
    return (
      <motion.div
        className="max-w-3xl pt-20"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="flex flex-col items-start gap-4">
          {/* Large muted code icon */}
          <svg
            className="w-12 h-12 text-text-muted/20"
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16 12L4 24l12 12M32 12l12 12-12 12M28 8L20 40"
            />
          </svg>

          <div>
            <p className="text-lg text-text-secondary font-medium tracking-tight">
              No code changes yet
            </p>
            <p className="text-sm text-text-muted mt-1 max-w-[40ch]">
              The pipeline generates code after tests pass.
            </p>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ y: -1 }}
            disabled
            className="
              mt-2 px-4 py-2 rounded-[--radius-button]
              bg-transparent border border-border text-text-secondary text-sm
              hover:bg-surface-1 hover:border-border
              disabled:opacity-40 disabled:cursor-not-allowed
              transition-colors cursor-pointer
            "
          >
            Run pipeline
          </motion.button>
        </div>
      </motion.div>
    );
  }

  const viewerContent = selectedFile
    ? mode === "demo"
      ? getDemoContent(selectedFile)
      : null // live mode handled in DevCodePanel
    : null;

  const viewerLanguage = selectedFile ? getLanguage(selectedFile) : "plaintext";

  return (
    <motion.div
      className="max-w-3xl"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl tracking-tight font-medium text-text-primary">
          Generated Code
        </h2>
        <p className="text-xs text-text-muted mt-1">
          <span className="font-mono tabular-nums text-text-secondary">
            {codeChanges.length}
          </span>
          {" "}file{codeChanges.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* File list -- double bezel container */}
      <div className="bezel">
        <div className="bezel-inner divide-y divide-border">
          {codeChanges.map((file, index) => {
            const type = getFileType(file);
            const isSelected = selectedFile === file;

            return (
              <motion.div
                key={file}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05, duration: 0.25 }}
                className={`flex items-center gap-3 px-4 py-2.5 transition-colors ${
                  isSelected ? "bg-accent-dim" : ""
                }`}
              >
                {/* File type SVG icon */}
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <FileIcon type={type} />
                </div>

                {/* File path */}
                <span className="text-[11px] font-mono text-text-secondary flex-1 min-w-0 truncate">
                  {file}
                </span>

                {/* View button */}
                <button
                  onClick={() =>
                    setSelectedFile(isSelected ? null : file)
                  }
                  className={`text-[11px] transition-colors cursor-pointer ${
                    isSelected
                      ? "text-accent font-medium"
                      : "text-accent/60 hover:text-accent"
                  }`}
                >
                  {isSelected ? "Close" : "View"}
                </button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Code viewer panel */}
      <AnimatePresence mode="wait">
        {selectedFile && viewerContent && (
          <motion.div
            key={selectedFile}
            initial={{ opacity: 0, height: 0, marginTop: 0 }}
            animate={{ opacity: 1, height: "auto", marginTop: 16 }}
            exit={{ opacity: 0, height: 0, marginTop: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="bezel">
              <div className="bezel-inner overflow-hidden">
                {/* Viewer header with filename and close */}
                <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-accent/60 shrink-0" />
                    <span className="text-[11px] font-mono text-text-secondary truncate">
                      {selectedFile}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="text-text-muted hover:text-text-secondary transition-colors cursor-pointer shrink-0 p-1"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      viewBox="0 0 14 14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 3l8 8M11 3l-8 8"
                      />
                    </svg>
                  </button>
                </div>

                {/* Monaco editor */}
                <CodeViewer
                  content={viewerContent}
                  language={viewerLanguage}
                  height="400px"
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
