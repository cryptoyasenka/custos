# Dev environment setup

## Prerequisites

- Node 20+ (`node -v`)
- npm 10+ (ships with Node 20)
- Solana CLI 1.18+ — https://docs.anza.xyz/cli/install (only needed
  for the devnet smoke harness)

Any RPC endpoint works (Solana public cluster, Helius, Triton, your
own validator). The `.env.example` defaults to the public devnet.

## Clone and install

```bash
git clone https://github.com/cryptoyasenka/custos-nox.git
cd custos-nox
npm install
```

## Environment

```bash
cp .env.example .env
```

Set:

- `CUSTOS_RPC_URL` — HTTP RPC endpoint
- `CUSTOS_CLUSTER` — `mainnet` / `devnet` / `testnet`
- `CUSTOS_WATCH` — comma-separated `<programId>:<accountPubkey>` pairs
- `CUSTOS_DISCORD_WEBHOOK` / `CUSTOS_SLACK_WEBHOOK` — optional

Never commit `.env`. It is in `.gitignore`.

## Devnet wallet (for smoke harness only)

```bash
solana-keygen new --outfile ~/.config/solana/id.json
solana config set --keypair ~/.config/solana/id.json --url devnet
```

`scripts/devnet-create.ts` auto-airdrops 1 SOL if your balance is
below 0.5 SOL. If the faucet is rate-limiting you, request manually:

```bash
solana airdrop 2
```

## Scripts

```bash
npm run dev             # daemon with tsx watch
npm test                # vitest
npm run lint            # biome check
npm run format          # biome format --write
npm run build           # tsc emit to dist/
npm run smoke:create    # create a 3-of-5 Squads multisig on devnet
npm run smoke:weaken    # drop the threshold to 1 (Drift-step simulation)
```

## Devnet smoke demo

End-to-end proof the daemon catches a real on-chain threshold drop.
See the README "Running the devnet demo" section for the two-terminal
walkthrough.

## Troubleshooting

- **`ECONNREFUSED` on WebSocket** — wrong or unreachable
  `CUSTOS_RPC_URL`. Test with `curl $CUSTOS_RPC_URL` first.
- **`Insufficient SOL`** — devnet faucet is rate-limited; wait or use
  `https://faucet.solana.com`.
- **No alerts when you expect one** — the daemon logs every subscribe
  line at startup. If your target account isn't listed, `CUSTOS_WATCH`
  parsing dropped it. Check the `<programId>:<accountPubkey>` format.
- **Rate limits on public RPC** — if you're watching many accounts,
  move to Helius / Triton free tier.

## Not yet wired

- GitHub Actions CI
- Dashboard dev server (v2)
- Mainnet config profile (opt-in, after beta)
