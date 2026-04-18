import { createHash } from "node:crypto";

const MULTISIG_DISCRIMINATOR: Buffer = createHash("sha256")
  .update("account:Multisig")
  .digest()
  .subarray(0, 8);

export const SQUADS_MAX_TIME_LOCK = 3 * 30 * 24 * 60 * 60;

const MIN_BUFFER_LENGTH = 8 + 32 + 32 + 2 + 4;
const TIME_LOCK_OFFSET = 8 + 32 + 32 + 2;

export function parseSquadsMultisigTimelock(buf: Buffer): number | null {
  if (buf.length < MIN_BUFFER_LENGTH) return null;
  if (!buf.subarray(0, 8).equals(MULTISIG_DISCRIMINATOR)) return null;
  const value = buf.readUInt32LE(TIME_LOCK_OFFSET);
  if (value > SQUADS_MAX_TIME_LOCK) return null;
  return value;
}

export function squadsMultisigDiscriminator(): Buffer {
  return Buffer.from(MULTISIG_DISCRIMINATOR);
}
