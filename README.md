# Travel History Visualiser

An interactive calendar-based tool for visualising travel history. Enter your travel data in a structured text format and see it rendered as a colour-coded calendar with statistics.

## Features

- **Interactive calendar** — colour-coded daily view of visited locations
- **Flexible data format** — tab or comma-separated entries supporting countries, regions, and minor locations (cities, provinces)
- **Overview and detail modes** — toggle between major locations (e.g. United Kingdom) and minor locations (e.g. England, Scotland)
- **Statistics panel** — total days travelled, number of locations, per-location breakdowns
- **Date range controls** — Start–End, Start+Days, and End+Days modes with long-press navigation
- **Monaco Editor** — full-screen code editor for comfortable data entry
- **Internationalisation** — Chinese, English, French, and Danish; auto-detected from browser language
- **200+ countries and territories** — ISO 3166-1 codes with multi-language aliases; special support for Schengen Area and UK subdivisions

## Data Format

Each line describes a location visit. Fields are separated by tabs or commas.

```
# Type 1 — group with minor locations
20240101  20240115  France
          20240101  20240107  Paris
          20240108  20240115  Lyon

# Type 2 — major location with minor location on one row
20240201  20240210  United Kingdom  England

# Type 3 — major location only
20240301  20240315  Japan
```

- Dates are `YYYYMMDD`
- Minor location dates must fall within the group's date range
- Location names are matched case-insensitively in all supported languages

## Getting Started

**Requirements:** Node.js 20+, pnpm 10.4.1 (or enable [Corepack](https://nodejs.org/api/corepack.html): `corepack enable`)

```bash
pnpm install
pnpm dev          # Dev server at http://localhost:3000
```

## Scripts

| Command | Description |
|---|---|
| `pnpm dev` | Start development server |
| `pnpm build` | Build client and server to `dist/` |
| `pnpm start` | Run production server (requires build) |
| `pnpm preview` | Preview production build locally |
| `pnpm check` | TypeScript type check |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run tests once |
| `pnpm test:watch` | Run tests in watch mode |

## Tech Stack

- **React 19** + TypeScript, **Vite 7**
- **Tailwind CSS 4**, **Radix UI**, **shadcn/ui**
- **Monaco Editor** (data entry)
- **Express.js** (production static file server)
- **Vitest** (test cases for the parser)

## Deployment

### GitHub Pages

The project is deployed automatically to [https://ayaka14732.github.io/travel-history-visualiser-manus/](https://ayaka14732.github.io/travel-history-visualiser-manus/) on every push to `main` via GitHub Actions.

### Self-hosted

```bash
pnpm build
pnpm start        # Listens on PORT env var (default 3000)
```

The build outputs a self-contained Express server in `dist/` that serves the SPA.
