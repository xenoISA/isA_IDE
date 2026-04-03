export const CONFIG = {
  vibe: {
    baseUrl: import.meta.env.VITE_VIBE_URL ?? "http://localhost:8240",
    wsUrl: import.meta.env.VITE_VIBE_WS_URL ?? "ws://localhost:8240",
  },
  orch: {
    baseUrl: import.meta.env.VITE_ORCH_URL ?? "http://localhost:8250",
  },
} as const;
