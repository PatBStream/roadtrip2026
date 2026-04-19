# Cloudflare Deploy Checklist

## Branch

Current working branch for the memories MVP:

- `feature/memories-phase0-1`

## Required Cloudflare resources

Already expected by this repo:

- D1 database: `roadtrip2026-db`
- R2 bucket: `roadtrip2026-media`
- secret: `SESSION_SECRET`

## Pre-deploy checklist

Before deploying this branch, confirm all of the following:

- `wrangler.jsonc` contains the correct D1 database id
- Cloudflare secret `SESSION_SECRET` exists
- remote D1 schema has been applied
- at least one owner user exists or can be created immediately after deploy
- local `npm run build` passes

## Deploy command

```bash
cd /home/pat/projects/roadtrip2026
npm run deploy
```

## After deploy

1. open the deployed `/memories/` page
2. confirm sign-in-required view appears
3. create or verify an owner user for admin access
4. sign in from phone
5. create an invited user through `/memories/admin/`
6. upload one photo
7. upload one short video
8. confirm gallery and detail page work
9. post a comment
10. validate one hide/unhide or delete action carefully
11. sign out

## Emergency-only invite seeding after deploy

Normal flow should use the owner admin UI.

Only if admin access is blocked and you need recovery, use the emergency seed path.

## MVP deployment warning

This should be treated as a private beta deploy.

Known constraints:

- original media objects are served directly for now
- derivative generation is deferred
- invite/admin workflow is still operational rather than polished
- hardening is still modest by production standards
