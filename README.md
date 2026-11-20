# Golden Hour Vice — Cover Studio

[![gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/TUHIN729/gta6-cover-art-9/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/TUHIN729/gta6-cover-art-9/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An offline web app that turns your photo and a caption into GTA-style cover
art at golden hour — the warm editorial poster look, with a sun disc, palm
silhouettes and bold gold condensed lettering — exported as a PNG to share.
Built for the [make.fun gta6-cover-art-01 bounty](https://make.fun/bounty/gta6-cover-art-01).

## What it does

- **Three panels, one poster.** Editorial (hero on top, two below), Golden
  Grid (hero left, two stacked right) and Full Bleed (one photo, title over
  the dusk) — each with a masthead strip, cream gutters and a title block.
- **Any photo.** Load a photo into each panel, or fill all three with one
  photo. Drag a photo inside its panel to reframe it, scroll to zoom, or use
  the slider. Four canvas-drawn sample scenes are included, so it works with
  no upload at all.
- **Your words.** Edit the title, the script subtitle and the date line; the
  title is set in condensed black caps with a gold gradient and a teal
  outline, slightly tilted like a poster.
- **Three golden grades.** Golden Hour (amber + teal), Sunset Blaze
  (orange + plum) and Teal Dusk — each re-grades every panel, the masthead
  and the title block.
- **One-click export.** 1080×1080, 1080×1350 and 1920×1080 PNGs, straight
  from the browser. No upload, no network, no build step: `app/index.html`
  opens in desktop Chrome and works offline.

The sun disc, the palms, the skyline and the grain are all drawn in the app
itself, on canvas. The sample scenes under `app/src/samples.js` are drawn
too — no real person, no Rockstar artwork, no font files.

## Try it

```sh
node serve.ts
# open http://localhost:8080
```

## Files

- `app/index.html`, `app/style.css` — the editor page and its warm styling.
- `app/src/cover.js` — the cover engine: layouts, grades, masthead, title.
- `app/src/samples.js` — four procedural golden-hour scenes (boulevard,
  rooftop, pier, street), drawn on canvas.
- `app/src/main.js` — the editor wiring: uploads, drag/zoom, export.
- `app/src/shots.js` — fixed scenes for the screenshots.
- `main.ts` — the entry program: copies `app/` and `screenshots/` to
  `/output` and writes `/output/dossier.json`.

## License

MIT — see `LICENSE`.
