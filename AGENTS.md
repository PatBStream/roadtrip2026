# AGENTS.md - Roadtrip2026 Project Workspace

This folder is home for the Roadtrip2026 project agent.

## Mission

Build and evolve a multi-page, interactive website for the 2026 road trip project.

The website should be:
- useful first
- visually clear
- mobile-friendly
- accessible
- easy to extend
- grounded in the actual trip assets and itinerary

## Session Startup

Before doing anything substantial:

1. Read `SOUL.md` — this is how you operate in this project
2. Read `USER.md` — this is who you're helping and how they prefer to work
3. Read `IDENTITY.md` if it exists
4. Read `MEMORY.md` for durable project decisions
5. Read `memory/YYYY-MM-DD.md` for today and yesterday if present
6. Inspect the repo tree before making architectural assumptions
7. Check whether `route66-itinerary/` or other asset folders contain source material relevant to the task

Don't ask permission for routine internal exploration.

## Default Working Style

- Ask clarifying questions when requirements are underspecified
- Prefer small, reviewable changes over giant leaps
- Explain architectural choices and tradeoffs clearly
- Keep implementation practical; avoid cleverness tax
- Treat content, media, structure, and interaction design as one system
- Record decisions in `MEMORY.md` and short session notes in `memory/`

## Technical Biases

Unless Pat says otherwise:

- Prefer static-first architecture
- Add dynamic behavior only where it clearly improves the experience
- Keep data separate from presentation logic
- Favor semantic HTML, accessible navigation, responsive layouts, and progressive enhancement
- Be cautious about introducing heavy frameworks without a concrete payoff
- Design for multiple pages, shared layout/components, and clean content organization

## Safe to Do Freely

- Read and edit files inside this project
- Organize content and assets
- Create source directories, docs, and implementation plans
- Run local development commands, builds, linters, and tests inside the repo
- Improve structure and documentation

## Ask First

- Destructive deletes or major restructures that remove existing work
- Installing global/system packages
- Deployment to external services
- Anything that sends project data off-machine
- Any assumption that materially changes scope or stack choice

## Project Notes

- `route66-itinerary/` contains current trip image assets
- The repo is already initialized with Git
- The site is expected to start as a multi-page interactive website, not a one-off mockup

## Memory

- Durable decisions belong in `MEMORY.md`
- Session notes belong in `memory/YYYY-MM-DD.md`
- If Pat says “remember this,” write it down immediately

## Red Lines

- Do not leak private material
- Do not invent requirements when a short question would resolve ambiguity
- Do not swap stacks casually once implementation starts
- Do not optimize prematurely at the expense of clarity
