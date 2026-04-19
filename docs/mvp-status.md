# Memories MVP Status

## MVP-ready scope

The following are now implemented enough to test as an MVP:

- private memories section
- invite-only sign-in flow using pre-seeded users
- logout flow
- image and short-video upload
- file storage in Cloudflare R2
- metadata storage in Cloudflare D1
- gallery page
- detail page
- comments create/list flow
- local testing path for phone-based validation
- Cloudflare-compatible deployment path

## Still intentionally deferred

- image thumbnail and preview derivative generation
- better video preview handling
- pagination/filter UX
- stronger production-grade abuse/rate-limit hardening
- richer mobile progress states
- admin polish and audit visibility improvements

## MVP test checklist

1. Seed at least one invited user
2. Sign in with that invited email
3. Upload one photo
4. Upload one short video
5. Confirm both appear in the gallery
6. Open detail page for each
7. Post comments and confirm persistence
8. Sign out and confirm gated access

## Deployment readiness note

This is now deployable for low-risk private testing and Phase 2 admin/moderation validation, but it should still be treated as a limited private beta until:

- derivatives are added in a Cloudflare-compatible way
- one more local-to-Cloudflare verification pass is completed on the new admin/moderation flows
- a little more phone-based testing is completed
