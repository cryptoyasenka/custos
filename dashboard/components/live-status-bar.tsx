"use client";

import { useEffect, useState } from "react";

export function LiveStatusBar() {
  const [seconds, setSeconds] = useState(2);

  useEffect(() => {
    const iv = setInterval(() => {
      setSeconds((s) => (s >= 29 ? 1 : s + 1));
    }, 1000);
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-accent/30 bg-accent/5 px-4 py-1.5 font-mono text-xs text-muted-strong">
      <span className="relative flex h-2 w-2 flex-shrink-0">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
      </span>
      <span>MONITORING 2 accounts</span>
      <span className="text-muted">·</span>
      <span>
        Last heartbeat:{" "}
        <span className="text-accent">{seconds}s ago</span>
      </span>
    </div>
  );
}
