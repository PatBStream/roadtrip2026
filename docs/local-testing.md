# Local Testing for Memories MVP

## Recommended local port

This project is configured to run on:

- `http://localhost:53000`

and to bind on all interfaces so it can be opened from a phone on the same network.

## Start dev mode

```bash
cd /home/pat/projects/roadtrip2026
npm run dev
```

This uses Astro dev server on:

- `0.0.0.0:53000`

## Start Cloudflare-style preview

```bash
cd /home/pat/projects/roadtrip2026
npm run preview
```

This builds first, then starts Wrangler dev on:

- `0.0.0.0:53000`

Use this when you want behavior closer to the deployed Cloudflare runtime.

## Find the laptop IP

On Linux, one common command is:

```bash
hostname -I
```

Then open from your phone using something like:

```text
http://192.168.1.50:53000
```

Use the actual IP shown by your machine.

## What to test on phone

### Sign-in flow

- open `/memories/`
- verify sign-in prompt appears
- sign in with a seeded invited email
- verify you land back in memories area

### Upload flow

- open `/memories/upload/`
- upload a phone photo
- upload a short video clip
- verify each upload appears in `/memories/`

### Detail + comments

- open an uploaded item
- verify the detail page loads
- post a comment
- refresh and verify the comment persists

### Logout

- sign out
- verify memories pages return to sign-in-required state

## Invite seeding

Until there is a full invite-management UI, use:

```bash
SESSION_SECRET=your-secret ./scripts/seed-invite.sh guest@example.com "Guest Name" http://localhost:53000
```

Important:

- for local Wrangler preview, the app reads `SESSION_SECRET` from `.dev.vars`
- the value passed to the script must match that same local secret

See also:

- `docs/local-secret-setup.md`

## Current MVP limitations

- uploaded media is currently served as original objects only
- image thumbnail and preview derivative generation is intentionally deferred
- video preview polish is still limited
- invite management is operational, not polished UI
- auth is invite-only but intentionally simple
- error states are functional more than beautiful
