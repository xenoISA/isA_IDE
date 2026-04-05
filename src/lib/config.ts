export const CONFIG = {
  vibe: {
    baseUrl: import.meta.env.VITE_VIBE_URL ?? "http://localhost:18793",
    wsUrl: import.meta.env.VITE_VIBE_WS_URL ?? "ws://localhost:18793",
  },
  orch: {
    baseUrl: import.meta.env.VITE_ORCH_URL ?? "http://localhost:8250",
  },
  demoMode: import.meta.env.VITE_DEMO_MODE === "true" || true,
} as const;
