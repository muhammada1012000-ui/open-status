# Are We Open?

A small static website that shows whether a business is currently **open** or **closed**, based on its weekly opening hours and time zone.

- Live open/closed badge that updates every 30 seconds
- "Open until…" / "Opens tomorrow at…" messages, plus a "closing soon" warning in the last hour
- Weekly hours table with today highlighted
- Supports split shifts and overnight hours
- Light and dark mode, works on phones

## Customize

Edit `config.js` to set your business name, time zone and hours. No build step needed.

## Run locally

Open `index.html` in a browser.

## Publish with GitHub Pages

In the repository on GitHub: **Settings → Pages → Build and deployment → Deploy from a branch**, choose `main` and `/ (root)`, then save. The site will appear at `https://<username>.github.io/open-status/`.
