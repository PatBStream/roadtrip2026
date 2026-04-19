# Media Sharing Feature Implementation Plan

## Purpose

This document describes the recommended approach for adding a mobile-first trip media sharing feature to the Road Trip 2026 website. The goal is to let a small invited group upload photos and videos during the trip, browse shared media, and comment on posts, while keeping the system cheap, fast, secure, and maintainable.

## Current repo and deployment reality

After reviewing the repository, the current site is:

- built with Astro
- structured as a mostly static multi-page site
- deployed via Cloudflare-compatible build output and Wrangler
- currently designed without a backend, database, auth layer, or upload pipeline

Relevant current files:

- `src/pages/*` for the current brochure/planning pages
- `src/data/trip.js` for structured trip content
- `astro.config.mjs` with Cloudflare adapter
- `wrangler.jsonc` for deployment/runtime config
- `docs/cloudflare-pages-deployment.md` describing the current hosting path

That means the media-sharing feature is not a small front-end tweak. It is the first real application feature in the project and should be designed as a lightweight app layer added to the existing static site.

## Feature requirements

The new feature should support:

- authenticated access for about 20 invited users
- mobile-friendly photo and video upload
- viewing media uploaded by others
- commenting on media
- efficient handling of about 10 GB total media
- low cost
- good performance on phones
- privacy and abuse protection appropriate for a private trip group

## Recommendation summary

### Final architecture decisions

These are the recommended concrete choices for v1.

- **Keep Astro** as the site framework.
- **Keep Cloudflare deployment** as the hosting/runtime platform.
- **Use Cloudflare R2** for original media storage and derived assets.
- **Use Cloudflare D1** for users, sessions, media metadata, comments, and moderation state.
- **Use Astro server endpoints on the Cloudflare adapter** for the initial API surface, rather than introducing a separate standalone Worker project.
- **Use invite-only app authentication with email magic links or one-time invite codes** as the primary auth system.
- **Do not require Cloudflare Access for v1**. It can be added later as an optional second gate.
- **Do not use Cloudflare Images as the primary media platform** for v1.
- **Do not build resumable uploads or full video transcoding in v1**.

### Why this is the best fit

This is the most natural extension of the current deployment model because:

- the site is already Cloudflare-oriented
- the user count is very small
- 10 GB total storage is modest
- R2 storage and egress economics are usually better than using S3 plus a separate CDN for a small private app
- D1 is enough for media metadata, users, sessions, comments, moderation flags, and audit records
- the engineering surface stays small, which matters more here than theoretical scale
- it avoids splitting the app into multiple deployables before that complexity is justified

## Architecture

## High-level design

1. Keep the existing brochure/planning pages mostly static.
2. Add a new authenticated `/memories` section for uploads, gallery, and comments.
3. Add API endpoints within the Astro app for:
   - login and session validation
   - signed upload URL creation
   - upload completion callback
   - media list fetch
   - single media detail fetch
   - comment create, list, and delete
4. Store uploaded originals in R2.
5. Store metadata in D1.
6. Generate and store smaller image derivatives for fast gallery browsing.
7. For videos, store originals plus one poster thumbnail, and defer transcoding unless real-world testing proves it is necessary.

## Explicit v1 boundaries

To keep the first implementation realistic, v1 should include:

- private invite-only access
- photo upload
- short video upload
- gallery feed
- media detail page
- comments
- moderator or owner hide/delete actions
- simple trip-day tagging

v1 should not include:

- public sharing
- social reactions
- notifications
- background transcoding farm
- offline queueing
- resumable multipart uploads
- automatic face recognition, location extraction, or AI tagging

## Proposed data model

### Tables

#### `users`

- `id`
- `email` or invite identifier
- `display_name`
- `role` (`owner`, `member`, `moderator`)
- `status` (`invited`, `active`, `disabled`)
- `created_at`
- `last_seen_at`

#### `sessions`

- `id`
- `user_id`
- `token_hash`
- `expires_at`
- `created_at`
- `last_seen_at`
- `ip_hash` nullable
- `user_agent` nullable

#### `media_items`

- `id`
- `uploader_user_id`
- `type` (`image`, `video`)
- `storage_key_original`
- `storage_key_preview`
- `storage_key_thumbnail`
- `file_name`
- `mime_type`
- `bytes`
- `width`
- `height`
- `duration_seconds` nullable
- `trip_day` nullable
- `caption`
- `visibility` (`group` for v1)
- `status` (`uploading`, `ready`, `failed`, `hidden`)
- `created_at`

#### `comments`

- `id`
- `media_item_id`
- `user_id`
- `body`
- `status` (`visible`, `hidden`, `deleted`)
- `created_at`
- `updated_at`

#### `upload_sessions`

- `id`
- `user_id`
- `expected_mime_type`
- `expected_bytes`
- `storage_key_original`
- `status`
- `created_at`
- `expires_at`

#### `audit_events`

- `id`
- `actor_user_id`
- `event_type`
- `target_type`
- `target_id`
- `payload_json`
- `created_at`

## Media handling design

## Images

For images:

- upload original to R2
- cap client-side upload size where practical
- generate at least:
  - thumbnail, about 400 px wide
  - feed/gallery preview, about 1600 px max dimension
- preserve original for optional full-screen viewing/download
- strip unnecessary metadata on derived assets when possible

This gives fast gallery performance while keeping originals available.

## Videos

For videos:

- upload original MP4 or MOV to R2
- generate a poster thumbnail for gallery use
- initially avoid server-side transcoding unless testing shows it is necessary
- apply client-side and server-side limits:
  - target max 60 seconds per clip for v1
  - target max upload size around 250 MB per file

Reasoning:

- only about 20 users
- total expected media is about 10 GB
- full video processing pipeline adds a lot of complexity
- modern phones already produce playable formats often good enough for a private group app

If compatibility becomes painful, a later phase can add asynchronous transcoding.

## Upload flow

### Preferred flow

1. Authenticated user taps upload on mobile.
2. Front end asks the API for a signed upload URL.
3. Server validates user, file type, and file size.
4. Server returns signed R2 upload target plus upload session id.
5. Browser uploads directly to R2, not through application compute.
6. Browser calls upload-complete endpoint with metadata.
7. Server verifies object exists, stores metadata, and marks the item ready.
8. Gallery updates optimistically or on refresh.

### Why this flow

This avoids pushing large uploads through application compute, which improves:

- performance
- reliability on mobile networks
- cost control
- simplicity

## Access control and privacy

## Final auth decision

Use **invite-only app authentication** as the primary identity system.

Recommended implementation order:

1. maintain an allowlist of invited users in D1
2. send or issue one-time invite links or one-time invite codes
3. create a session cookie after successful login
4. require authenticated session for all `/memories` pages and media APIs

### Why this is the right choice

This is the best fit because it:

- works well for about 20 invited users
- gives clean user identity for uploads and comments
- avoids forcing guests through Cloudflare identity tooling
- keeps the product feeling like a private trip app instead of an admin-protected internal tool

## Cloudflare Access decision

Do **not** make Cloudflare Access a required part of v1.

It is a viable optional hardening layer later, but it should not be the primary auth path because:

- it adds friction for casual invited users
- it does not replace app-level user identity for comments and ownership
- it complicates the user experience without solving the core application problem

## Session model

Use:

- secure, HTTP-only, same-site cookies
- short-lived session tokens with rolling renewal
- server-side session validation in D1

This is simpler and more robust here than inventing a client-token model.

## Security controls

Minimum required protections:

- private-by-default access, no anonymous upload
- signed upload URLs with short expiration
- MIME/type allowlist
- file size limits
- rate limiting on upload creation, comments, and auth endpoints
- server-side ownership checks for edits/deletes
- HTML escaping and comment sanitization
- basic CSRF protections for session-based auth
- object-key randomization, never user-controlled direct paths
- moderation state for hiding abusive or mistaken uploads/comments
- audit trail for deletes/hides

## Cost analysis

## Estimated usage assumptions

Assume:

- 20 users
- 10 GB total stored media
- low to moderate browsing traffic
- mostly private sharing among the group
- spikes during the live trip window

## Best-cost platform choice

### Recommended: Cloudflare R2 + D1 + Astro server APIs on Cloudflare

Why:

- low storage cost for 10 GB
- good CDN adjacency with Cloudflare delivery
- minimal service sprawl
- fits current deployment path
- avoids splitting the app into separate front-end and API projects too early

### Alternatives considered

#### Supabase Storage + Postgres + Auth

Pros:

- faster to build for many teams
- built-in auth and database story
- strong developer ergonomics

Cons:

- another platform to operate beside Cloudflare
- storage and bandwidth model may be less attractive than R2 for this specific setup
- not as aligned with the current deployment path

Verdict:

- strong second choice if fastest implementation matters more than platform consistency

#### Firebase / Google Cloud Storage

Pros:

- mature mobile ecosystem
- strong auth options

Cons:

- broader platform than needed
- can become harder to reason about on cost and permissions for a small bespoke app

Verdict:

- not the best fit here

#### AWS S3 + Lambda + DynamoDB or RDS

Pros:

- extremely flexible

Cons:

- too much operational and configuration surface for this project
- worse simplicity-to-value ratio

Verdict:

- overkill

## Front-end design recommendations

## UX goals

The media feature should feel like a private trip journal, not a generic asset library.

### New pages/components

- `/memories/` gallery feed
- `/memories/upload/` mobile upload flow
- `/memories/[id]/` media detail page with comments
- optional `/memories/day/[n]/` filtered views by trip day

### Mobile-first interaction design

- large upload button reachable with thumb
- camera roll and live camera capture support where browser allows it
- simple direct uploads at first, unless testing proves resumable upload is necessary
- compressed previews before upload for images when possible
- visible progress bar and retry states
- lazy-loaded gallery images
- video posters in feed, video playback only on demand
- comment box easy to reach on the detail screen

### Gallery behavior

Use a simple card feed with:

- uploader name
- time posted
- optional caption
- image or video preview
- comment count
- trip-day badge if tagged

Default sort:

- newest first

Optional filters:

- all
- photos
- videos
- day 1 through day 5
- my uploads

## Performance strategy

For good mobile performance:

- serve small thumbnails in gallery
- lazy-load below-the-fold images
- use responsive image sizes
- avoid loading video files in feed until clicked
- paginate or infinite-scroll in small batches, about 20 to 30 items
- keep API payloads metadata-only for list endpoints
- fetch comments only on media detail view

## Implementation plan

## Phase 0, repo preparation and decisions

Estimated time: 0.5 to 1 day

Tasks:

- keep deployment on the current Astro + Cloudflare path
- lock in invite-only session auth
- define upload limits for images and videos
- add environment/config plan for R2 bucket, D1 database, secrets, and session signing
- create architecture decision record in repo docs

Deliverables:

- final technical decision record
- env/config checklist
- schema draft

## Phase 1, backend foundation

Estimated time: 1 to 2 days

Tasks:

- create D1 schema and migrations
- provision R2 bucket
- add Astro server endpoints compatible with the Cloudflare deployment
- implement session/auth skeleton
- implement signed upload URL generation
- implement upload completion endpoint
- implement media list endpoint
- implement comments CRUD basics

Deliverables:

- working protected API
- upload pipeline storing test files in R2
- metadata persisted in D1

## Phase 2, front-end gallery and upload UI

Estimated time: 2 to 3 days

Tasks:

- add memories nav entry and section landing page
- build mobile-first upload UI
- add gallery feed page
- add media detail page with comments
- add loading, empty, and retry states
- add simple filtering by type, day, and uploader

Deliverables:

- usable end-to-end upload and view experience
- mobile-optimized gallery
- commenting on media

## Phase 3, media optimization and moderation

Estimated time: 1 to 2 days

Tasks:

- implement image derivative generation flow
- generate video poster thumbnails
- add hidden/delete moderation controls for owner or moderator
- add audit logging
- add rate limiting and abuse protections
- add basic analytics or observability

Deliverables:

- production-worthy performance and control layer
- moderation controls
- safer upload path

## Phase 4, testing and launch hardening

Estimated time: 1 day

Tasks:

- test iPhone and Android upload flow
- test large photo and video uploads on weaker network
- test auth and session expiry behavior
- test gallery performance with seeded dataset
- verify storage lifecycle and cleanup behavior
- document operational steps and rollback plan

Deliverables:

- launch checklist
- tested release candidate
- support notes for trip usage

## Total timeline

Reasonable implementation estimate:

- **5 to 9 working days** for a solid v1

Aggressive MVP if keeping scope tight:

- **3 to 4 days**

That assumes one experienced developer familiar with Astro and Cloudflare.

## MVP vs full v1 recommendation

## Recommended MVP scope

Ship first:

- invite-only auth
- image and short-video upload
- gallery feed
- media detail page
- comments
- owner or moderator delete/hide
- image thumbnails and previews
- one video poster image
- simple per-day tagging

Defer initially:

- resumable uploads
- advanced moderation tooling
- reactions or likes
- notifications
- offline upload queue
- heavy video transcoding
- EXIF map extraction features

This is the right tradeoff. For 20 users and 10 GB total, the simple version is enough if it is reliable.

## Risks and challenges

## Primary technical risks

1. **Mobile video uploads may be the roughest part**
   - big files
   - flaky connections
   - browser differences
   - mitigation: size and duration caps, direct-to-R2 upload, clear retry UX

2. **Server-side media processing can sprawl quickly**
   - mitigation: do lightweight image derivatives only, defer full video pipeline

3. **Auth complexity can overtake the app**
   - mitigation: keep auth minimal and invite-only

4. **Static-site assumptions in the current codebase will need to evolve**
   - mitigation: isolate app functionality under `/memories` and `/api`

5. **Abuse and privacy concerns still exist even in a small group**
   - mitigation: private access, moderation controls, audit logging, explicit allowed-user list

## Codebase integration plan

## Suggested new folders

- `src/pages/memories/index.astro`
- `src/pages/memories/upload.astro`
- `src/pages/memories/[id].astro`
- `src/components/memories/*`
- `src/pages/api/*` or equivalent Astro endpoint structure for auth, uploads, media, and comments
- `src/lib/server/*` for auth, storage, and database helpers
- `src/lib/shared/*` for DTOs and validation
- `migrations/*` for D1 schema
- `docs/architecture/media-sharing.md`

## Suggested navigation update

Add a new top-level nav item:

- `Memories`

This should remain visually secondary to the trip-planning pages, but prominent enough for use during the trip.

## API surface proposal

Initial endpoint shape:

- `POST /api/auth/request-link` or `POST /api/auth/redeem-invite`
- `POST /api/auth/logout`
- `GET /api/me`
- `POST /api/uploads/create`
- `POST /api/uploads/complete`
- `GET /api/media`
- `GET /api/media/:id`
- `POST /api/media/:id/comments`
- `GET /api/media/:id/comments`
- `POST /api/media/:id/hide`
- `DELETE /api/media/:id`

Recommended list endpoint filters:

- `type=image|video`
- `tripDay=1..5`
- `uploader=me`
- `cursor=...`
- `limit=...`

## Validation rules

Recommended initial limits:

### Images

- allow: JPEG, PNG, HEIC if supported in the browser flow, WebP
- preferred max upload: 20 MB each
- create thumbnail and preview derivatives after upload

### Videos

- allow: MP4, MOV
- preferred max upload: 250 MB each initially
- preferred max duration: 60 seconds for v1
- reject larger files cleanly with user-facing guidance

### Comments

- max length: 500 to 1000 chars
- plain text only

## Deployment changes needed

The current deployment docs describe a mostly static site and will need to be updated for application features.

New deployment requirements:

- R2 bucket creation
- D1 database creation and migration workflow
- bindings in `wrangler.jsonc` for R2 and D1
- environment secrets for session signing/auth
- staging environment if possible for upload testing

## Deployment decision

Do not split deployment into a separate backend service for v1.

Instead:

- keep one Astro application
- use the Cloudflare adapter runtime already present in the repo
- add the required bindings to `wrangler.jsonc`
- keep the operational model as one deployable application

That is the simplest path with the lowest coordination overhead.

## Suggested milestone checklist

### Milestone 1: architecture approved

- platform decision confirmed
- auth decision confirmed
- data model approved

### Milestone 2: backend running

- D1 schema live
- R2 uploads working
- signed upload endpoint tested

### Milestone 3: end-to-end MVP

- user can sign in
- upload image or video
- see upload in gallery
- open detail page
- comment on media

### Milestone 4: hardening complete

- moderation tools
- performance optimizations
- mobile testing complete
- docs updated

## Final recommendation

The best implementation path is:

- keep Astro and Cloudflare as the platform base
- add a small application layer inside the existing app instead of replacing the site
- use R2 for media storage
- use D1 for metadata, comments, users, and sessions
- use invite-only app auth with secure cookie sessions
- optimize aggressively for mobile upload flow and gallery performance
- keep the first version intentionally simple, especially for video processing

That gives the project the best balance of:

- low cost
- low operational overhead
- strong performance
- acceptable privacy and security
- realistic delivery timeline

## Decision summary for approval

The concrete decisions I recommend approving are:

1. **Platform**: stay on Astro + Cloudflare, no separate backend service for v1
2. **Storage**: use R2 for originals and derived assets
3. **Database**: use D1 for users, sessions, metadata, comments, and moderation state
4. **Auth**: invite-only app auth with secure cookie sessions, no mandatory Cloudflare Access in v1
5. **Uploads**: direct browser-to-R2 signed uploads
6. **Images**: generate thumbnail and preview derivatives
7. **Videos**: accept short uploads, generate poster thumbnail, no transcoding in v1
8. **MVP scope**: gallery, upload, detail page, comments, hide/delete, and day tagging

## Immediate next build steps

If implementation begins now, the next concrete work items should be:

1. update deployment architecture notes for dynamic features
2. create D1 schema and Wrangler bindings
3. scaffold `/memories` pages and `/api` endpoints
4. apply D1 schema to both local and remote Cloudflare environments
5. build direct-to-R2 upload flow
6. build gallery and comments UI
7. seed with test media and run mobile upload tests

That is the shortest practical path to a reliable feature rather than a speculative one.
