# Contributing to Custos Nox

Custos Nox is open-source infrastructure for the Solana ecosystem. Contributions that
protect small DAOs and treasury multisigs are welcome.

## Quick start

```bash
git clone https://github.com/cryptoyasenka/custos-nox
cd custos-nox
npm install
cp .env.example .env      # set CUSTOS_RPC_URL and CUSTOS_WATCH
npm test                  # 164 tests, all must pass
npm run lint              # biome — no warnings allowed
npm run typecheck         # strict mode
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

Every detector implements the `Detector` interface from `src/types/detector.ts`.
Look at `src/detectors/timelock-removal.ts` for the simplest example.

**Contract:**
```typescript
interface Detector {
  id: string;                                         // kebab-case, unique
  watchedPrograms: PublicKey[];                       // accounts to subscribe
  onAccountChange(prev: AccountInfo | null, next: AccountInfo, pubkey: PublicKey): Alert | null;
}
```

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
npm run smoke:timelock      # reproduces the March 26 Drift step on devnet
npm run smoke:nonce         # reproduces the March 23 Drift step on devnet
```

## PR checklist

- [ ] `npm test` passes (all 164+ tests green)
- [ ] `npm run lint` — zero warnings
- [ ] `npm run typecheck` — zero errors
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
