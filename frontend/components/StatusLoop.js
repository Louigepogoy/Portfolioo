"use client";

import { useEffect, useState } from "react";
import { API_URL } from "../lib/api";

const INTERVAL_MS = 15000;

// Heartbeat loop: pings the Express API every 15s and shows whether the backend is live.
export default function StatusLoop() {
  const [state, setState] = useState({ online: null, latency: null, checks: 0 });

  useEffect(() => {
    let cancelled = false;

    async function ping() {
      const start = performance.now();
      try {
        const res = await fetch(`${API_URL}/api/health`, { cache: "no-store" });
        if (!res.ok) throw new Error();
        if (!cancelled) {
          setState((s) => ({ online: true, latency: Math.round(performance.now() - start), checks: s.checks + 1 }));
        }
      } catch {
        if (!cancelled) setState((s) => ({ online: false, latency: null, checks: s.checks + 1 }));
      }
    }

    ping();
    const id = setInterval(ping, INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  const label =
    state.online === null ? "Checking API…" : state.online ? `API online · ${state.latency}ms` : "API offline · using cached data";

  return (
    <div className={`status ${state.online === false ? "status--down" : ""}`} title={`${label} · health checks run: ${state.checks}`}>
      <span className="status__dot" />
      <span className="status__text">{label}</span>
    </div>
  );
}
