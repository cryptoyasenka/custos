import type { Alert, Detector, SolanaEvent } from "./types/events.js";

export async function dispatch(event: SolanaEvent, detectors: Detector[]): Promise<Alert[]> {
  const results = await Promise.all(
    detectors.map(async (d) => {
      try {
        return await d.inspect(event);
      } catch (err) {
        console.error(`[custos] detector ${d.name} threw`, err);
        return null;
      }
    }),
  );
  return results.filter((a): a is Alert => a !== null);
}
