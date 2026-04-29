# Contributing to Custos Nox

Custos Nox is open-source infrastructure for the Solana ecosystem. Contributions that
protect small DAOs and treasury multisigs are welcome.

## Quick start

```bash
git clone https://github.com/cryptoyasenka/custos-nox
cd custos-nox
npm install
cp .env.example .env      # set CUSTOS_RPC_URL and CUSTOS_WATCH
npm test                  # 205 tests, all must pass
npm run lint              # biome — no warnings allowed
npm run build             # tsc — strict mode, must succeed
```

## What makes a good contribution

**High value:**
- New detectors for Solana attack patterns (see detector contract below)
- Mainnet watch configurations for major Squads multisigs / SPL Governance realms
- Alert sinks (Telegram, PagerDuty, webhooks)
- Config validation and better error messages
- Documentation improvements

**Out of scope:**
- Features that require paid infrastructure (the free-tier target is intentional)
- Rust rewrites of detectors (TypeScript is the intentional choice for accessibility)

## Writing a new detector

Every detector implements the `Detector` interface from `src/types/events.ts`.
Look at `src/detectors/timelock-removal.ts` for the simplest example.

**Contract:**
```typescript
interface Detector {
  name: string;
  description: string;
  inspect(event: SolanaEvent): Promise<Alert | null>;
}
```

`SolanaEvent` is currently always an `AccountChangeEvent` (see `src/types/events.ts`).
Detectors switch on `event.kind` and inspect `event.data` vs `event.previousData`.

**Rules:**
- Return `null` when nothing suspicious happened
- Return an `Alert` with appropriate severity (`critical` / `high` / `medium` / `low`)
- Every detector needs a co-located unit test in `src/detectors/<name>.test.ts`
- Tests must not require a live RPC connection — use the test helpers in `src/detectors/_shared.ts`

## Running a specific test file

```bash
npx vitest run src/detectors/timelock-removal.test.ts
```

## Devnet smoke test

Set up a devnet wallet and Squads multisig following `DEV-ENV-SETUP.md`, then:

```bash
npm run smoke:timelock        # reproduces the timelock-removal Drift step
npm run smoke:weaken          # reproduces the threshold-reduction Drift step
npm run smoke:nonce-init      # reproduces the privileged-nonce Drift step
npm run smoke:rotate-signers  # exercises SignerSetChangeDetector (adjacent vector)
```

## PR checklist

- [ ] `npm test` passes (all 205+ tests green)
- [ ] `npm run lint` — zero warnings
- [ ] `npm run build` — `tsc` strict mode, zero errors
- [ ] New detector has a co-located `.test.ts` with ≥10 unit tests
- [ ] PR description explains what attack pattern the change detects or prevents

## Code style

Biome handles formatting and linting. Run `npm run lint:fix` before committing.
No comments unless the why is non-obvious. Prefer explicit types over inference.

## Reporting a bug

Open a GitHub issue with:
- Node.js version and OS
- Minimal `.env` config (no secrets)
- Full error output from `npm run dev`

## License

MIT. All contributions are licensed under the same terms.
