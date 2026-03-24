# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CCTV Survey Planner — a monorepo with a React/TypeScript frontend and a Python/FastAPI backend. The app helps users plan CCTV camera placements on a map, with geospatial calculations, PDF/KML export.

## Monorepo Structure

Managed with **pnpm workspaces** (`pnpm-workspace.yaml`). Two packages:

- `packages/frontend` — React 19, TypeScript, Vite 7, Tailwind CSS v4
- `packages/backend` — Python 3.12+, FastAPI, MongoDB (Beanie ODM), Redis

## Commands

### Frontend (`packages/frontend`)

```bash
# From repo root
pnpm dev:frontend          # Start Vite dev server (port 5173)

# From packages/frontend
pnpm dev                   # Start dev server
pnpm build                 # Type-check + Vite build
pnpm lint                  # ESLint
pnpm preview               # Preview production build
```

### Backend (`packages/backend`)

```bash
# From packages/backend (uses uv)
uv run uvicorn app.main:app --reload   # Start FastAPI dev server (port 8000)
uv run pytest                          # Run all tests
uv run pytest tests/test_foo.py        # Run a single test file
uv run pytest -k "test_name"           # Run a single test by name
```

## Environment Setup

The Vite dev server proxies `/api/*` to `http://localhost:8000` and `/ws/*` to `ws://localhost:8000`, so no CORS config is needed during development.

## Architecture

### Frontend

- **State management**: Zustand for global UI state, TanStack Query v5 for server state/caching
- **HTTP**: Axios (base URL from `VITE_API_BASE_URL`)
- **Routing**: React Router v7
- **Map**: Leaflet + leaflet-draw for interactive camera placement on map tiles

### Backend

- **Framework**: FastAPI + Uvicorn
- **Database**: MongoDB via Motor (async driver) + Beanie ODM for document models
- **Cache/sessions**: Redis (asyncio)
- **Auth**: JWT access/refresh tokens via `python-jose`; bcrypt password hashing via `passlib`
FOV and coverage computations
- **Export**: `weasyprint` for PDF reports, `simplekml` for KML export
- **Config**: `pydantic-settings` reads all config from environment variables
- **Tests**: `pytest` + `pytest-asyncio` + `httpx` (async test client)

### Key env vars (backend)

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `REDIS_URL` | Redis connection string |
| `JWT_SECRET` | Signing key for JWT tokens |
| `JWT_ACCESS_TTL_MINUTES` | Access token lifetime |
| `JWT_REFRESH_TTL_DAYS` | Refresh token lifetime |
| `INVITE_TOKEN_TTL_HOURS` | Invitation link lifetime |
| `FIRST_ADMIN_EMAIL/PASSWORD` | Seeded on first startup |
