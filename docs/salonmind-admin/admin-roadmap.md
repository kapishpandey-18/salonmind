# SalonMind Admin – Provisioning & Dashboard Roadmap

This document tracks the next upgrades we need to bring the `salonmind-admin` app and its backend surfaces to production quality.

## 1. Admin Management API

- **Goal:** Let trusted admins onboard new admins without touching MongoDB manually.
- **Tasks**
  - Create an authenticated route (e.g., `POST /v1/admin/users`) that only accepts `ADMIN` access tokens.
  - Store allowlisted phone numbers in a collection (or on the user document) instead of `.env`.
  - Log who created/disabled each admin for auditing.

## 2. Invite / Approval Flow (Optional, after API)

- Issue one-time invite tokens so a new admin must redeem both the invite and OTP before activation.
- Add admin UI to create/revoke invites and force expiration.

## 3. Admin Dashboard Data

- Define backend endpoints for the actual admin widgets: overview KPIs, salons list, products catalog, subscription states, etc.
- Add React Query hooks + components in `apps/salonmind-admin` to consume those APIs and replace the placeholder dashboard.

## 4. Security Hardening

- Track audit logs for OTP send/verify attempts by surface.
- Provide session/refresh-token revoke endpoints so admins can kill compromised sessions.

## 5. Automation & Tests

- Write a seed script that provisions the first super-admin plus demo salon data for new environments.
- Add integration tests covering the admin-create/invite flows to prevent privilege escalation.

Use this roadmap to prioritize implementation and to keep everyone aligned on the required security posture.

