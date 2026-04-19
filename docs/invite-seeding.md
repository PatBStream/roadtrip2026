# Invite Seeding Notes

## Current recommendation

Normal invite creation should now happen through the owner-only admin UI:

- `/memories/admin/`

That is the preferred path for local and deployed testing.

## Emergency-only seed endpoint

The old seed endpoint still exists only as an emergency fallback:

- `POST /api/admin-seed-invite`

It is intentionally disabled unless the caller sends both:

- `x-enable-emergency-seed: true`
- `x-admin-seed-key: <SESSION_SECRET>`

This is no longer the normal workflow.

## Helper script

The helper script still works for emergency seeding when explicitly enabled:

```bash
SESSION_SECRET=your-secret ./scripts/seed-invite.sh guest@example.com "Guest Name" http://localhost:53000
```

If you use the script now, add the extra header logic first or temporarily call the endpoint manually.

## Why this changed

Phase 2 added:

- owner-only invite UI
- moderation controls
- disable/re-enable user controls
- hide/unhide media and comments
- permanent delete for media and comments
- basic rate limiting

So the secret-based seeding route should no longer be the routine path.
