# personal-website

![CI](https://github.com/dimbo1324/personal-website/actions/workflows/ci.yml/badge.svg)
![Node](https://img.shields.io/badge/node-22.x-339933?logo=node.js&logoColor=white)
![pnpm](https://img.shields.io/badge/pnpm-11.x-F69220?logo=pnpm&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue)

## What this is

A pnpm/Turborepo monorepo for my personal website. The tooling (linting, formatting,
type-checking, testing, CI, git hooks) is shared across every app and package via a
version catalog, so adding a second app later is a matter of copying `apps/web`'s
config files, not re-deriving the whole setup.

```
apps/
  web/                 Next.js 16 App Router site
packages/
  ui/                  Shared design system: Tailwind v4 theme, cn util, components
  core/                Shared domain layer: Zod schemas, typed env
  eslint-config/       Shared flat ESLint configs (base/react/next/node/test)
  jest-config/         Shared Jest presets (SWC-based, no Babel/Vite)
  tsconfig/            Shared tsconfig presets (base/node/next/react-library)
```

## Quick start

```bash
pnpm install
cp apps/web/.env.example apps/web/.env.local
pnpm dev
```

Requires Node `>=22.11` and pnpm `>=11` (both pinned via `.nvmrc` / `packageManager`;
Corepack fetches the right pnpm automatically).

## Commands

| Command             | What it does                                                       |
| ------------------- | ------------------------------------------------------------------ |
| `pnpm dev`          | Run every app's dev server via Turbo                               |
| `pnpm build`        | Build every app/package                                            |
| `pnpm lint`         | Lint the whole workspace                                           |
| `pnpm typecheck`    | Type-check the whole workspace                                     |
| `pnpm test`         | Run unit tests                                                     |
| `pnpm test:cov`     | Run unit tests with coverage                                       |
| `pnpm check`        | `lint` + `typecheck` + `test` in one pass                          |
| `pnpm format`       | Format the repo with Prettier                                      |
| `pnpm format:check` | Check formatting without writing                                   |
| `pnpm clean`        | Remove build output and caches (`--all` also wipes `node_modules`) |

## Dependency versions

`pnpm-workspace.yaml`'s `catalog` block is the single source of truth for dependency
versions across the workspace — every `package.json` references versions as
`"react": "catalog:"`. Bump a version there once and every app/package moves together.

## Code quality

- ESLint 10 flat config, type-aware (`typescript-eslint` with `projectService`).
- Prettier with `prettier-plugin-tailwindcss` for class sorting.
- Husky hooks: `pre-commit` runs `lint-staged`, `commit-msg` runs commitlint
  (Conventional Commits), `pre-push` runs `typecheck` + `test` (fast — Turbo caches
  aggressively on an unchanged tree).
- CI (`.github/workflows/ci.yml`) runs format-check, lint, typecheck, unit tests with
  coverage, and a build on every push/PR to `main`.

Commit messages follow Conventional Commits, e.g. `feat(web): add contact form`. See
`commitlint.config.mjs` for the allowed scopes.

## Adding a second app

The `apps/*` workspace glob already covers it — copy the config files from `apps/web`
(`next.config.ts`, `postcss.config.mjs`, `tsconfig.json`, `eslint.config.mjs`,
`jest.config.mjs`), reference dependencies via `catalog:`, and give it its own dev
port.

## License

MIT — see [LICENSE](LICENSE).
