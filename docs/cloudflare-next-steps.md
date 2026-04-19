# Cloudflare Next Steps

## Current status

Pat has created the Cloudflare resources:

- R2 bucket: `roadtrip2026-media`
- D1 database: `roadtrip2026-db`
- D1 database id: `43a2f69e-a81c-448d-a67b-4664d69c2f98`

The local repo has been updated to reference the D1 database id in `wrangler.jsonc`.

## What is still needed

## 1. Set the production session secret

From the project directory, run:

```bash
cd /home/pat/projects/roadtrip2026
npx wrangler secret put SESSION_SECRET
```

When prompted, paste a long random secret.

Recommendation:

- use at least 32 random bytes
- a password-manager generated string is fine

## 2. Apply the D1 schema migration

From the project directory, run:

```bash
cd /home/pat/projects/roadtrip2026
npx wrangler d1 execute roadtrip2026-db --file=./migrations/0001_media_schema.sql
```

Important:

- this command runs against the local D1 instance by default
- to apply the schema to the real remote Cloudflare database, run:

```bash
cd /home/pat/projects/roadtrip2026
npx wrangler d1 execute roadtrip2026-db --remote --file=./migrations/0001_media_schema.sql
```

This creates the initial tables for:

- users
- sessions
- media_items
- comments
- upload_sessions
- audit_events

## 3. Optional but recommended: create a local dev vars file

Create:

- `/home/pat/projects/roadtrip2026/.dev.vars`

Example contents:

```bash
SESSION_SECRET=replace-with-a-long-random-secret
```

## 4. Optional verification commands

If your Cloudflare token is available locally, these should work:

```bash
cd /home/pat/projects/roadtrip2026
npx wrangler d1 list
npx wrangler r2 bucket list
```

## If Quill should verify Cloudflare directly next time

Provide one of these:

- a working local `CLOUDFLARE_API_TOKEN` environment variable in the session where OpenClaw runs, or
- run the Wrangler commands yourself and paste the output

Minimum token scopes needed are enough to:

- read D1
- read or manage R2
- manage Workers or Pages bindings as needed

## What Quill can do immediately after the above

Once the secret is set and the migration is applied, the next steps are:

1. implement real auth session creation and validation
2. implement signed upload request flow
3. write upload-session records into D1
4. wire gallery queries against seeded or uploaded data
5. add first-pass comment creation flow
