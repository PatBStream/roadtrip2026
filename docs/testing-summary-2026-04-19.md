# Testing Summary - 2026-04-19

## What was validated during local MVP testing

- local preview on port `53000`
- invite seeding endpoint working under local Wrangler preview
- sign-in flow working with seeded invited email
- session cookie persistence working on local HTTP after cookie policy fix
- memories page and detail page rendering correctly at runtime
- upload flow working end-to-end:
  - create upload session
  - upload object to local R2 emulation
  - finalize media record in local D1
- gallery displays uploaded image objects
- memory detail page loads
- comments endpoints reachable

## Important fixes discovered during testing

- Astro v6 Cloudflare env handling needed to use `cloudflare:workers`
- API routes needed `prerender = false`
- memories pages needed runtime rendering, not prerendering
- local HTTP login required non-secure cookie behavior
- media object route path mismatch caused image 404s

## Remaining MVP constraints

- media derivatives are deferred for now
- more deploy hardening is still recommended
- more phone testing is still worthwhile before widening access
