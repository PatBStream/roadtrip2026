# Local Secret Setup

For local Wrangler preview, the application does **not** automatically use the Cloudflare production secret value you uploaded with `wrangler secret put`.

You need a local development secret too.

## Create `.dev.vars`

In the project root, create:

- `/home/pat/projects/roadtrip2026/.dev.vars`

Contents:

```bash
SESSION_SECRET=your-local-secret-value
```

Use the **same value** when calling the invite seeding helper script.

## Example

### 1. Start local preview

```bash
cd /home/pat/projects/roadtrip2026
npm run preview
```

### 2. In another terminal, seed an invited user

```bash
cd /home/pat/projects/roadtrip2026
export SESSION_SECRET=your-local-secret-value
./scripts/seed-invite.sh your-email@example.com "Pat" http://localhost:53000
```

The header sent by the helper script must match the secret loaded by Wrangler dev from `.dev.vars`.

## Why the earlier 403 happened

The app compared:

- `x-admin-seed-key` header from the script
- against local runtime `SESSION_SECRET`

If your script used a different value than the one loaded by local Wrangler dev, the request is correctly rejected with `403 Forbidden`.
