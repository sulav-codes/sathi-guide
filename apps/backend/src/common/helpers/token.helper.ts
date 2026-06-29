import * as crypto from 'crypto';
import * as argon2 from 'argon2';
import {
  ARGON2_OPTIONS,
  OPAQUE_TOKEN_BYTES,
} from '../constants/auth.constants';

/**
 * Generate a cryptographically secure random opaque token.
 * 256 bits of entropy — suitable for refresh, reset, and verification tokens.
 */
export function generateOpaqueToken(): string {
  return crypto.randomBytes(OPAQUE_TOKEN_BYTES).toString('hex');
}

/**
 * Deterministic SHA-256 hash of a raw opaque token — used for fast DB lookups.
 *
 * Security rationale:
 * - Raw tokens have 256 bits of entropy (crypto.randomBytes(32))
 * - SHA-256 is one-way: the stored hash cannot be reversed to recover the token
 * - An attacker with DB access gets only the hash; brute-forcing 2^256 values is infeasible
 * - This is the industry-standard approach (Laravel Sanctum, many OAuth libs)
 */
export function sha256Hash(rawToken: string): string {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Hash a password or sensitive secret using Argon2id.
 * Use for: user passwords only.
 */
export async function hashWithArgon2(plain: string): Promise<string> {
  return argon2.hash(plain, ARGON2_OPTIONS);
}

/**
 * Verify a plain value against an Argon2id hash.
 * Returns false (never throws) on any error.
 */
export async function verifyArgon2(
  hash: string,
  plain: string,
): Promise<boolean> {
  try {
    return await argon2.verify(hash, plain, ARGON2_OPTIONS);
  } catch {
    return false;
  }
}
