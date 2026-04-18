# Research: Timelock fields in Squads V4 + SPL Governance

**Date:** 2026-04-18
**Purpose:** Ground-truth field names, types, and SDK choices for TimelockRemovalDetector.
**Sources:** Live source reads via `gh api` on official repos. See end for exact commits.

## Squads V4

**Repo:** `Squads-Protocol/v4`
**File:** `programs/squads_multisig_program/src/state/multisig.rs`

### Multisig account struct (authoritative)

```rust
#[account]
pub struct Multisig {
    pub create_key: Pubkey,           // 32
    pub config_authority: Pubkey,     // 32
    pub threshold: u16,               // 2
    pub time_lock: u32,               // 4  <-- OUR FIELD (seconds)
    pub transaction_index: u64,       // 8
    pub stale_transaction_index: u64, // 8
    pub rent_collector: Option<Pubkey>, // 1 + 32
    pub bump: u8,                     // 1
    pub members: Vec<Member>,         // variable
}
```

Plus 8-byte Anchor discriminator at head.

**Fixed byte offset for `time_lock`:** `8 + 32 + 32 + 2 = 74` (read u32 LE at offset 74).
**Account size is variable** due to `Vec<Member>` — don't trust fixed total size.

### Constants

```rust
pub const MAX_TIME_LOCK: u32 = 3 * 30 * 24 * 60 * 60; // 7,776,000 seconds = ~3 months
```

→ Sane upper bound: if we ever read a value > MAX_TIME_LOCK, assume parse error.

### SDK

- **Package:** `@sqds/multisig` v2.1.4 (7 months since last publish as of 2026-04-18)
- **Usage:** `await accounts.Multisig.fromAccountAddress(connection, pda)` returns deserialized struct with `timeLock: number` (camelCase in TS)
- **Alternative:** manual byte-offset read at 74 (acceptable since field is before the variable `members` vec)

## SPL Governance

**Canonical repo (active):** `Mythic-Project/solana-program-library` (not `solana-labs/solana-program-library` — ownership transferred)
**File:** `governance/program/src/state/governance.rs`

### GovernanceConfig struct (authoritative)

```rust
pub struct GovernanceConfig {
    pub community_vote_threshold: VoteThreshold,              // borsh enum, variable
    pub min_community_weight_to_create_proposal: u64,         // 8
    pub transactions_hold_up_time: u32,                       // 4  <-- OUR FIELD (seconds)
    pub voting_base_time: u32,                                // 4
    pub community_vote_tipping: VoteTipping,                  // borsh enum
    pub council_vote_threshold: VoteThreshold,                // borsh enum
    pub council_veto_vote_threshold: VoteThreshold,           // borsh enum
    pub min_council_weight_to_create_proposal: u64,           // 8
    pub council_vote_tipping: VoteTipping,                    // borsh enum
    pub community_veto_vote_threshold: VoteThreshold,         // borsh enum
    pub voting_cool_off_time: u32,                            // 4
    pub deposit_exempt_proposal_count: u8,                    // 1
}
```

**Field name correction:** older docs reference `min_transaction_hold_up_time`. Current source: `transactions_hold_up_time`. Use the current name.

### Wrapping account

```rust
pub struct GovernanceV2 {
    pub account_type: GovernanceAccountType,  // 1-byte enum tag
    pub realm: Pubkey,                        // 32
    pub governance_seed: Pubkey,              // 32
    pub reserved1: u32,                       // 4
    pub config: GovernanceConfig,             // variable due to enums
    pub reserved_v2: Reserved119,             // 119
    pub required_signatories_count: u8,       // 1
    pub active_proposal_count: u64,           // 8
}
```

Total `get_max_size() = 236`.

### What account do we watch?

**Governance PDA**, not Realm PDA. Each DAO has multiple Governances (one per governed mint/program/account). `transactions_hold_up_time` lives in Governance, not Realm.

### Parsing strategy

Byte-offset reads are fragile because `VoteThreshold` is a borsh enum with variable payload (discriminant byte + optional u8 for YesVotePercentage variant). **Use borsh SDK parsing**, not manual offsets.

### SDK options

1. **`governance-idl-sdk`** (Mythic-Project) — actively maintained, TypeScript-first, IDL-driven. **Preferred.**
2. **`@solana/spl-governance`** — legacy npm package, still works but main dev moved.
3. Manual borsh schema — fallback only.

**Decision:** Start with `governance-idl-sdk`. If API doesn't expose raw buffer decode, fall back to `@solana/spl-governance`. Borsh-by-hand is last resort.

### Account type enum (for discriminant check)

From Mythic source `state/enums.rs`:
- `Uninitialized = 0`
- `RealmV1 = 1`
- `TokenOwnerRecordV1 = 2`
- `GovernanceV1 = 3`
- `ProgramGovernanceV1 = 4`
- `ProposalV1 = 5`
- `SignatoryRecord = 6`
- `VoteRecordV1 = 7`
- `ProposalInstructionV1 = 8`
- `MintGovernanceV1 = 9`
- `TokenGovernanceV1 = 10`
- `RealmConfig = 11`
- `VoteRecordV2 = 12`
- `ProposalTransactionV2 = 13`
- `ProposalV2 = 14`
- `ProgramMetadata = 15`
- `RealmV2 = 16`
- `TokenOwnerRecordV2 = 17`
- **`GovernanceV2 = 18`**
- `ProgramGovernanceV2 = 19`
- `MintGovernanceV2 = 20`
- `TokenGovernanceV2 = 21`

Detector accepts `GovernanceV2 | ProgramGovernanceV2 | MintGovernanceV2 | TokenGovernanceV2` (all have same `config: GovernanceConfig` field).

**NOTE:** discriminant values above are inferred from source order; must verify by reading actual enum definition in `state/enums.rs` before writing code. Flagged as TODO in T2.

## Refined severity ladder (post-research)

No change from original plan, but now with concrete max bound:

| Case | Severity |
|---|---|
| `prev > 0 && curr == 0` | **critical** (Drift scenario) |
| `prev > 0 && curr < prev * 0.5 && curr > 0` | **high** |
| `curr > MAX_TIME_LOCK` (Squads only) | **medium** (parse suspicion, manual review) |
| `curr >= prev` | no alert |
| `prev == 0` | no alert (already removed) |
| `prev == null` (initial baseline) | no alert |

For SPL Governance there's no hardcoded max; use 10 years (3.15e8 s) as sanity cap.

## Refined watch config

```yaml
watch:
  - kind: squads-multisig
    pda: <Squads Multisig PDA>
    channels: [discord, slack]
  - kind: spl-governance
    pda: <SPL Governance PDA>          # NOT Realm PDA
    channels: [webhook]
```

## Source verification commits

- Squads V4 `multisig.rs`: fetched via `gh api repos/Squads-Protocol/v4/contents/programs/squads_multisig_program/src/state/multisig.rs` on 2026-04-18
- Mythic `governance.rs`: fetched via `gh api repos/Mythic-Project/solana-program-library/contents/governance/program/src/state/governance.rs` on 2026-04-18

Both read directly from `main`/`master` branches. Re-verify before finalizing detector (programs may redeploy).
