# React Feature-Based Code Organization

## Principles

- Organize code by **feature**, not by file type.
- Keep components, hooks, API calls, state, types, and utilities related to a feature together.
- Place only truly reusable code in `shared`.
- Keep application setup in `app`.
- Keep infrastructure and third-party configuration in `lib`.

---

## Recommended Structure

```txt
src/
├── app/
│   ├── App.tsx
│   ├── routes.tsx
│   └── providers.tsx
│
├── features/
│   ├── users/
│   ├── auth/
│   └── dashboard/
│
├── shared/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── types/
│
├── lib/
│   ├── apiClient.ts
│   └── constants.ts
│
├── assets/
└── styles/
```

---

## Feature Structure

```txt
features/
  users/
    components/
    hooks/
    api/
    stores/
    types.ts
    utils.ts
    index.ts
```

A feature owns all code specific to that domain.

---

## Shared Code

Use `shared` only for code reused across multiple features.

Examples:

```txt
shared/components/Button.tsx
shared/hooks/useDebounce.ts
shared/utils/date.ts
```

---

## Imports

Prefer feature public APIs:

```ts
import { UserList } from "@/features/users";
```

Avoid deep imports:

```ts
import { UserList } from "@/features/users/components/UserList";
```

Use `index.ts` to expose the feature's public API.

---

## Refactoring Guidelines

When organizing an existing codebase:

1. Identify major features.
2. Move related files into feature folders.
3. Move reusable code into `shared`.
4. Move app setup into `app`.
5. Move infrastructure code into `lib`.
6. Update imports.
7. Do not change business logic unless required.
