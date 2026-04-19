# Memories Hardening Next Steps

These are the next recommended improvements after the current MVP.

## Security and admin

- replace the temporary admin seed endpoint with an owner-only invite UI or CLI flow
- add better admin separation than reusing `SESSION_SECRET` as the seeding key
- add request rate limiting for sign-in, upload creation, upload PUT, and comments
- add basic moderation controls for hide/delete in the UI

## Media handling

- add a Cloudflare-compatible image derivative path
- add better video preview handling
- enforce more explicit content-type verification if needed

## UX

- improve upload progress and retry messaging
- add better gallery empty/error/loading states
- add filters and pagination if volume grows

## Data lifecycle

- add cleanup for abandoned upload sessions
- consider storage cleanup for deleted media
- add audit visibility for destructive actions
