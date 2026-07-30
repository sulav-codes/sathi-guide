# Graph Report - C:\Users\LEGION\Desktop\sathi-guide  (2026-07-29)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1693 nodes · 3509 edges · 122 communities (94 shown, 28 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 8 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `19eae675`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Colors
- bookings.service.ts
- reports.service.ts
- dependencies
- reviews.service.ts
- users.controller.ts
- scripts
- devDependencies
- use-experiences.ts
- use-color-scheme.ts
- ApiClient
- tasks
- AuthController
- CreateUserWithProfileDto
- app.module.ts
- JwtPayload
- expo
- (guide)/(tabs)/home.tsx
- (tourist)/(tabs)/home.tsx
- types/api.ts
- Roles
- uploads.service.ts
- icon-symbol.tsx
- TokenService
- devDependencies
- CurrentUser
- MailService
- compilerOptions
- PrismaService
- include
- dependencies
- token.service.ts
- AuthContext.tsx
- compilerOptions
- ExperiencesController
- GuidesService
- auth.service.ts
- ReviewsController
- CreateExperienceDto
- lib/api.ts
- devDependencies
- CreateGuideProfileDto
- compilerOptions
- MessageResponseDto
- LoginDto
- RegisterDto
- experience-response.dto.ts
- devDependencies
- LoginResponseDto
- ExperiencesService
- guides.service.ts
- mobile/package.json
- include
- package.json
- CreateBlockedPeriodDto
- guide-response.dto.ts
- web/package.json
- trpc/package.json
- admin.module.ts
- ExperienceListQueryDto
- VerifyGuideDto
- data/index.ts
- typescript
- EnvironmentVariables
- GuideListQueryDto
- reset-project.js
- eslint-config/package.json
- PendingGuidesQueryDto
- .dismiss
- dependencies
- ChangePasswordDto
- ResetPasswordDto
- experiences.service.ts
- next.js
- typescript-config/package.json
- nest-cli.json
- app/_layout.tsx
- useAuth
- UpdateExperienceStatusDto
- external-link.tsx
- (tourist)/(tabs)/bookings.tsx
- auth.module.ts
- metro.config.js
- seed.ts
- mobile/eslint.config.js
- get-me.dto.ts
- booking.entity.ts
- supabase.config.ts
- experience.entity.ts
- guide.entity.ts
- report.entity.ts
- review.entity.ts
- user.entity.ts
- expo
- expo-constants
- expo-dev-client
- expo-haptics
- expo-linking
- expo-splash-screen
- expo-symbols
- @expo/ui
- @expo/vector-icons
- nativewind
- react
- react-native-maps
- react-native-reanimated
- react-native-safe-area-context
- react-native-worklets
- next.config.js

## God Nodes (most connected - your core abstractions)
1. `Colors` - 69 edges
2. `JwtPayload` - 52 edges
3. `CurrentUser` - 49 edges
4. `PrismaService` - 47 edges
5. `ApiClient` - 42 edges
6. `Roles()` - 38 edges
7. `IconSymbol()` - 37 edges
8. `expo-router` - 31 edges
9. `ThemedText()` - 29 edges
10. `TokenService` - 27 edges

## Surprising Connections (you probably didn't know these)
- `TabLayout()` --indirect_call--> `HapticTab()`  [INFERRED]
  apps/mobile/src/app/(guide)/(tabs)/_layout.tsx → apps/mobile/src/components/haptic-tab.tsx
- `TabLayout()` --indirect_call--> `HapticTab()`  [INFERRED]
  apps/mobile/src/app/(tourist)/(tabs)/_layout.tsx → apps/mobile/src/components/haptic-tab.tsx
- `Props` --references--> `Colors`  [EXTRACTED]
  apps/mobile/src/components/ExperienceCardSkeleton.tsx → apps/mobile/src/constants/theme.ts
- `Props` --references--> `Colors`  [EXTRACTED]
  apps/mobile/src/components/SectionHeader.tsx → apps/mobile/src/constants/theme.ts
- `AuthService` --references--> `TokenConfig`  [EXTRACTED]
  apps/backend/src/auth/auth.service.ts → apps/backend/src/common/types/config.types.ts

## Import Cycles
- None detected.

## Communities (122 total, 28 thin omitted)

### Community 0 - "Colors"
Cohesion: 0.08
Nodes (39): ACCOUNT_TYPES, AccountType, EXPERIENCE_OPTIONS, EXPERIENCE_YEARS_MAP, GENDER_OPTIONS, LANGUAGE_OPTIONS, LanguageOption, SignupScreen() (+31 more)

### Community 1 - "bookings.service.ts"
Cohesion: 0.07
Nodes (42): BookingWithRelations, BOOKING_FULL_INCLUDE, BookingsService, Injectable, BookingExperienceResponseDto, BookingGuideResponseDto, BookingListResponseDto, BookingPricingSnapshotResponseDto (+34 more)

### Community 2 - "reports.service.ts"
Cohesion: 0.06
Nodes (42): AllReportsQueryDto, IsEnum, IsInt, IsOptional, Max, Min, Type, CreateReportDto (+34 more)

### Community 3 - "dependencies"
Cohesion: 0.04
Nodes (49): dependencies, argon2, class-transformer, class-validator, helmet, @nestjs/common, @nestjs/config, @nestjs/core (+41 more)

### Community 4 - "reviews.service.ts"
Cohesion: 0.08
Nodes (32): CanReviewCheckDto, CreateReviewDto, IsInt, IsOptional, IsString, IsUUID, Max, Min (+24 more)

### Community 5 - "users.controller.ts"
Cohesion: 0.09
Nodes (25): DeleteAccountDto, IsNotEmpty, IsString, MaxLength, IsNotEmpty, IsString, UpdateAvatarDto, AdminProfileResponseDto (+17 more)

### Community 6 - "scripts"
Cohesion: 0.05
Nodes (40): author, description, jest, collectCoverageFrom, coverageDirectory, moduleFileExtensions, rootDir, testEnvironment (+32 more)

### Community 7 - "devDependencies"
Cohesion: 0.05
Nodes (37): devDependencies, @eslint/eslintrc, eslint-plugin-prettier, jest, @nestjs/cli, @nestjs/schematics, @nestjs/testing, prettier (+29 more)

### Community 8 - "use-experiences.ts"
Cohesion: 0.12
Nodes (24): EditExperienceScreen(), MyExperiencesScreen(), BookingRequestItem(), ProfileScreen(), BookingScreen(), GuideProfileScreen(), TopExpCard(), ExperienceDetailScreen() (+16 more)

### Community 9 - "use-color-scheme.ts"
Cohesion: 0.14
Nodes (22): CreateExperienceScreen(), HomeScreen(), ExperienceWizard(), ExperienceWizardProps, StepBasicInfo(), StepDetails(), DEFAULT_REGION, StepLocation() (+14 more)

### Community 11 - "tasks"
Cohesion: 0.06
Nodes (31): geistMono, geistSans, metadata, ^build, ^check-types, DATABASE_URL, .env*, ^lint (+23 more)

### Community 12 - "AuthController"
Cohesion: 0.12
Nodes (17): AuthController, Body, Controller, Get, HttpCode, Post, Query, UseGuards (+9 more)

### Community 13 - "CreateUserWithProfileDto"
Cohesion: 0.09
Nodes (26): CreateUserDto, CreateUserWithProfileDto, IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber (+18 more)

### Community 14 - "app.module.ts"
Cohesion: 0.11
Nodes (19): AppModule, Module, BookingsModule, Module, Environment, validateConfig(), ExperiencesModule, Module (+11 more)

### Community 15 - "JwtPayload"
Cohesion: 0.20
Nodes (8): IsNotEmpty, IsString, VerifyEmailDto, JwtAuthGuard, Injectable, RolesGuard, Injectable, JwtPayload

### Community 16 - "expo"
Cohesion: 0.07
Nodes (27): backgroundColor, foregroundImage, adaptiveIcon, package, predictiveBackGestureEnabled, projectId, reactCompiler, typedRoutes (+19 more)

### Community 17 - "(guide)/(tabs)/home.tsx"
Cohesion: 0.14
Nodes (19): BookingActionsWrapper(), BookingListItem(), getStatusColor(), GuideBookingsScreen(), GuideDashboard(), VerificationScreen(), BookingDetailScreen(), getStatusColor() (+11 more)

### Community 18 - "(tourist)/(tabs)/home.tsx"
Cohesion: 0.13
Nodes (17): ExploreScreen(), CategoryItem(), Props, ExperienceCard(), Props, ExperienceCardSkeleton(), Props, ParallaxScrollView() (+9 more)

### Community 19 - "types/api.ts"
Cohesion: 0.08
Nodes (24): BookingExperienceResponse, BookingGuideResponse, BookingPricingSnapshotResponse, BookingResponse, BookingStateLogEntry, BookingStatus, BookingTouristResponse, CreateBookingDto (+16 more)

### Community 20 - "Roles"
Cohesion: 0.25
Nodes (12): Roles(), GuidesController, Body, Controller, Delete, Get, HttpCode, Param (+4 more)

### Community 21 - "uploads.service.ts"
Cohesion: 0.13
Nodes (16): ConfirmUploadDto, RequestPresignedUrlDto, IsEnum, IsNotEmpty, IsString, UploadPurpose, Body, Controller (+8 more)

### Community 22 - "icon-symbol.tsx"
Cohesion: 0.14
Nodes (7): TabLayout(), TabLayout(), HapticTab(), HapticTabProps, IconSymbol(), MaterialIconName, expo-router

### Community 23 - "TokenService"
Cohesion: 0.13
Nodes (8): createId, createId, TokenService, Injectable, generateOpaqueToken(), hashWithArgon2(), sha256Hash(), verifyArgon2()

### Community 24 - "devDependencies"
Cohesion: 0.09
Nodes (23): eslint-config-prettier, @eslint/js, globals, typescript-eslint, eslint-config-prettier, @eslint/js, globals, typescript-eslint (+15 more)

### Community 25 - "CurrentUser"
Cohesion: 0.21
Nodes (12): BookingsController, Body, Controller, Get, HttpCode, Param, Patch, Post (+4 more)

### Community 27 - "compilerOptions"
Cohesion: 0.09
Nodes (21): compilerOptions, allowSyntheticDefaultImports, declaration, emitDecoratorMetadata, esModuleInterop, experimentalDecorators, forceConsistentCasingInFileNames, incremental (+13 more)

### Community 28 - "PrismaService"
Cohesion: 0.12
Nodes (7): HealthController, Controller, Get, PrismaService, Injectable, HealthCheck, SerializeOptions

### Community 29 - "include"
Cohesion: 0.10
Nodes (19): exclude, extends, dist, compilerOptions, plugins, strictNullChecks, exclude, extends (+11 more)

### Community 30 - "dependencies"
Cohesion: 0.10
Nodes (21): dependencies, expo-image, expo-image-picker, expo-location, @expo/metro-runtime, expo-router, expo-system-ui, react-native (+13 more)

### Community 31 - "token.service.ts"
Cohesion: 0.29
Nodes (6): RefreshTokenMetadata, AppConfig, JwtConfig, MailConfig, SupabaseConfig, TokenConfig

### Community 32 - "AuthContext.tsx"
Cohesion: 0.15
Nodes (17): AuthContext, AuthContextType, AuthProvider(), clearTokens(), isValidRole(), sanitizeUser(), secureStorage, storeTokens() (+9 more)

### Community 33 - "compilerOptions"
Cohesion: 0.10
Nodes (19): compilerOptions, declaration, declarationMap, esModuleInterop, incremental, isolatedModules, lib, module (+11 more)

### Community 34 - "ExperiencesController"
Cohesion: 0.18
Nodes (10): ExperiencesController, Body, Controller, Get, HttpCode, Param, Patch, Post (+2 more)

### Community 35 - "GuidesService"
Cohesion: 0.16
Nodes (4): GuideListResponseDto, GuideReviewStats, GuidesService, Injectable

### Community 36 - "auth.service.ts"
Cohesion: 0.17
Nodes (10): AuthTokensDto, Exclude, Expose, ARGON2_OPTIONS, REVOKE_REASON, RevokeReason, SECURITY_MESSAGES, SELF_REGISTERABLE_ROLES (+2 more)

### Community 37 - "ReviewsController"
Cohesion: 0.19
Nodes (11): ReviewsController, Body, Controller, Delete, Get, HttpCode, Param, Patch (+3 more)

### Community 38 - "CreateExperienceDto"
Cohesion: 0.21
Nodes (14): CreateExperienceDto, CreateLocationDto, CreatePricingRuleDto, ArrayMinSize, IsArray, IsEnum, IsInt, IsNumber (+6 more)

### Community 39 - "lib/api.ts"
Cohesion: 0.13
Nodes (15): plugins, expo-secure-store, expo-status-bar, react-native-compressor, ImageUploadPickerProps, ApiConfig, ApiError, MAX_SIZES (+7 more)

### Community 40 - "devDependencies"
Cohesion: 0.12
Nodes (16): eslint, @types/node, eslint, devDependencies, eslint, @repo/eslint-config, @repo/typescript-config, @types/node (+8 more)

### Community 41 - "CreateGuideProfileDto"
Cohesion: 0.20
Nodes (14): CreateGuideExpertiseDto, CreateGuideProfileDto, CreateLocationDto, ArrayMinSize, IsArray, IsDateString, IsEnum, IsNumber (+6 more)

### Community 42 - "compilerOptions"
Cohesion: 0.12
Nodes (14): compilerOptions, allowJs, jsx, module, moduleResolution, noEmit, plugins, extends (+6 more)

### Community 43 - "MessageResponseDto"
Cohesion: 0.20
Nodes (5): AuthService, Injectable, MessageResponseDto, Exclude, Expose

### Community 44 - "LoginDto"
Cohesion: 0.16
Nodes (12): DeviceInfoDto, IsOptional, IsString, MaxLength, LoginDto, IsEmail, IsNotEmpty, IsOptional (+4 more)

### Community 45 - "RegisterDto"
Cohesion: 0.15
Nodes (12): RegisterDto, IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString (+4 more)

### Community 46 - "experience-response.dto.ts"
Cohesion: 0.40
Nodes (12): ExperienceCategoryResponseDto, ExperienceDetailResponseDto, ExperienceGuideResponseDto, ExperienceImageResponseDto, ExperienceListItemDto, ExperienceLocationResponseDto, ExperiencePricingRuleResponseDto, MyExperienceListItemDto (+4 more)

### Community 47 - "devDependencies"
Cohesion: 0.15
Nodes (13): devDependencies, babel-preset-expo, eslint-config-expo, prettier-plugin-tailwindcss, tailwindcss, @types/react, typescript, @types/react (+5 more)

### Community 48 - "LoginResponseDto"
Cohesion: 0.20
Nodes (7): LoginResponseDto, Exclude, Expose, Type, SafeUserDto, Exclude, Expose

### Community 49 - "ExperiencesService"
Cohesion: 0.26
Nodes (4): ExperienceListResponseDto, UpdateExperienceDto, ExperiencesService, Injectable

### Community 50 - "guides.service.ts"
Cohesion: 0.30
Nodes (5): GuideSortBy, SortOrder, UpdateGuideProfileDto, GuideDetailWithRelations, GuideWithRelations

### Community 51 - "mobile/package.json"
Cohesion: 0.17
Nodes (11): main, name, private, scripts, android, dev, ios, lint (+3 more)

### Community 52 - "include"
Cohesion: 0.17
Nodes (11): compilerOptions, paths, strict, extends, include, **/*.ts, **/*.tsx, expo-env.d.ts (+3 more)

### Community 53 - "package.json"
Cohesion: 0.17
Nodes (11): engines, node, name, packageManager, private, scripts, build, check-types (+3 more)

### Community 54 - "CreateBlockedPeriodDto"
Cohesion: 0.33
Nodes (9): CreateAvailabilityDto, CreateBlockedPeriodDto, RecurrenceType, IsDateString, IsEnum, IsOptional, IsString, UpdateAvailabilityDto (+1 more)

### Community 55 - "guide-response.dto.ts"
Cohesion: 0.45
Nodes (10): GuideDetailResponseDto, GuideExpertiseResponseDto, GuideListItemDto, GuideLocationResponseDto, GuidePrivateProfileDto, GuideReviewSummaryDto, PendingGuideResponseDto, Exclude (+2 more)

### Community 56 - "web/package.json"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, check-types, dev, lint, start (+2 more)

### Community 57 - "trpc/package.json"
Cohesion: 0.18
Nodes (10): zod, main, name, peerDependencies, @trpc/server, zod, private, types (+2 more)

### Community 58 - "admin.module.ts"
Cohesion: 0.31
Nodes (6): AdminController, Controller, AdminModule, Module, AdminService, Injectable

### Community 59 - "ExperienceListQueryDto"
Cohesion: 0.20
Nodes (10): ExperienceListQueryDto, IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max (+2 more)

### Community 60 - "VerifyGuideDto"
Cohesion: 0.24
Nodes (7): RejectGuideDto, IsArray, IsEnum, IsOptional, IsString, IsUUID, VerifyGuideDto

### Community 61 - "data/index.ts"
Cohesion: 0.20
Nodes (9): BOOKING_DATES, CATEGORIES, EXPERIENCES, GUIDE, INCLUSIONS, TOP_EXPERIENCES, Experience, Guide (+1 more)

### Community 62 - "typescript"
Cohesion: 0.22
Nodes (9): typescript, devDependencies, prettier, turbo, typescript, prettier, turbo, typescript (+1 more)

### Community 63 - "EnvironmentVariables"
Cohesion: 0.22
Nodes (9): EnvironmentVariables, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Max, Min (+1 more)

### Community 64 - "GuideListQueryDto"
Cohesion: 0.22
Nodes (9): GuideListQueryDto, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min (+1 more)

### Community 65 - "reset-project.js"
Cohesion: 0.22
Nodes (7): exampleDirPath, fs, oldDirs, path, readline, rl, root

### Community 66 - "eslint-config/package.json"
Cohesion: 0.22
Nodes (8): exports, ./base, ./next-js, ./react-internal, name, private, type, version

### Community 67 - "PendingGuidesQueryDto"
Cohesion: 0.25
Nodes (7): PendingGuidesQueryDto, IsEnum, IsInt, IsOptional, Max, Min, Type

### Community 68 - ".dismiss"
Cohesion: 0.39
Nodes (5): Body, HttpCode, Param, Patch, Post

### Community 69 - "dependencies"
Cohesion: 0.25
Nodes (8): react-dom, dependencies, next, react, react-dom, react, react-dom, next

### Community 70 - "ChangePasswordDto"
Cohesion: 0.29
Nodes (6): ChangePasswordDto, IsNotEmpty, IsString, Matches, MaxLength, MinLength

### Community 71 - "ResetPasswordDto"
Cohesion: 0.29
Nodes (6): ResetPasswordDto, IsNotEmpty, IsString, Matches, MaxLength, MinLength

### Community 72 - "experiences.service.ts"
Cohesion: 0.52
Nodes (4): ExperienceSortBy, SortOrder, ExperienceDetailWithRelations, ExperienceWithRelations

### Community 73 - "next.js"
Cohesion: 0.43
Nodes (3): config, nextJsConfig, config

### Community 74 - "typescript-config/package.json"
Cohesion: 0.29
Nodes (6): license, name, private, publishConfig, access, version

### Community 75 - "nest-cli.json"
Cohesion: 0.33
Nodes (5): collection, compilerOptions, deleteOutDir, $schema, sourceRoot

### Community 76 - "app/_layout.tsx"
Cohesion: 0.33
Nodes (4): expo-font, queryClient, unstable_settings, expo-font

### Community 77 - "useAuth"
Cohesion: 0.47
Nodes (5): LoginScreen(), ProfileScreen(), getRoleBasedRoute(), RouteGuard(), useAuth()

### Community 78 - "UpdateExperienceStatusDto"
Cohesion: 0.40
Nodes (4): IsEnum, IsOptional, IsString, UpdateExperienceStatusDto

### Community 79 - "external-link.tsx"
Cohesion: 0.40
Nodes (3): expo-web-browser, Props, expo-web-browser

### Community 80 - "(tourist)/(tabs)/bookings.tsx"
Cohesion: 0.70
Nodes (4): BookingsScreen(), getStatusColor(), getStatusLabel(), useMyBookings()

### Community 81 - "auth.module.ts"
Cohesion: 0.16
Nodes (9): AuthModule, Module, JwtStrategy, Injectable, PasswordChangedEmailPayload, PasswordResetEmailPayload, VerificationEmailPayload, Module (+1 more)

### Community 82 - "metro.config.js"
Cohesion: 0.50
Nodes (3): config, { getDefaultConfig }, { withNativeWind }

## Knowledge Gaps
- **372 isolated node(s):** `$schema`, `collection`, `sourceRoot`, `deleteOutDir`, `name` (+367 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **28 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `dependencies` connect `dependencies` to `lib/api.ts`, `mobile/package.json`, `dependencies`, `app/_layout.tsx`, `external-link.tsx`, `expo`, `expo-constants`, `expo-dev-client`, `expo-haptics`, `expo-linking`, `expo-splash-screen`, `expo-symbols`, `@expo/ui`, `@expo/vector-icons`, `nativewind`, `react`, `react-native-maps`, `react-native-reanimated`, `react-native-safe-area-context`, `react-native-worklets`?**
  _High betweenness centrality (0.086) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `devDependencies` to `devDependencies`, `mobile/package.json`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **Why does `PrismaService` connect `PrismaService` to `bookings.service.ts`, `reports.service.ts`, `GuidesService`, `auth.service.ts`, `reviews.service.ts`, `users.controller.ts`, `experiences.service.ts`, `MessageResponseDto`, `app.module.ts`, `JwtPayload`, `auth.module.ts`, `ExperiencesService`, `guides.service.ts`, `uploads.service.ts`, `TokenService`, `VerifyGuideDto`, `token.service.ts`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **What connects `$schema`, `collection`, `sourceRoot` to the rest of the system?**
  _372 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Colors` be split into smaller, more focused modules?**
  _Cohesion score 0.075990675990676 - nodes in this community are weakly interconnected._
- **Should `bookings.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.06557377049180328 - nodes in this community are weakly interconnected._
- **Should `reports.service.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.05792349726775956 - nodes in this community are weakly interconnected._