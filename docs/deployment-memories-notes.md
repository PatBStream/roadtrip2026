# Memories Deployment Notes

## Current config

This repo is configured for Cloudflare deployment through Wrangler and the Astro Cloudflare adapter.

Required Cloudflare resources:

- D1 database: `roadtrip2026-db`
- R2 bucket: `roadtrip2026-media`
- secret: `SESSION_SECRET`

## Before deploying memories MVP

Confirm:

1. `wrangler.jsonc` has the correct D1 database id
2. `SESSION_SECRET` exists in Cloudflare secrets
3. remote D1 schema has been applied
4. at least one invited user has been seeded or you are ready to seed one immediately after deploy

## Seed first invited user

Use either the admin endpoint or the helper script against the deployed base URL.

Example:

```bash
SESSION_SECRET=your-secret ./scripts/seed-invite.sh guest@example.com "Guest Name" https://your-site.example
```

## Recommended first deployment posture

- treat as private beta
- invite only a very small group first
- test phone uploads before broad sharing
- keep uploaded videos short
- serve original media objects for MVP

## Recommended next hardening after MVP

- Cloudflare-compatible derivatives for image previews
- stronger admin/invite workflow
- moderation controls
- upload rate limiting
- improved mobile progress and retry UX
