# Memories Hardening Next Steps

These are the next recommended improvements after the current MVP.

## Security and admin

Completed in current branch:

- owner-only invite UI
- disable/re-enable invited users
- request rate limiting for sign-in, upload creation, upload PUT, and comments
- moderation controls for hide/unhide/delete in the UI
- permanent media deletion from storage and database

Still recommended next:

- remove the emergency seed endpoint entirely, or move it to a CLI-only/admin-only maintenance path, after current owner-admin flow has baked a bit more
- add stronger admin separation than reusing `SESSION_SECRET` as the emergency seeding key
- add audit visibility in the UI for destructive actions

## Media handling

- expand the current Cloudflare-compatible on-demand image resizing path into a more complete derivative strategy if needed
- add better video preview handling
- enforce more explicit content-type verification if needed

## UX

- improve upload progress and retry messaging
- add better gallery empty/error/loading states
- add filters and pagination if volume grows

## Data lifecycle

- automate cleanup for abandoned upload sessions, beyond the current owner-triggered cleanup endpoint
- add audit visibility for destructive actions
- consider soft-delete retention policy only if permanent delete proves too aggressive in real use
