# Graph Report - .  (2026-08-03)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1809 nodes · 3713 edges · 180 communities (97 shown, 83 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.8)
- Token cost: 5,158 input · 2,058 output

## Graph Freshness
- Built from commit: `fa1d3496`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Auth Screens and Constants
- Booking Service and Mapping
- Report Management DTOs
- Core Backend Dependencies
- Review and Rating DTOs
- User Creation DTOs
- Backend Test Configuration
- Backend Dev Dependencies
- Experience Management Screens
- Experience Creation Wizard
- Core API Client
- Web Root and Environment
- Auth Controller Endpoints
- Reports Service and DTOs
- NestJS App Modules
- Auth Guards and Decorators
- Experience Image DTOs
- Guide Dashboard Screens
- Tourist Home and Layouts
- API Client Methods
- Booking Controller Logic
- File Upload DTOs
- Guide Settings and Messages
- Authentication Services
- ESLint Configuration
- Media Upload Service
- Email Notification Service
- Backend TypeScript Config
- Class Transformer Utility
- Web TypeScript Config
- Expo Mobile Dependencies
- Auth Constants and Helpers
- Mobile Auth Context
- Base TypeScript Config
- Guide Discovery Hooks
- Guide Profile Service
- Token and IP Helpers
- Claude Project Documentation
- Experience Creation DTOs
- Image Upload Utilities
- Web Package Dependencies
- Guide Profile DTOs
- Next.js TypeScript Config
- Gemini Project Documentation
- Login and Device DTOs
- User Registration DTOs
- Experience Response DTOs
- Mobile Dev Dependencies
- User Response DTOs
- Experience Management Service
- Guide Management Service
- Mobile Package Config
- Mobile TypeScript Config
- Root Project Configuration
- Availability and Blocked Periods
- Guide Response DTOs
- Backend Documentation
- tRPC Package Config
- Admin Module and Service
- Experience Query DTOs
- Guide Verification DTOs
- Mock Data and Types
- TypeScript Language
- Environment Config Validation
- Guide List Query DTOs
- Project Reset Script
- Monorepo Documentation
- Pending Guide Queries
- Build TypeScript Config
- React DOM Library
- Password Management DTOs
- Report Query DTOs
- Experience Service and Mapping
- Web Linting Config
- Shared TS Config Package
- NestJS CLI Config
- Expo Font Utility
- My Reports Query DTOs
- Experience Status DTOs
- External Link Component
- Mobile App Documentation
- Prisma and Cron Services
- Metro Bundler Config
- Database Seed Script
- Mobile Linting Config
- User Profile DTO
- Booking Data Entity
- Supabase Configuration
- Experience Data Entity
- Guide Data Entity
- Report Data Entity
- Review Data Entity
- User Data Entity
- Password Strength Component
- Expo Constants Utility
- React Library TS Config
- App Entry Point
- Expo Linking Utility
- Splash Screen Configuration
- SF Symbols Integration
- Expo UI Components
- Vector Icons Library
- NativeWind Styling
- React Core
- Map Integration
- Reanimated Animations
- Web Deployment Documentation
- Worklets Runtime
- Next.js Configuration
- Health Check Controller
- Data Validation
- Security Middleware
- NestJS Core Modules
- Environment Configuration
- JWT Authentication
- Type Mapping Utilities
- Passport Integration
- Express Platform Adapter
- Task Scheduling
- Prettier Linting Rules
- Rate Limiting
- NestJS TRPC Integration
- Authentication Middleware
- Passport JWT Strategy
- Prisma Client
- Metadata Reflection
- Email Delivery
- Reactive Extensions
- Supabase Client
- UUID Generation
- Schema Validation
- Health Checks
- ESLint Configuration
- ESLint JavaScript Rules
- Prettier Linting Plugin
- Global Environment Variables
- NestJS CLI Tools
- NestJS Testing Utilities
- Code Formatting
- ORM Database Schema
- Source Map Debugging
- Integration Testing
- Jest TypeScript Transformer
- TypeScript Webpack Loader
- TypeScript Execution Engine
- TSConfig Path Mapping
- Express Type Definitions
- Jest Type Definitions
- Node.js Type Definitions
- Passport JWT Types
- Supertest Type Definitions
- TypeScript ESLint Tooling
- Image Picker Module
- Location Services
- Metro Bundler Runtime
- Expo File Routing
- Secure Data Storage
- In-App Browser
- React Native Core
- Native Screen Management
- React Native Web
- Server State Management
- Turborepo Linting Config

## God Nodes (most connected - your core abstractions)
1. `Colors` - 70 edges
2. `JwtPayload` - 59 edges
3. `CurrentUser` - 56 edges
4. `PrismaService` - 53 edges
5. `ApiClient` - 51 edges
6. `Roles()` - 44 edges
7. `IconSymbol()` - 38 edges
8. `ThemedText()` - 30 edges
9. `TokenService` - 27 edges
10. `MailService` - 27 edges

## Surprising Connections (you probably didn't know these)
- `TabLayout()` --indirect_call--> `HapticTab()`  [INFERRED]
  apps/mobile/src/app/(guide)/(tabs)/_layout.tsx → apps/mobile/src/components/haptic-tab.tsx
- `TabLayout()` --indirect_call--> `HapticTab()`  [INFERRED]
  apps/mobile/src/app/(tourist)/(tabs)/_layout.tsx → apps/mobile/src/components/haptic-tab.tsx
- `TopExpCard()` --calls--> `getMediaUrl()`  [EXTRACTED]
  apps/mobile/src/app/(tourist)/experience/guide/[id].tsx → apps/mobile/src/lib/media.ts
- `Props` --references--> `Colors`  [EXTRACTED]
  apps/mobile/src/components/CounterControl.tsx → apps/mobile/src/constants/theme.ts
- `Props` --references--> `Colors`  [EXTRACTED]
  apps/mobile/src/components/LanguageChip.tsx → apps/mobile/src/constants/theme.ts

## Import Cycles
- None detected.

## Communities (180 total, 83 thin omitted)

### Community 0 - "Auth Screens and Constants"
Cohesion: 0.11
Nodes (29): ACCOUNT_TYPES, AccountType, EXPERIENCE_OPTIONS, EXPERIENCE_YEARS_MAP, GENDER_OPTIONS, LANGUAGE_OPTIONS, LanguageOption, SignupScreen() (+21 more)

### Community 1 - "Booking Service and Mapping"
Cohesion: 0.07
Nodes (42): BookingWithRelations, BOOKING_FULL_INCLUDE, BookingsService, Injectable, BookingExperienceResponseDto, BookingGuideResponseDto, BookingListResponseDto, BookingPricingSnapshotResponseDto (+34 more)

### Community 2 - "Report Management DTOs"
Cohesion: 0.15
Nodes (14): CreateReportDto, IsEnum, IsOptional, IsString, IsUUID, DismissReportDto, ResolveReportDto, IsEnum (+6 more)

### Community 3 - "Core Backend Dependencies"
Cohesion: 0.29
Nodes (7): dependencies, argon2, @nestjs/core, @prisma/adapter-pg, argon2, @nestjs/core, @prisma/adapter-pg

### Community 4 - "Review and Rating DTOs"
Cohesion: 0.07
Nodes (33): CanReviewCheckDto, CreateReviewDto, IsInt, IsOptional, IsString, IsUUID, Max, Min (+25 more)

### Community 5 - "User Creation DTOs"
Cohesion: 0.05
Nodes (52): CreateUserDto, CreateUserWithProfileDto, IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber (+44 more)

### Community 6 - "Backend Test Configuration"
Cohesion: 0.05
Nodes (40): author, description, jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment (+32 more)

### Community 7 - "Backend Dev Dependencies"
Cohesion: 0.29
Nodes (7): devDependencies, eslint, jest, @nestjs/schematics, eslint, jest, @nestjs/schematics

### Community 8 - "Experience Management Screens"
Cohesion: 0.13
Nodes (19): EditExperienceScreen(), MyExperiencesScreen(), BookingScreen(), ExperienceDetailScreen(), CounterControl(), Props, Props, SectionHeader() (+11 more)

### Community 9 - "Experience Creation Wizard"
Cohesion: 0.20
Nodes (17): ExperienceWizard(), ExperienceWizardProps, StepBasicInfo(), DIFFICULTIES, StepDetails(), StepImages(), DEFAULT_REGION, StepLocation() (+9 more)

### Community 11 - "Web Root and Environment"
Cohesion: 0.06
Nodes (31): geistMono, geistSans, metadata, ^build, ^check-types, DATABASE_URL, .env*, ^lint (+23 more)

### Community 12 - "Auth Controller Endpoints"
Cohesion: 0.21
Nodes (14): AuthController, Body, Controller, Get, HttpCode, Post, Query, UseGuards (+6 more)

### Community 13 - "Reports Service and DTOs"
Cohesion: 0.22
Nodes (10): ReportListResponseDto, ReportReporterResponseDto, ReportResolutionResponseDto, ReportResponseDto, ReportTargetUserResponseDto, Exclude, Expose, Type (+2 more)

### Community 14 - "NestJS App Modules"
Cohesion: 0.12
Nodes (19): AuthModule, Module, BookingsModule, Module, ExperiencesModule, Module, GuidesModule, Module (+11 more)

### Community 15 - "Auth Guards and Decorators"
Cohesion: 0.23
Nodes (4): JwtAuthGuard, Injectable, RolesGuard, Injectable

### Community 16 - "Experience Image DTOs"
Cohesion: 0.18
Nodes (14): AddExperienceImageDto, ArrayMinSize, IsArray, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional (+6 more)

### Community 17 - "Guide Dashboard Screens"
Cohesion: 0.10
Nodes (31): LoginScreen(), BookingActionsWrapper(), BookingListItem(), BookingRequestItem(), getStatusColor(), GuideBookingsScreen(), GuideDashboard(), ProfileScreen() (+23 more)

### Community 18 - "Tourist Home and Layouts"
Cohesion: 0.11
Nodes (20): HomeScreen(), CategoryItem(), Props, ExperienceCard(), Props, ExperienceCardSkeleton(), DIFFICULTIES, ExperienceForm() (+12 more)

### Community 19 - "API Client Methods"
Cohesion: 0.05
Nodes (23): BookingExperienceResponse, BookingGuideResponse, BookingPricingSnapshotResponse, BookingResponse, BookingStateLogEntry, BookingStatus, BookingTouristResponse, Currency (+15 more)

### Community 20 - "Booking Controller Logic"
Cohesion: 0.06
Nodes (64): BookingsController, Body, Controller, Get, HttpCode, Param, Patch, Post (+56 more)

### Community 21 - "File Upload DTOs"
Cohesion: 0.20
Nodes (13): ConfirmUploadDto, RequestPresignedUrlDto, IsEnum, IsNotEmpty, IsOptional, IsString, ConfirmUploadResponseDto, PresignedUrlResponseDto (+5 more)

### Community 22 - "Guide Settings and Messages"
Cohesion: 0.12
Nodes (7): TabLayout(), TabLayout(), HapticTab(), HapticTabProps, styles, IconSymbol(), MaterialIconName

### Community 23 - "Authentication Services"
Cohesion: 0.10
Nodes (9): AuthService, createId, Injectable, createId, TokenService, Injectable, generateOpaqueToken(), sha256Hash() (+1 more)

### Community 24 - "ESLint Configuration"
Cohesion: 0.06
Nodes (31): eslint-plugin-only-warn, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-turbo, @next/eslint-plugin-next, devDependencies, eslint, eslint-config-prettier (+23 more)

### Community 25 - "Media Upload Service"
Cohesion: 0.24
Nodes (4): UploadPurpose, Injectable, UploadsService, Cron

### Community 27 - "Backend TypeScript Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, incremental (+13 more)

### Community 29 - "Web TypeScript Config"
Cohesion: 0.14
Nodes (13): compilerOptions, plugins, strictNullChecks, exclude, extends, include, node_modules, **/*.ts (+5 more)

### Community 30 - "Expo Mobile Dependencies"
Cohesion: 0.10
Nodes (21): dependencies, expo, expo-dev-client, expo-file-system, expo-haptics, expo-image, expo-image-manipulator, expo-status-bar (+13 more)

### Community 31 - "Auth Constants and Helpers"
Cohesion: 0.15
Nodes (15): RefreshTokenMetadata, ARGON2_OPTIONS, REVOKE_REASON, RevokeReason, SECURITY_MESSAGES, SELF_REGISTERABLE_ROLES, hashWithArgon2(), AppConfig (+7 more)

### Community 32 - "Mobile Auth Context"
Cohesion: 0.12
Nodes (19): queryClient, unstable_settings, AuthContext, AuthContextType, AuthProvider(), clearTokens(), isValidRole(), sanitizeUser() (+11 more)

### Community 33 - "Base TypeScript Config"
Cohesion: 0.10
Nodes (19): compilerOptions, declaration, declarationMap, esModuleInterop, incremental, isolatedModules, lib, module (+11 more)

### Community 34 - "Guide Discovery Hooks"
Cohesion: 0.19
Nodes (8): GuideProfileScreen(), TopExpCard(), ExploreScreen(), LanguageChip(), Props, useExperiences(), guideKeys, useGuide()

### Community 35 - "Guide Profile Service"
Cohesion: 0.16
Nodes (4): GuideListResponseDto, GuideReviewStats, GuidesService, Injectable

### Community 36 - "Token and IP Helpers"
Cohesion: 0.18
Nodes (5): AuthTokensDto, Exclude, Expose, extractIpAddress(), extractUserAgent()

### Community 37 - "Claude Project Documentation"
Cohesion: 0.18
Nodes (9): Architecture, Backend (`apps/backend`), Code Style, Commands, Database (Prisma Schema), graphify, Mobile (`apps/mobile`), Packages (`packages/`) (+1 more)

### Community 38 - "Experience Creation DTOs"
Cohesion: 0.19
Nodes (15): CreateExperienceDto, CreateLocationDto, CreatePricingRuleDto, ArrayMinSize, IsArray, IsEnum, IsInt, IsNumber (+7 more)

### Community 39 - "Image Upload Utilities"
Cohesion: 0.17
Nodes (13): ImageUploadPicker(), ImageUploadPickerProps, ApiConfig, ApiError, COMPRESSION_CONFIG, CompressionConfig, compressToTarget(), getFileSize() (+5 more)

### Community 40 - "Web Package Dependencies"
Cohesion: 0.06
Nodes (32): dependencies, next, react, react-dom, devDependencies, eslint, @repo/eslint-config, @repo/typescript-config (+24 more)

### Community 41 - "Guide Profile DTOs"
Cohesion: 0.20
Nodes (14): CreateGuideExpertiseDto, CreateGuideProfileDto, CreateLocationDto, ArrayMinSize, IsArray, IsDateString, IsEnum, IsNumber (+6 more)

### Community 42 - "Next.js TypeScript Config"
Cohesion: 0.18
Nodes (10): compilerOptions, allowJs, jsx, module, moduleResolution, noEmit, plugins, extends (+2 more)

### Community 43 - "Gemini Project Documentation"
Cohesion: 0.18
Nodes (9): Architecture, Backend (`apps/backend`), Code Style, Commands, Database (Prisma Schema), graphify, Mobile (`apps/mobile`), Packages (`packages/`) (+1 more)

### Community 44 - "Login and Device DTOs"
Cohesion: 0.16
Nodes (12): DeviceInfoDto, IsOptional, IsString, MaxLength, LoginDto, IsEmail, IsNotEmpty, IsOptional (+4 more)

### Community 45 - "User Registration DTOs"
Cohesion: 0.15
Nodes (12): RegisterDto, IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString (+4 more)

### Community 46 - "Experience Response DTOs"
Cohesion: 0.30
Nodes (12): ExperienceCategoryResponseDto, ExperienceGuideResponseDto, ExperienceImageResponseDto, ExperienceListItemDto, ExperienceListResponseDto, ExperienceLocationResponseDto, ExperiencePricingRuleResponseDto, MyExperienceListItemDto (+4 more)

### Community 47 - "Mobile Dev Dependencies"
Cohesion: 0.13
Nodes (15): devDependencies, babel-preset-expo, eslint, eslint-config-expo, prettier-plugin-tailwindcss, tailwindcss, @types/react, typescript (+7 more)

### Community 48 - "User Response DTOs"
Cohesion: 0.20
Nodes (7): LoginResponseDto, Exclude, Expose, Type, SafeUserDto, Exclude, Expose

### Community 49 - "Experience Management Service"
Cohesion: 0.29
Nodes (3): ExperienceDetailResponseDto, ExperiencesService, Injectable

### Community 50 - "Guide Management Service"
Cohesion: 0.30
Nodes (5): GuideSortBy, SortOrder, UpdateGuideProfileDto, GuideDetailWithRelations, GuideWithRelations

### Community 51 - "Mobile Package Config"
Cohesion: 0.17
Nodes (11): main, name, private, scripts, android, dev, ios, lint (+3 more)

### Community 52 - "Mobile TypeScript Config"
Cohesion: 0.17
Nodes (11): compilerOptions, paths, strict, extends, include, **/*.ts, **/*.tsx, expo-env.d.ts (+3 more)

### Community 53 - "Root Project Configuration"
Cohesion: 0.11
Nodes (18): devDependencies, prettier, turbo, typescript, engines, node, prettier, turbo (+10 more)

### Community 54 - "Availability and Blocked Periods"
Cohesion: 0.33
Nodes (9): CreateAvailabilityDto, CreateBlockedPeriodDto, RecurrenceType, IsDateString, IsEnum, IsOptional, IsString, UpdateAvailabilityDto (+1 more)

### Community 55 - "Guide Response DTOs"
Cohesion: 0.45
Nodes (10): GuideDetailResponseDto, GuideExpertiseResponseDto, GuideListItemDto, GuideLocationResponseDto, GuidePrivateProfileDto, GuideReviewSummaryDto, PendingGuideResponseDto, Exclude (+2 more)

### Community 56 - "Backend Documentation"
Cohesion: 0.20
Nodes (9): Compile and run the project, Deployment, Description, License, Project setup, Resources, Run tests, Stay in touch (+1 more)

### Community 57 - "tRPC Package Config"
Cohesion: 0.18
Nodes (10): zod, main, name, peerDependencies, @trpc/server, zod, private, types (+2 more)

### Community 58 - "Admin Module and Service"
Cohesion: 0.31
Nodes (6): AdminController, Controller, AdminModule, Module, AdminService, Injectable

### Community 59 - "Experience Query DTOs"
Cohesion: 0.20
Nodes (10): ExperienceListQueryDto, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max (+2 more)

### Community 60 - "Guide Verification DTOs"
Cohesion: 0.24
Nodes (7): RejectGuideDto, IsArray, IsEnum, IsOptional, IsString, IsUUID, VerifyGuideDto

### Community 61 - "Mock Data and Types"
Cohesion: 0.20
Nodes (9): BOOKING_DATES, CATEGORIES, EXPERIENCES, GUIDE, INCLUSIONS, TOP_EXPERIENCES, Experience, Guide (+1 more)

### Community 63 - "Environment Config Validation"
Cohesion: 0.17
Nodes (11): Environment, EnvironmentVariables, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max (+3 more)

### Community 64 - "Guide List Query DTOs"
Cohesion: 0.22
Nodes (9): GuideListQueryDto, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min (+1 more)

### Community 65 - "Project Reset Script"
Cohesion: 0.22
Nodes (7): exampleDirPath, fs, oldDirs, path, readline, rl, root

### Community 66 - "Monorepo Documentation"
Cohesion: 0.20
Nodes (9): Apps and Packages, Build, Develop, Remote Caching, Turborepo starter, Useful Links, Using this example, Utilities (+1 more)

### Community 67 - "Pending Guide Queries"
Cohesion: 0.25
Nodes (7): PendingGuidesQueryDto, IsEnum, IsInt, IsOptional, Max, Min, Type

### Community 68 - "Build TypeScript Config"
Cohesion: 0.25
Nodes (7): exclude, extends, dist, node_modules, **/*spec.ts, test, ./tsconfig.json

### Community 70 - "Password Management DTOs"
Cohesion: 0.09
Nodes (21): ChangePasswordDto, IsNotEmpty, IsString, Matches, MaxLength, MinLength, ForgotPasswordDto, IsEmail (+13 more)

### Community 71 - "Report Query DTOs"
Cohesion: 0.29
Nodes (7): AllReportsQueryDto, IsEnum, IsInt, IsOptional, Max, Min, Type

### Community 72 - "Experience Service and Mapping"
Cohesion: 0.29
Nodes (7): CreateDraftExperienceDto, IsNotEmpty, IsString, ExperienceSortBy, SortOrder, ExperienceDetailWithRelations, ExperienceWithRelations

### Community 73 - "Web Linting Config"
Cohesion: 0.43
Nodes (3): config, nextJsConfig, config

### Community 74 - "Shared TS Config Package"
Cohesion: 0.29
Nodes (6): license, name, private, publishConfig, access, version

### Community 75 - "NestJS CLI Config"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 77 - "My Reports Query DTOs"
Cohesion: 0.33
Nodes (6): MyReportsQueryDto, IsInt, IsOptional, Max, Min, Type

### Community 78 - "Experience Status DTOs"
Cohesion: 0.40
Nodes (4): IsEnum, IsOptional, IsString, UpdateExperienceStatusDto

### Community 80 - "Mobile App Documentation"
Cohesion: 0.33
Nodes (5): Get a fresh project, Get started, Join the community, Learn more, Welcome to your Expo app 👋

### Community 81 - "Prisma and Cron Services"
Cohesion: 0.13
Nodes (6): JwtStrategy, Injectable, PrismaService, Injectable, Injectable, UploadsCronService

### Community 82 - "Metro Bundler Config"
Cohesion: 0.50
Nodes (3): config, { getDefaultConfig }, { withNativeWind }

### Community 93 - "Password Strength Component"
Cohesion: 0.33
Nodes (4): PASSWORD_CHECKS, STRENGTH_CONFIG, StrengthLevel, StrengthProps

### Community 95 - "React Library TS Config"
Cohesion: 0.33
Nodes (5): compilerOptions, jsx, extends, ./base.json, $schema

### Community 106 - "Web Deployment Documentation"
Cohesion: 0.50
Nodes (3): Deploy on Vercel, Getting Started, Learn More

### Community 122 - "Health Check Controller"
Cohesion: 0.25
Nodes (5): HealthController, Controller, Get, HealthCheck, SerializeOptions

## Knowledge Gaps
- **435 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+430 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **83 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `PrismaService` connect `Prisma and Cron Services` to `Booking Service and Mapping`, `Report Management DTOs`, `Guide Profile Service`, `Review and Rating DTOs`, `User Creation DTOs`, `Experience Service and Mapping`, `Reports Service and DTOs`, `NestJS App Modules`, `Auth Guards and Decorators`, `Experience Management Service`, `Guide Management Service`, `File Upload DTOs`, `Authentication Services`, `Health Check Controller`, `Guide Verification DTOs`, `Auth Constants and Helpers`?**
  _High betweenness centrality (0.055) - this node is a cross-community bridge._
- **Why does `JwtPayload` connect `Booking Controller Logic` to `Report Management DTOs`, `User Creation DTOs`, `Password Management DTOs`, `Auth Controller Endpoints`, `Auth Guards and Decorators`, `Auth Constants and Helpers`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `CurrentUser` connect `Booking Controller Logic` to `Report Management DTOs`, `User Creation DTOs`, `Password Management DTOs`, `Auth Controller Endpoints`, `Auth Guards and Decorators`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _435 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Auth Screens and Constants` be split into smaller, more focused modules?**
  _Cohesion score 0.11025641025641025 - nodes in this community are weakly interconnected._
- **Should `Booking Service and Mapping` be split into smaller, more focused modules?**
  _Cohesion score 0.06663141195134849 - nodes in this community are weakly interconnected._
- **Should `Report Management DTOs` be split into smaller, more focused modules?**
  _Cohesion score 0.14855072463768115 - nodes in this community are weakly interconnected._