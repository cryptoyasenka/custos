import { Governance, GovernanceAccountParser } from "@solana/spl-governance";
import { type AccountInfo, PublicKey } from "@solana/web3.js";

export const SPL_GOVERNANCE_PROGRAM_ID = new PublicKey(
  "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
);

export const SPL_GOVERNANCE_MAX_TIME_LOCK = 10 * 365 * 24 * 60 * 60;

const SYNTHETIC_PK = new PublicKey("11111111111111111111111111111111");

const parser = GovernanceAccountParser(Governance);

export function parseGovernanceTimelock(buf: Buffer): number | null {
  if (buf.length < 80) return null;
  const accountType = buf[0];
  if (accountType === undefined) return null;
  if (accountType < 18 || accountType > 21) return null;

  const accountInfo: AccountInfo<Buffer> = {
    executable: false,
    owner: SPL_GOVERNANCE_PROGRAM_ID,
    lamports: 0,
    data: buf,
    rentEpoch: 0,
  };

  try {
    const parsed = parser(SYNTHETIC_PK, accountInfo);
    const seconds = parsed.account.config.transactionsHoldUpTime;
    if (typeof seconds !== "number" || seconds < 0) return null;
    if (seconds > SPL_GOVERNANCE_MAX_TIME_LOCK) return null;
    return seconds;
  } catch {
    return null;
  }
}
