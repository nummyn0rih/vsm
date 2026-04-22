# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Vegetable Shipment Management (VSM) — fullstack app for tracking vegetable shipments. Russian-language UI and error messages; keep that convention when adding user-facing strings.

- `backend/` — Express + TypeScript + Prisma (PostgreSQL), JWT auth
- `frontend/` — React 18 + Vite + TypeScript + Ant Design

The two are independent npm projects; install and run them separately.

## Commands

### Backend (`cd backend`)

```
npm run dev                # ts-node-dev on src/index.ts (port 3001 by default)
npm run build              # tsc → dist/
npm start                  # node dist/index.js
npm run prisma:generate    # regenerate Prisma client after schema.prisma edits
npm run prisma:migrate     # create + apply a dev migration
npm run prisma:seed        # seed users (admin/admin123, user/user123) + references
npx ts-node scripts/check-db.ts   # quick DB connectivity + row count check
```

Requires `backend/.env` — copy from `.env.example`. `DATABASE_URL` and `JWT_SECRET` are required. After editing `prisma/schema.prisma`, run `prisma:generate` before `dev` will type-check.

### Frontend (`cd frontend`)

```
npm run dev        # Vite on port 3000, proxies /api → http://localhost:3001
npm run build      # tsc (type-check) + vite build
npm run preview    # preview production build
```

No lint, test, or format scripts are configured in either project.

## Architecture

### Auth + authorization model

- JWT issued by `POST /api/auth/login`; frontend stores it in `localStorage` under `token`.
- `backend/src/middleware/auth.ts` attaches `req.user = { userId, role }` from the `Authorization: Bearer` header; all non-login routes mount this middleware at the router level.
- `backend/src/middleware/roleCheck.ts` (`requireAdmin`) gates all write endpoints. Two roles exist: `ADMIN` (full access) and `USER` (read-only on shipments + references).
- Frontend mirrors this: `AuthContext` (`frontend/src/context/AuthContext.tsx`) exposes `isAdmin`, and `ProtectedRoute` has a `requireAdmin` prop used in `App.tsx` to gate `/references` and `/logs`.
- `axiosInstance.ts` auto-attaches the token and force-redirects to `/login` on any 401 — components don't need to handle token expiry themselves.

### Domain model (`backend/prisma/schema.prisma`)

Central entity is `Shipment`, which references `Vegetable`, `Supplier`, `TransportCompany`, `Driver`, and `User` (creator). Two patterns apply throughout the shipment code path and must be preserved:

1. **Soft delete.** `Shipment.deletedAt` is nullable; `deleteShipment` sets it instead of removing the row. Every read path filters `where: { deletedAt: null }` — new queries on shipments must do the same or they will leak deleted rows.
2. **Audit log.** Every create/update/status-change/delete in `shipmentController.ts` and `referenceController.ts` calls `createAuditLog` (`services/logService.ts`) with `oldValues`/`newValues` snapshots. When adding new mutations, write the matching audit record in the same transaction path.

Shipment statuses are an enum: `PLANNED`, `IN_TRANSIT`. Status transitions go through a dedicated `PATCH /api/shipments/:id/status` endpoint (separate from full updates) so they log as `STATUS_CHANGE` rather than `UPDATE`.

### Request validation

Shipment create/update uses `express-validator` chains (`shipmentValidation` in `shipmentController.ts`) applied in the route file. When adding fields to `Shipment`, update both the validation chain and the frontend form (`components/ShipmentForm.tsx`) + types (`frontend/src/types/index.ts`).

### Frontend structure

- `api/` — thin axios wrappers, one file per resource, all go through `axiosInstance.ts`.
- `pages/` — route-level components (`ShipmentsPage`, `ReferencesPage`, `LogsPage`, `LoginPage`).
- `components/ShipmentTable.tsx` + `components/ShipmentTable/` — the main shipments grid. The subfolder holds extracted helpers: `groupShipments.ts` (groups rows by arrival date with subtotal rows), `useColumnPrefs.ts` + `ColumnSettings.tsx` (user-configurable column visibility persisted in localStorage), `types.ts` (row/column types), `table.css`.
- Types under `frontend/src/types/index.ts` are hand-maintained to mirror the Prisma schema (not generated). Keep them in sync when the schema changes.
- Ant Design is configured with Russian locale (`ruRU`) at the `ConfigProvider` in `App.tsx`; dayjs is also set to Russian — don't add a second locale provider.

### Dev server ports

Vite runs on **3000** and proxies `/api` to backend on **3001**. The backend's default `FRONTEND_URL` (CORS origin) in `.env.example` is `http://localhost:5173` (Vite's default, not the port this project uses) — set `FRONTEND_URL=http://localhost:3000` in `.env` or CORS will reject browser requests in dev.
