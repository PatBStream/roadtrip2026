# Cloudflare Setup Needed for Media Sharing

This project now expects Cloudflare resources for the media-sharing feature.

## Resources to create

### 1. R2 bucket

Create one private R2 bucket for media objects.

Recommended bucket name:

- `roadtrip2026-media`

Purpose:

- original image uploads
- original video uploads
- image preview derivatives
- image thumbnails
- video poster thumbnails

### 2. D1 database

Create one D1 database.

Recommended database name:

- `roadtrip2026-db`

Purpose:

- users
- sessions
- upload sessions
- media metadata
- comments
- audit events

### 3. Session secret

Create a strong random secret for signing session tokens.

Recommended secret name:

- `SESSION_SECRET`

## Wrangler bindings expected

`wrangler.jsonc` will need bindings for:

- D1 database binding: `DB`
- R2 bucket binding: `MEDIA_BUCKET`

## What to tell Quill after creation

Once these are created, provide:

- the D1 database name
- the R2 bucket name
- confirmation that you want me to bind them in `wrangler.jsonc`
- whether you want production-only resources or a separate staging set too

## Optional later

- Cloudflare Access policy for `/memories` and `/api/*`
- custom domain rules if the media feature gets its own subdomain
- analytics or observability tuning
