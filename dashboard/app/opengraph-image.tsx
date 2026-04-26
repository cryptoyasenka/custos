import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Custos Nox — Real-time attack monitor for Solana";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BG = "#0a0a0a";
const SURFACE = "#111111";
const BORDER = "#262626";
const FG = "#ededed";
const MUTED = "#8a8a8a";
const ACCENT = "#22d3ee";
const RED = "#ef4444";
const AMBER = "#f59e0b";
const BLUE = "#60a5fa";

export default function OGImage() {
  return new ImageResponse(
    <div
      style={{
        width: 1200,
        height: 630,
        background: BG,
        display: "flex",
        flexDirection: "column",
        padding: "56px 64px",
        fontFamily: "monospace",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Right-side panel background */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: 410,
          height: 630,
          background: SURFACE,
          opacity: 0.25,
        }}
      />

      {/* Alert stack decoration (top-right) */}
      <div
        style={{
          position: "absolute",
          top: 56,
          right: 64,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          width: 320,
        }}
      >
        {[
          { sev: "CRITICAL", color: RED, label: "squads-timelock-removal" },
          { sev: "HIGH", color: AMBER, label: "squads-multisig-weakening" },
          { sev: "CRITICAL", color: RED, label: "privileged-nonce" },
          { sev: "HIGH", color: AMBER, label: "stale-nonce-execution" },
        ].map((a) => (
          <div
            key={a.label}
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              padding: "10px 14px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: 10,
                color: a.color,
                letterSpacing: 1.5,
                textTransform: "uppercase",
                fontWeight: 700,
              }}
            >
              {a.sev}
            </div>
            <div style={{ fontSize: 11, color: MUTED, letterSpacing: 0.5 }}>{a.label}</div>
          </div>
        ))}
      </div>

      {/* Brand row */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 48 }}>
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: ACCENT,
            flex: "none",
          }}
        />
        <span style={{ fontSize: 14, color: MUTED, letterSpacing: 2, textTransform: "uppercase" }}>
          Custos Nox
        </span>
        <span style={{ fontSize: 12, color: BORDER, marginLeft: 4 }}>·</span>
        <span
          style={{ fontSize: 12, color: MUTED, letterSpacing: 1.5, textTransform: "uppercase" }}
        >
          v0.2 · MIT
        </span>
      </div>

      {/* Headline */}
      <div
        style={{
          fontSize: 56,
          fontWeight: 700,
          color: FG,
          lineHeight: 1.1,
          letterSpacing: -1,
          maxWidth: 680,
          marginBottom: 20,
          fontFamily: "sans-serif",
        }}
      >
        Watch the chain
        <br />
        <span style={{ color: ACCENT }}>before it drains your treasury.</span>
      </div>

      {/* Sub */}
      <div
        style={{
          fontSize: 18,
          color: MUTED,
          lineHeight: 1.5,
          maxWidth: 580,
          marginBottom: "auto",
          fontFamily: "sans-serif",
        }}
      >
        Open-source real-time attack monitor for Solana multisigs and DAOs. Catches all 4 on-chain
        steps used to drain $285M from Drift.
      </div>

      {/* Stats row */}
      <div style={{ display: "flex", gap: 20, marginTop: 40 }}>
        {[
          { value: "4", label: "Detectors live" },
          { value: "147", label: "Tests passing" },
          { value: "$285M", label: "Drift loss tracked" },
          { value: "MIT", label: "License" },
        ].map((stat) => (
          <div
            key={stat.label}
            style={{
              background: SURFACE,
              border: `1px solid ${BORDER}`,
              borderRadius: 6,
              padding: "12px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            <div
              style={{
                fontSize: 22,
                fontWeight: 700,
                color: FG,
                letterSpacing: -0.5,
                fontFamily: "monospace",
              }}
            >
              {stat.value}
            </div>
            <div
              style={{ fontSize: 11, color: MUTED, letterSpacing: 1, textTransform: "uppercase" }}
            >
              {stat.label}
            </div>
          </div>
        ))}

        {/* Severity indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
          {[RED, AMBER, BLUE].map((c) => (
            <div
              key={c}
              style={{ width: 10, height: 10, borderRadius: "50%", background: c, flex: "none" }}
            />
          ))}
        </div>
      </div>
    </div>,
    { ...size },
  );
}
