# GEMINI.md

This file provides guidance to Gemini (e.g., via Gemini Code Assist, Gemini API, or related AI coding agents) when working with code in this repository.

## Commands

```sh
# Root (monorepo)
pnpm dev              # Start all apps in watch mode
pnpm build            # Build all apps
pnpm lint             # Lint all apps
pnpm check-types      # Type-check all apps
pnpm format           # Format with Prettier

# Backend (apps/backend)
pnpm --filter backend dev                  # Start backend in watch mode
pnpm --filter backend build                # Build backend
pnpm --filter backend test                 # Run unit tests
pnpm --filter backend test:e2e             # Run E2E tests
pnpm --filter backend test -- --testPathPattern=experiences  # Run single test file
pnpm --filter backend prisma:migrate       # Run dev migrations
pnpm --filter backend prisma:migrate:prod  # Deploy migrations
pnpm --filter backend prisma:generate      # Re-generate Prisma client
pnpm --filter backend prisma:studio        # Open Prisma Studio
pnpm --filter backend prisma:seed          # Seed database

# Mobile (apps/mobile)
pnpm --filter mobile dev     # Start Expo dev (--go mode)
pnpm --filter mobile web     # Start Expo web
pnpm --filter mobile android # Start Expo Android
pnpm --filter mobile ios     # Start Expo iOS

```

## Architecture

**Monorepo** with pnpm workspaces and Turborepo. Two active apps: a NestJS backend and Expo (React Native) mobile app.

### Backend (`apps/backend`)

NestJS REST API at `/api/v1` with PostgreSQL (Prisma ORM). Modular structure mirroring bounded contexts:

| Module | Domain |
| --- | --- |
| `auth` | Registration, login, JWT rotation, email/phone verification, password reset |
| `users` | User profile CRUD, admin/user management |
| `guides` | GuideProfile, verification workflow, expertise categories, location |
| `experiences` | Experience CRUD, categories, pricing rules, availability scheduling |
| `bookings` | Booking lifecycle (pending → confirmed → completed/cancelled), state machine, availability locking |
| `reviews` | Ratings (1-5 on multiple dimensions), guide responses, moderation |
| `reports` | Content/moderation reports with resolution workflow |
| `admin` | Admin-only endpoints |
| `uploads` | Presigned URL generation for file uploads (Supabase S3-compatible storage) |
| `prisma` | Prisma service module (global provider) |
| `health` | Health check endpoint |
| `mail` | Email delivery via Resend |

Key backend patterns:

* Config validated at startup via Zod (`config.validation.ts`), loaded as NestJS config modules
* JWT auth with refresh token rotation (family-based invalidation for theft detection)
* Rate limiting via `@nestjs/throttler` (configurable TTL/limit)
* tRPC base path at `/trpc` (via `nestjs-trpc`)
* Soft delete (deletedAt) on User model

### Mobile (`apps/mobile`)

Expo SDK 57 with Expo Router file-based routing and NativeWind (TailwindCSS).

Route groups:

* `(auth)` — Login, signup, forgot password, email verification
* `(tourist)` — Tab layout: home, explore, bookings, messages, profile
* `(guide)` — Tab layout: home (dashboard), bookings, messages, profile; plus experiences management, earnings, verification

Data layer:

* `lib/api.ts` — `ApiClient` class wrapping `fetch` with automatic JWT refresh on 401
* `context/AuthContext.tsx` — Auth state provider (stores tokens in SecureStore)
* `hooks/` — Custom hooks (React Query wrappers, form state)
* `@tanstack/react-query` for server state management

### Packages (`packages/`)

* `typescript-config` — Shared TypeScript configs
* `eslint-config` — Shared ESLint config
* `trpc` — tRPC server type definitions (generated from backend)

### Database (Prisma Schema)

PostgreSQL with 9 bounded contexts defined in `apps/backend/prisma/schema.prisma`:

1. **Identity & Auth** — User, RefreshToken (family-based rotation), PasswordResetToken, EmailVerificationToken, DeviceToken, UserBan
2. **Guide Domain** — GuideProfile, GuideVerification (append-only audit), GuideIDDocument, GuideLocation, GuideExpertise, GuideBlockedPeriod, AvailabilityLock
3. **Experience Domain** — Experience (with status workflow: DRAFT→PUBLISHED→ARCHIVED), ExperienceImage, ExperiencePricingRule (versioned), ExperienceAvailability
4. **Booking & Commerce** — Booking, BookingPricingSnapshot (immutable), BookingStateLog (append-only)
5. **Payment** — Payment, PaymentStateLog, PromoCode, PromoCodeUsage
6. **Review & Moderation** — Review (1:1 with Booking), ReviewAuditLog, ReviewReport
7. **Communication** — Conversation, ConversationParticipant, Message, MessageAttachment
8. **Notifications** — Notification (string type, not enum — avoids migration cost)
9. **Platform Administration** — PlatformConfig, AuditLog (append-only)

Shared infrastructure models: Media (S3 references), Location (single source of truth, used polymorphically), Category (taxonomy).

### Code Style

* TypeScript throughout, strict mode
* NestJS decorators for controllers/services/modules
* DTOs with class-validator for input validation
* Prisma-generated types in `src/generated/prisma`
* Arrow functions preferred for components, async/await for services
* Mobile: functional React components with hooks, named exports

## graphify

This project has a knowledge graph at `graphify-out/` with god nodes, community structure, and cross-file relationships.

Rules:

* For codebase questions, first run `graphify query "<question>"` when `graphify-out/graph.json` exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than `GRAPH_REPORT.md` or raw grep output.
* If `graphify-out/wiki/index.md` exists, use it for broad navigation instead of raw source browsing.
* Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when query/path/explain do not surface enough context.
* After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Preferred Work Style

* Clarify assumptions when requirements are ambiguous (but don’t stall on trivial details).
* Make the smallest change that solves the problem.
* Preserve existing public APIs unless explicitly asked to change them.
* If touching auth/booking/payment state, ensure state transitions and logs remain correct and append-only where applicable.