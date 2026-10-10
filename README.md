# Azlan Foods — Opening Hours

A static website that shows which Azlan Foods restaurants are **open** or **closed** right now, based on each restaurant's weekly hours and time zone.

Live site: https://muhammada1012000-ui.github.io/open-status/

- Live "Open now", "Closing soon" or "Closed" badge on each restaurant, updated every 30 seconds
- "Open until…" and "Opens tomorrow at…" messages
- A count of how many restaurants are open, plus search and Open now / Closed filters
- Today's hours on every card, with the full week one click away
- Supports split shifts and hours past midnight
- Light and dark mode, works on phones

## Add or edit restaurants

Edit `config.js`. Each restaurant has a `name`, optional `cuisine`, `address`, `phone` and `timeZone`, and its `hours`. Copy one block to add another restaurant. No build step needed. Commit and push, and GitHub Pages updates the live site within about a minute.

## Run locally

Open `index.html` in a browser.
