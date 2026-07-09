# Student Information System (SIS)

A centralized Student Information System for engineering colleges to manage and share student data for placements and internship drives. Eliminates repetitive Google Form workflows by maintaining a single source of truth for student profiles with multi-level role-based access.

## Run & Operate

- `pnpm --filter @workspace/sis-frontend run dev` — run the React frontend (port from workflow)
- `pnpm --filter @workspace/api-server run dev` — run the Node.js API server (placeholder/health only)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec

## Environment Variables

- `VITE_API_BASE_URL` — URL of the Spring Boot backend (e.g. `https://your-app.up.railway.app`). Leave empty to use the same-origin `/api` path.
- `DATABASE_URL` — Postgres connection string (for the Node.js API server)

## Stack

- **Frontend**: React 19, Vite, TailwindCSS, React Query, Wouter (routing), Framer Motion
- **API Client**: Auto-generated from OpenAPI spec via Orval (`@workspace/api-client-react`)
- **Backend (external)**: Java Spring Boot with JWT authentication — deployed on Railway
- **Database**: Supabase (PostgreSQL) — connected to the Spring Boot backend
- **Frontend Deployment**: Vercel (or Replit deployment)

## Multi-level Access Roles

| Role | Access |
|------|--------|
| SUPER_ADMIN | Full system, all departments, user management |
| CENTRAL_PLACEMENT | All departments' students, read/export |
| DEPT_PLACEMENT | Their department's students, drives, can update student data |
| SRC | Their department's students, read-only |
| STUDENT | Own profile only, full CRUD on own sections |

## Student Profile Sections

1. **Personal Details** — contact info, address, IDs, social links
2. **Academic Details** — 10th/12th/diploma/UG grades, backlogs, CGPA
3. **Experience** — internships, full-time, freelance, projects
4. **Skills** — technical/soft skills, tools, languages, certifications
5. **Achievements** — awards, competitions, recognitions

## Where things live

- `artifacts/sis-frontend/` — React frontend
- `artifacts/api-server/` — Node.js Express server (health check only; real backend is Spring Boot)
- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth for API contract)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit manually)
- `lib/api-zod/src/generated/` — Generated Zod schemas

## Architecture decisions

- **OpenAPI-first**: The entire API contract is defined in `lib/api-spec/openapi.yaml`. The Spring Boot backend must implement these endpoints. Frontend uses auto-generated hooks.
- **JWT in localStorage**: Token stored under key `sis_token`, user object under `sis_user`. The API client automatically attaches the Bearer token via `setAuthTokenGetter`.
- **Configurable API base URL**: `VITE_API_BASE_URL` env var controls where the frontend points. In dev without it set, calls go to `/api` on the same origin.
- **Role-based routing**: Client-side route guards read the stored user role and redirect unauthorized access.
- **No local auth**: Auth is entirely handled by the Spring Boot backend (JWT + secret). Frontend only stores/passes the token.

## Connecting to your Spring Boot backend

1. Set `VITE_API_BASE_URL` to your Railway deployment URL in Replit Secrets
2. Your Spring Boot backend must implement the endpoints in `lib/api-spec/openapi.yaml`
3. CORS must allow the frontend's origin in Spring Boot config
4. JWT responses should match the `AuthResponse` schema: `{ token: string, user: User }`

## User preferences

- Build fast, clean and professional
- External backend: Java Spring Boot + JWT on Railway
- Database: Supabase
- Frontend deployment target: Vercel (or Replit)
- Blockchain integration to be added later as needed

## Gotchas

- After any `lib/api-spec/openapi.yaml` change, run `pnpm --filter @workspace/api-spec run codegen` before building
- Do not edit files in `lib/api-client-react/src/generated/` or `lib/api-zod/src/generated/` — they are overwritten by codegen
- The `VITE_API_BASE_URL` must not have a trailing slash
- The Spring Boot backend must return JWT token and user object in the format defined in `AuthResponse` schema

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
- OpenAPI spec: `lib/api-spec/openapi.yaml`
