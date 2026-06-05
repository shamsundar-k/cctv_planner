# Repository Guidelines

## Project Structure & Module Organization

This is a pnpm workspace with two main packages. `packages/frontend` contains the React 19 + TypeScript + Vite app. Source lives in `packages/frontend/src`, with pages in `src/pages`, shared UI in `src/components`, API clients in `src/api`, Zustand stores in `src/store`, and camera/project types in `src/types`. Static assets belong in `packages/frontend/public` or `src/assets`.

`packages/backend` contains the FastAPI service. Application code is under `packages/backend/app`: routers in `app/routers`, persistence models in `app/models`, database schemas in `app/db_schemas`, request/response schemas in `app/schemas` and `app/api_models`, and shared configuration/security/database setup in `app/core`. Process notes and CCTV reference PDFs are in `docs/process`.

## Build, Test, and Development Commands

- `pnpm dev`: starts backend and frontend together from the repository root.
- `pnpm dev:frontend`: runs the Vite dev server for `packages/frontend`.
- `pnpm dev:backend`: runs `uvicorn app.main:app --reload` inside `packages/backend`.
- `pnpm --filter frontend build`: type-checks the frontend with `tsc -b` and builds with Vite.
- `pnpm --filter frontend lint`: runs ESLint over TypeScript/React files.
- `cd packages/backend && uv run pytest`: runs backend pytest tests when present.

Use `start_frontend.sh` and `start_backend.sh` as local convenience wrappers.

## Coding Style & Naming Conventions

Frontend code uses TypeScript, React function components, and ESLint flat config. Name components and pages in `PascalCase` (`AdminCameraEditPage.tsx`), hooks with `use` prefixes, and store slices with descriptive camelCase filenames.

Backend code targets Python 3.12 with FastAPI and Pydantic. Use snake_case for modules, functions, fields, and route helpers. Keep router logic thin; place mapping and data-shaping code in `app/mappers` or service modules.

## Testing Guidelines

Backend tests use `pytest` with `pytest-asyncio` configured in `packages/backend/pyproject.toml`. Prefer colocated or package-level `tests/` files named `test_*.py`. Frontend formal test tooling is not configured yet; the existing `packages/frontend/src/lib/fovCalculations.test.ts` is a direct script-style check, so add a runner before expanding frontend unit tests.


## Security & Configuration Tips

Do not commit secrets. Copy `.env.example` locally and set `MONGO_URI`, `REDIS_URL`, JWT settings, admin bootstrap credentials, and Vite API/map keys outside version control.
