// Polls the Custos Nox daemon's HTTP /events endpoint and returns the buffered
// alerts. Exported as a hook for client components. The daemon URL comes from
// NEXT_PUBLIC_CUSTOS_DAEMON_URL — when unset (e.g. local dev or Railway down)
// the page falls back to the devnet sample alerts so the section never blanks.

"use client";

import { useEffect, useState } from "react";
import type { AlertSeverity } from "./sample-alerts";

export interface DaemonAlert {
  detector: string;
  severity: AlertSeverity;
  subject: string;
  txSignature: string | null;
  cluster: "mainnet" | "devnet" | "testnet";
  // Daemon emits Unix milliseconds (Date.now()).
  timestamp: number;
  explorerLink: string;
  context: Record<string, unknown>;
}

export interface DaemonFeed {
  // null while we don't yet know whether the daemon is reachable.
  events: DaemonAlert[] | null;
  reachable: boolean;
  lastFetchedAt: number | null;
  error: string | null;
}

const POLL_INTERVAL_MS = 5_000;
// 4s — well under the 5s poll cadence so a slow daemon never stacks requests.
const FETCH_TIMEOUT_MS = 4_000;

export function getDaemonUrl(): string | null {
  const raw = process.env.NEXT_PUBLIC_CUSTOS_DAEMON_URL;
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

export function useDaemonFeed(): DaemonFeed {
  const [state, setState] = useState<DaemonFeed>({
    events: null,
    reachable: false,
    lastFetchedAt: null,
    error: null,
  });

  useEffect(() => {
    const url = getDaemonUrl();
    if (!url) {
      setState({ events: null, reachable: false, lastFetchedAt: null, error: "no daemon url" });
      return;
    }

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = async (): Promise<void> => {
      const ctrl = new AbortController();
      const abortId = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
      try {
        const res = await fetch(`${url}/events`, { signal: ctrl.signal, cache: "no-store" });
        if (!res.ok) throw new Error(`http ${res.status}`);
        const body = (await res.json()) as { events: DaemonAlert[] };
        if (cancelled) return;
        // Newest-first for the feed UI.
        const sorted = [...body.events].sort((a, b) => b.timestamp - a.timestamp);
        setState({
          events: sorted,
          reachable: true,
          lastFetchedAt: Date.now(),
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        setState((prev) => ({
          ...prev,
          reachable: false,
          error: err instanceof Error ? err.message : String(err),
          lastFetchedAt: Date.now(),
        }));
      } finally {
        clearTimeout(abortId);
      }
      if (!cancelled) timer = setTimeout(tick, POLL_INTERVAL_MS);
    };

    tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  return state;
}

// Per-DAO status derived from buffered events.
//   green  — no alert in the last 24h (default "watching" state)
//   yellow — high or medium severity alert in the last 24h
//   red    — critical alert in the last 24h
export type DaoStatus = "green" | "yellow" | "red";

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

export function deriveDaoStatus(
  events: DaemonAlert[] | null,
  watchedAccount: string,
  now: number = Date.now(),
): DaoStatus {
  if (!events) return "green";
  const recent = events.filter((e) => {
    if (now - e.timestamp > TWENTY_FOUR_HOURS_MS) return false;
    const acct = typeof e.context?.account === "string" ? e.context.account : null;
    return acct === watchedAccount;
  });
  if (recent.some((e) => e.severity === "critical")) return "red";
  if (recent.some((e) => e.severity === "high" || e.severity === "medium")) return "yellow";
  return "green";
}
