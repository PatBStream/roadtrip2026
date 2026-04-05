Build the first working version of the Roadtrip2026 website in this repository.

Context files to read first:
- GOAL.md
- docs/project-brief.md
- docs/itinerary.md
- AGENTS.md
- SOUL.md
- USER.md
- TOOLS.md
- MEMORY.md

Approved defaults already chosen by Pat:
- Use Astro if package installation works; if Astro setup is blocked, fall back to a plain static HTML/CSS/JS site, but keep the same information architecture.
- Multi-page, static-first architecture
- Tone: travel brochure + practical planner hybrid
- Tesla Model Y charging plan should be realistic but clearly labeled as estimates where needed
- Superchargers preferred

What to build now:
1. Set up the site scaffold
2. Create a shared layout/navigation
3. Add pages for:
   - Home
   - Overview / About the trip
   - Daily plans (either one page per day or a strong day-detail experience)
   - Charging plan
   - Map
4. Use the itinerary content from docs/itinerary.md
5. Reuse the local route66-itinerary images where sensible
6. Create a clean, modern, responsive design
7. Keep content/data organized so later changes are easy
8. If possible, include a Google Maps route link or a clearly marked placeholder assembled from the itinerary stops
9. Add a concise README section or project notes describing how to run the site locally

Implementation guidance:
- Prefer reusable data-driven structures
- Keep accessibility in good shape
- Do not delete or overwrite the source itinerary images
- Do not over-engineer the map; a well-structured map page with route data and a handoff link is fine for v1
- If exact charging-stop details need future validation, add a useful, well-reasoned preliminary plan now and label assumptions
- Avoid unnecessary dependencies

When done:
- Run any available build/check command and fix obvious issues
- Summarize what you changed in the final output
- Then run this exact command to notify me immediately:
openclaw system event --text "Done: Roadtrip2026 v1 site scaffold is built" --mode now
