---
sidebar_position: 2
title: Guidelines
---

# App guidelines

A few standards keep the catalog high-quality and every app safe to run.

## Must

- **Renders cleanly.** `gdn validate` passes for every page.
- **No secrets.** Never commit API keys. Declare an `api_key` input and read it from
  `ctx.inputs`, see [HTTP requests](/docs/reference/http).
- **Assets live in `assets/`.** Every image the app uses sits in the app's `assets/`
  folder and is listed under `assets:` in the manifest. Keep them small PNGs. Nothing
  is loaded from outside `assets/`.
- **Preview images.** Every app ships a `preview/` folder with a render of each page
  (plus `preview.png`, the catalog thumbnail). You don't make these by hand: Studio's
  **Validate** and **Validate & Submit** generate them for you, so just run one before
  you submit.
- **Sensible refresh.** Use the slowest `refresh` that still looks live, `3600` for
  hourly data, `60`-`300` for fast-moving data.
- **Clear metadata.** A real `name`, a one-line `description`, and an `author`.

## Should

- **Readable at 32px.** Favor big fonts and high-contrast colors; test tiny text on
  the real panel size in preview.
- **Helpful inputs.** Give each input a clear `label`, a good `default`, and a `help`
  hint. Pick the right [input type](/docs/reference/input-types).
- **Degrade gracefully.** If an input is blank, fall back to a sane default rather
  than drawing nothing.

## Naming

- App `id`: lowercase, hyphens, no spaces (`local-aqi`, not `Local AQI`).
- Keep it descriptive, it's the folder name and the endpoint.
