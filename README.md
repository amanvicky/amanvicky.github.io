# amanvicky.github.io

Personal portfolio of **Aman Elugam** — agentic AI systems that end in decisions, not vibes.

**Live:** https://amanvicky.github.io

Zero-framework static site: `index.html` + `styles.css` + `script.js`. No build step, no dependencies.

## Pages

| Page | What it is |
|---|---|
| `/` | Home — boot-sequence hero, live GitHub stats, featured projects |
| `/genesis.html` | Case study: the Genesis venture-intelligence engine |
| `/leyp.html` | Case study: the job-hunt copilot |
| `/godmode.html` | Case study: GOD MODE, the AI software company in a Claude skill |
| `/404.html` | Terminal-styled 404 |

## Themes

Nine switchable themes — terminal, paper, synth, ocean, ember, rose, mono, midnight, solar — cycled from the footer, persisted in `localStorage`, applied on every page before first paint so there's no flash.

## Features

- Dark terminal aesthetic with typing animation and scroll reveals
- Featured projects with live GitHub star counts (graceful static fallback)
- `prefers-reduced-motion` respected
- Mobile-first responsive

## Local dev

Open `index.html` in a browser, or serve it:

```bash
python -m http.server 8000
```

## Deploy

Pushes to `main` auto-serve via GitHub Pages (user site repo).
