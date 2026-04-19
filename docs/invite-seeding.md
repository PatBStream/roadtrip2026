# Invite Seeding

Until a proper invite-management UI exists, invited users can be seeded with the admin endpoint.

## Endpoint

- `POST /api/admin-seed-invite`

Headers:

- `content-type: application/json`
- `x-admin-seed-key: <SESSION_SECRET>`

Body:

```json
{
  "email": "guest@example.com",
  "displayName": "Guest Name"
}
```

## Local helper script

A helper script is included:

```bash
SESSION_SECRET=your-secret ./scripts/seed-invite.sh guest@example.com "Guest Name" http://localhost:53000
```

For local Wrangler preview, make sure `your-secret` matches the value in `.dev.vars`.

For a deployed environment, replace the base URL with the live site URL.

## Important note

This endpoint is intentionally temporary and operational. It should eventually be replaced by a proper owner-only invite management flow.
