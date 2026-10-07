# Changelog

All notable changes to this project are documented here. Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), versions follow [SemVer](https://semver.org/).

## [Unreleased]

### Changed

- Project env keys now carry the `EDEN` prefix (`NEXT_PUBLIC_EDEN_APP_URL`,
  `NEXT_PUBLIC_EDEN_SUPABASE_URL`, `NEXT_PUBLIC_EDEN_SUPABASE_ANON_KEY`,
  `EDEN_SUPABASE_SERVICE_ROLE_KEY`, `EDEN_STRIPE_SECRET_KEY`,
  `EDEN_STRIPE_WEBHOOK_SECRET`). New names added on Vercel next to the old ones,
  kept for rollback.
- `next.config.ts` loads `~/.secrets/projets.env` in local dev when present
  (`CENTRAL_ENV_FILE` overrides the path), never overriding a set variable.

### Added

- `.env.example` (the README already pointed to it).

## [0.1.0] - 2026-10-07

First tagged release. Latest changes:

- docs: add colors to mermaid diagrams (#17)
- docs: add semver version badge (0.1.0) to README (#16)
- docs: typography pass, no em dash or middle dot (#15)
- fix(audit-p0): production blockers from multi-agent audit (#13)
- fix(fonts): use Tai Heritage Pro for mono slot (per Adam) (#12)
- fix(fonts): replace JetBrains Mono with DM Mono (plain zero, no dot) (#11)
- fix: micro ceiling only for micro-entreprise + drop particulier journey (#10)
- docs(adr): opt-in voluntary contribution (anti dark-pattern) + copy (#9)
- feat(onboarding): 3-profile journeys (entreprise/asso/particulier) (#8)
- feat(invoices): automatic sequential numbering + purge mediopoint/dashes (#7)
- feat(settings): legal-form dropdown (+ association) and profile settings link (#6)
- fix(auth): hide Google/LinkedIn buttons until providers configured (#5)
- fix(404): force dark Black & Brass theme + move footer in-flow (no overlap) (#4)
- refactor(404): warmer, less technical copy and visuals (#3)
- feat: client-based pricing + 404 Monkey branding (#2)
