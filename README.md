# Road Trip 2026

Interactive Route 66-style road trip site for a May 2026 drive from Palm Springs to Chicago.

## Stack

- Astro
- Cloudflare adapter/runtime
- Static-first trip-planning pages
- Lightweight memories app layer for uploads/comments

## Run locally

```bash
npm install
npm run dev
```

Default local URL:

- <http://localhost:53000>

For phone testing on your local network, use your laptop IP with port `53000`.

## Cloudflare-style preview

```bash
npm run preview
```

## Build

```bash
npm run build
```

## Source notes

- Original planning brief: `GOAL.md`
- Extracted itinerary: `docs/itinerary.md`
- Project defaults / scope: `docs/project-brief.md`
- Verified planning links: `docs/verified-stop-links.md`
- Prototype photo-source notes: `docs/photo-sources.md`
- Memories feature plan: `IMPLEMENTATION.md`
- Local phone-testing notes: `docs/local-testing.md`
- Invite seeding notes: `docs/invite-seeding.md`
- MVP status: `docs/mvp-status.md`

## Current scope

Trip-planning side:

- Home page
- Daily plan index + per-day detail pages
- Charging plan page
- Map / Google Maps handoff page

Memories MVP side:

- Invite-only sign-in
- Upload photos and short videos
- Memories gallery
- Memory detail page
- Comments
- Logout

Charging data is intentionally labeled as estimated and should be re-validated in Tesla navigation closer to departure.
