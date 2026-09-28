# SathiGuide

SathiGuide is a travel marketplace that connects tourists with local guides for bookable experiences. This repository contains the web client, mobile client, REST API, and shared packages in a single pnpm workspace.

## Contents

- [SathiGuide](#sathiguide)
  - [Contents](#contents)
  - [Product surfaces](#product-surfaces)
  - [Why SathiGuide](#why-sathiguide)
  - [Architecture](#architecture)
  - [Prerequisites](#prerequisites)
  - [Getting started](#getting-started)
  - [Development commands](#development-commands)
  - [Environment variables](#environment-variables)
    - [Backend: `apps/backend/.env`](#backend-appsbackendenv)
    - [Web: `apps/web/.env.local`](#web-appswebenvlocal)
    - [Mobile: `apps/mobile/.env`](#mobile-appsmobileenv)
  - [Database workflow](#database-workflow)
  - [Testing and quality](#testing-and-quality)
  - [Project structure](#project-structure)
  - [Support](#support)
  - [Contributing](#contributing)
  - [Further documentation](#further-documentation)

## Product surfaces

| Surface | Technology                         | Purpose                                                                             | Local URL or command           |
| ------- | ---------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------ |
| Web     | Next.js 16, React 19, Tailwind CSS | Tourist and admin web experience                                                    | `http://localhost:3000`        |
| Mobile  | Expo 57, React Native, Expo Router | Tourist and guide mobile experience                                                 | `pnpm --filter mobile dev`     |
| API     | NestJS 11, Prisma 7, PostgreSQL    | Authentication, guides, experiences, bookings, reviews, uploads, and administration | `http://localhost:8000/api/v1` |

## Why SathiGuide

SathiGuide gives travelers and local guides a single workflow for discovering, publishing, and managing authentic travel experiences.

- **For travelers:** discover guides and experiences, manage bookings, communicate with guides, and leave reviews.
- **For guides:** create experiences, manage availability and bookings, complete verification, and track guide activity.
- **For administrators:** manage users, guide verification, reports, and platform content from the web admin area.
- **For developers:** work in one typed monorepo with shared UI and configuration, a modular API, Prisma migrations, and mobile/web clients backed by the same service layer.

## Architecture

SathiGuide is organized as a Turborepo monorepo:

- `apps/web` contains the Next.js App Router application, including the admin area.
- `apps/mobile` contains the Expo Router application with auth, tourist, guide, and shared routes.
- `apps/backend` contains the NestJS API and Prisma schema, migrations, and seed script.
- `packages/trpc` contains generated tRPC server types shared with consumers.
- `packages/ui` contains shared React UI components.
- `packages/eslint-config`, `packages/tailwind-config`, and `packages/typescript-config` provide shared tooling configuration.

The API uses PostgreSQL through Prisma, Supabase for storage, Resend for email delivery, JWT-based authentication, request validation, Helmet security headers, and throttling.

## Prerequisites

- Node.js 18 or newer
- pnpm 11 (the repository pins `pnpm@11.18.0`)
- PostgreSQL 14 or newer, or a compatible hosted PostgreSQL database
- A Supabase project for file storage
- A Google Maps API key for native Android map support

For native mobile development, also install [Android Studio](https://docs.expo.dev/workflow/android-studio-emulator/) and/or [Xcode](https://docs.expo.dev/workflow/ios-simulator/) as appropriate. Expo web does not require either native toolchain.

## Getting started

1. Clone the repository and enter the project directory.
2. Install all workspace dependencies:

   ```bash
   pnpm install
   ```

3. Create environment files from the checked-in templates:

   ```powershell
   Copy-Item apps\backend\.env.example apps\backend\.env
   Copy-Item apps\web\.env.example apps\web\.env.local
   Copy-Item apps\mobile\.env.example apps\mobile\.env
   ```

   On macOS or Linux, use `cp` instead of `Copy-Item`.

4. Replace every placeholder with real local or hosted service credentials. See [Environment variables](#environment-variables).
5. Generate the Prisma client and apply development migrations:

   ```bash
   pnpm --filter backend prisma:generate
   pnpm --filter backend prisma:migrate
   ```

6. Start the API and web client in separate terminals:

   ```bash
   pnpm --filter backend dev
   pnpm --filter web dev
   ```

   Start the mobile client in a third terminal when needed:

   ```bash
   pnpm --filter mobile dev
   ```

## Development commands

Run commands from the repository root unless noted otherwise.

| Command                        | Description                                                         |
| ------------------------------ | ------------------------------------------------------------------- |
| `pnpm dev`                     | Start the monorepo development/watch tasks configured by Turborepo. |
| `pnpm --filter web dev`        | Start Next.js on port 3000.                                         |
| `pnpm --filter backend dev`    | Start NestJS in watch mode.                                         |
| `pnpm --filter mobile dev`     | Start the Expo development server with a cleared cache.             |
| `pnpm --filter mobile web`     | Run the mobile app through Expo web.                                |
| `pnpm --filter mobile android` | Build and run the native Android app.                               |
| `pnpm --filter mobile ios`     | Build and run the native iOS app.                                   |
| `pnpm build`                   | Build all applications and packages.                                |
| `pnpm lint`                    | Run workspace lint tasks.                                           |
| `pnpm check-types`             | Run TypeScript checks across the workspace.                         |
| `pnpm format`                  | Format TypeScript and Markdown files with Prettier.                 |

## Environment variables

Environment files are intentionally untracked. Never commit passwords, private keys, service-role keys, or API tokens.

### Backend: `apps/backend/.env`

The API validates configuration at startup. At minimum, configure:

```dotenv
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DB_NAME?schema=public
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000
JWT_SECRET=replace-with-a-long-random-secret
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_SERVICE_ROLE_KEY=replace-with-your-server-only-key
SUPABASE_BUCKET_EXPERIENCE=experiences
SUPABASE_BUCKET_AVATAR=avatars
SUPABASE_BUCKET_DOCUMENT=documents
```

Optional settings include `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_ACCESS_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN_DAYS`, `RESET_TOKEN_EXPIRES_IN_MINUTES`, `VERIFICATION_TOKEN_EXPIRES_IN_MINUTES`, `MAIL_FROM_NAME`, and `MAIL_FROM_ADDRESS`. Configure the email provider settings used by the backend before testing email-dependent flows.

### Web: `apps/web/.env.local`

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Mobile: `apps/mobile/.env`

```dotenv
EXPO_PUBLIC_API_URL=http://localhost:8000/api/v1
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
GOOGLE_MAPS_API_KEY=replace-with-your-google-maps-key
```

For a physical device, `localhost` points to the device itself. Use a LAN-accessible backend URL or a tunnel such as ngrok instead.

## Database workflow

Prisma configuration lives in `apps/backend/prisma.config.ts`, with the schema and migrations under `apps/backend/prisma`.

```bash
# Generate the Prisma client
pnpm --filter backend prisma:generate

# Create/apply a development migration
pnpm --filter backend prisma:migrate

# Deploy existing migrations in production
pnpm --filter backend prisma:migrate:prod

# Inspect data locally
pnpm --filter backend prisma:studio
```

To seed the database, run the repository's configured Prisma seed entry point from `apps/backend`:

```bash
pnpm exec tsx prisma/seed.ts
```

Use `prisma:reset` only for disposable development databases because it deletes database data.

## Testing and quality

Backend tests use Jest:

```bash
pnpm --filter backend test
pnpm --filter backend test:e2e
pnpm --filter backend test:cov
```

Before opening a pull request, run:

```bash
pnpm lint
pnpm check-types
pnpm build
```

## Project structure

```text
apps/
  backend/           NestJS API, Prisma schema, migrations, and tests
  mobile/            Expo Router mobile application
  web/               Next.js web and admin application
packages/
  eslint-config/     Shared ESLint configuration
  tailwind-config/   Shared Tailwind configuration
  trpc/              Shared generated tRPC types
  typescript-config/ Shared TypeScript configuration
  ui/                Shared React UI components
```

## Support

- Report bugs or request features through [GitHub Issues](https://github.com/sulav-codes/sathi-guide/issues).
- Check the [backend README](apps/backend/README.md), [web README](apps/web/README.md), and [mobile README](apps/mobile/README.md) for app-specific details.
- Consult the official [NestJS](https://docs.nestjs.com/), [Next.js](https://nextjs.org/docs), [Expo](https://docs.expo.dev/), and [Prisma](https://www.prisma.io/docs) documentation for framework-specific questions.

## Contributing

SathiGuide is maintained by [sulav-codes](https://github.com/sulav-codes). Contributions are welcome through pull requests:

1. Create a focused branch from the current development branch.
2. Keep changes within the owning app or shared package and preserve existing public APIs.
3. Add or update tests for behavior changes.
4. Run `pnpm lint`, `pnpm check-types`, relevant tests, and `pnpm build` before opening a pull request.
5. Do not commit `.env` files, generated build output, credentials, or local database data.

## Further documentation

- [Backend documentation](apps/backend/README.md)
- [Web application](apps/web/README.md)
- [Mobile application](apps/mobile/README.md)
- [NestJS documentation](https://docs.nestjs.com/)
- [Next.js documentation](https://nextjs.org/docs)
- [Expo documentation](https://docs.expo.dev/)
- [Prisma documentation](https://www.prisma.io/docs)
