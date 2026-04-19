# Media Sharing Architecture Decision

## Status

Proposed and implemented for Phase 0/1 scaffolding.

## Scope

Add a private, mobile-first media sharing feature to the existing Road Trip 2026 Astro site.

## Approved decisions

1. Keep the project as a single Astro application.
2. Continue deploying on the existing Cloudflare-compatible path.
3. Use Cloudflare R2 for original media and derived assets.
4. Use Cloudflare D1 for users, sessions, media metadata, comments, moderation state, and upload sessions.
5. Use Astro server endpoints for the API surface in v1.
6. Use invite-only application auth with secure cookie sessions.
7. Use direct browser-to-R2 signed uploads.
8. Support short videos in v1, but do not implement transcoding in v1.
9. Generate image thumbnail and preview derivatives.
10. Keep Cloudflare Access optional and out of the critical path for v1.

## Why

This keeps the implementation aligned with the current repo and deployment shape, minimizes service sprawl, and provides enough capability for about 20 invited users and about 10 GB of uploaded media.

## Rejected alternatives

### Separate backend service

Rejected for v1 because it adds deployment and operational complexity without enough benefit at this scale.

### Cloudflare Access as primary auth

Rejected for v1 because it adds friction for invited users and does not replace application-level identities for uploads and comments.

### Full video transcoding pipeline

Rejected for v1 because it adds too much complexity for a private low-scale app.

## Consequences

- The site moves from mostly static to a lightweight dynamic app.
- `wrangler.jsonc` will need R2 and D1 bindings.
- Cloudflare resources must be provisioned before the feature can function end-to-end.
- Local development will need D1 and R2-compatible configuration.
