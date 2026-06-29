import { Role } from '../../generated/prisma/client';

// ── Argon2 ────────────────────────────────────────────────────────────────────

export const ARGON2_OPTIONS = {
  type: 2, // argon2id — most secure variant, resistant to GPU + side-channel attacks
  memoryCost: 65536, // 64 MB
  timeCost: 3, // 3 iterations
  parallelism: 4, // 4 parallel
  secret: process.env.ARGON2_SECRET
    ? Buffer.from(process.env.ARGON2_SECRET, 'utf-8')
    : undefined,
} as const;

/**
 * Pre-computed dummy hash used exclusively for constant-time comparison
 * when a user is not found — prevents timing-based email enumeration attacks.
 * This hash corresponds to the password "DummyPassword123!" hashed with the above ARGON2_OPTIONS.
 */
export const DUMMY_ARGON2_HASH =
  '$argon2id$v=19$m=65536,t=3,p=4$ILc4n5xrODPpd2w33SLTSA$UR9tmaCE7NVO0SKk2x3buPdfuGIQ3S7vBSJcppVo0KA';

// ── Token byte lengths ────────────────────────────────────────────────────────

/** 256-bit opaque token — used for refresh, reset, and verification tokens */
export const OPAQUE_TOKEN_BYTES = 32;

// ── Refresh token revocation reasons ─────────────────────────────────────────

export const REVOKE_REASON = {
  LOGOUT: 'logout',
  ROTATED: 'rotated',
  EXPIRED: 'expired',
  PASSWORD_RESET: 'password_reset',
  PASSWORD_CHANGED: 'password_changed',
  FAMILY_COMPROMISED: 'family_invalidated_token_reuse',
} as const;

export type RevokeReason = (typeof REVOKE_REASON)[keyof typeof REVOKE_REASON];

// ── Self-registerable roles ───────────────────────────────────────────────────

/** Roles a user can self-assign during public registration */
export const SELF_REGISTERABLE_ROLES: Role[] = [Role.TOURIST, Role.GUIDE];

// ── Password ──────────────────────────────────────────────────────────────────

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&\-_#^])[A-Za-z\d@$!%*?&\-_#^]+$/;

export const PASSWORD_COMPLEXITY_MESSAGE =
  'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&-_#^)';

// ── Generic security messages (prevent information leakage) ──────────────────

export const SECURITY_MESSAGES = {
  FORGOT_PASSWORD:
    'If your email is registered and verified, you will receive a password reset link shortly.',
  RESEND_VERIFICATION:
    'If your email is registered and not yet verified, a new verification link has been sent.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  TOKEN_INVALID: 'Invalid or expired token. Please request a new one.',
} as const;
