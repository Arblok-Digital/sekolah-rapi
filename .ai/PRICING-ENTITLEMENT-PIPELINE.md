# Pricing and Entitlement Pipeline

## Source of truth

`src/shared/entitlements/index.ts` is the canonical registry. It defines:

- plan IDs: `free`, `basic`, `pro`, `lifetime`;
- feature IDs and the minimum plan for each feature;
- display label and annual price;
- `hasFeature()` and `normalizePlan()` used by the application.

Do not create a second application/UI plan matrix in a page or module. The SQL helper must mirror
the registry because PostgreSQL is the trusted boundary; treat that mirror as deployment code and
update it in the same change whenever a feature minimum plan changes.
When pricing changes, update the registry first, then update the public pricing copy if needed.

## Runtime pipeline

1. `schools.plan` is read by `AuthProvider` after login.
2. `AuthProvider` normalizes the value and exposes `plan`, `canUse(feature)`, and `isDev`.
3. `Sidebar` keeps paid features discoverable, marks unavailable links as locked with `canUse`, and sends them to the gated route.
4. `src/app/(dashboard)/layout.tsx` wraps feature routes with `EntitlementGate`; direct navigation shows an upgrade prompt.
5. Mutating services call `assertSchoolFeature(schoolId, feature)` for fast UX feedback; this is not a security boundary.
6. Supabase migrations `20260801001_plan_entitlements.sql` and `20260801002_lock_school_entitlement_lifecycle.sql` are the trusted enforcement layer: plan CHECK, browser plan/status lifecycle trigger, `private.school_has_feature`, tenant-aware RLS, and feature RPCs.
7. Paid data is read-only after downgrade: authenticated tenant members may read existing inventory/payroll/enrollment data, while paid mutations are blocked by RLS/RPC.
8. Public enrollment uses `public.submit_enrollment(UUID, JSONB)` only. It validates active Pro/Lifetime entitlement, forces `pending`, and is executable by anon/authenticated without exposing anon SELECT.

## Feature map

| Feature | Free | Basic | Pro/Lifetime |
| --- | --- | --- | --- |
| Dashboard, siswa, SPP, kas | Yes | Yes | Yes |
| Laporan, import siswa | No | Yes | Yes |
| Pendaftaran online, realtime owner dashboard, payroll, inventaris | No | No | Yes |

## Change protocol for agents

- Search and modify the registry before touching pricing UI.
- Keep feature IDs stable; labels may change without changing IDs.
- Add a guard to every new write/mutation service for a paid feature.
- Add the route to `getRouteFeature()` and the sidebar entry with the same feature ID.
- Mirror feature minimum-plan changes in `private.school_has_feature()` in a new migration; application checks never replace database enforcement.
- Document migrations and billing/entitlement changes in `.ai/CHANGELOG.md` and update `.ai/TASKS.md`.
- Validate with `npm run lint` and `npm run build`.

## Current billing limitation

The database stores the selected plan in `schools.plan`, but payment activation is still operational/manual. A future billing integration must update this field through a trusted server/webhook path; never let the browser self-upgrade a school.

### Manual activation flow for operators

1. Finish the commercial negotiation and verify payment outside the application.
2. Sign in with the protected `dev` role and open `/dev/admin`.
3. Expand the target school, choose the paid plan from **Plan yang dibayar client**, then use **Approve + Aktifkan Plan** for a pending school or **Simpan Plan** for an active school.
4. The browser sends the choice to `PATCH /api/admin/schools/[schoolId]`; it does not update `schools` directly.
5. The API verifies the bearer session and confirms `profiles.role = dev`, then uses the server-only `SUPABASE_SERVICE_ROLE_KEY` client to change `schools.plan/status`.
6. On the next profile refresh/login, navigation and route UX follow the new plan; database RLS/RPC remains the final enforcement boundary.

In short: negotiation/payment verification → dev dropdown → trusted API → plan/status update → entitlement applied. Never expose the service-role key or replace this flow with a browser-side table update.

## Deployment and verification

- Both migrations were applied on 2026-08-01 to confirmed project `bbymrmysmerazdkubptc`; local and remote migration histories match through `20260801002`.
- Remote smoke checks confirmed the active Free school resolves `reports`, `student_import`, `enrollment`, `realtime_dashboard`, `payroll`, and `inventory` as unavailable, while direct anon enrollment is rejected by RLS. No production rows were inserted or modified.
- `schools.plan` and `schools.status` are lifecycle state. Browser inserts are restricted to `free/pending`; browser updates cannot change either value. The dev admin route changes lifecycle state only through a server-side `service_role` client after verifying the caller's `profiles.role = dev`.
- The development bypass is intentional: `private.is_dev_user()` permits feature access for the dev role, but normal users remain subject to plan and tenant checks.

### Advisor review (2026-08-01)

- Security advisor: 43 findings (`2 ERROR`, `41 WARN`) across the existing schema. Five entitlement RPC warnings are intentional SECURITY DEFINER entry points whose function bodies validate tenant and entitlement: anon `submit_enrollment`, plus authenticated `submit_enrollment`, `approve_enrollment`, `reject_enrollment`, and `import_students`. Review: https://supabase.com/docs/guides/database/database-linter?lint=0028_anon_security_definer_function_executable and https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable.
- Performance advisor: 154 findings (`154 INFO/WARN`) across the existing schema, dominated by 139 existing multiple-permissive-policy warnings. The entitlement-adjacent item is a missing covering index for `enrollment_requests.processed_by`: https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys.
- Existing advisor debt is not treated as fixed by this entitlement change. The intentional RPC exceptions must be re-reviewed whenever function bodies or grants change.