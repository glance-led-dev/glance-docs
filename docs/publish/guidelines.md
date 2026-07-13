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
- **Declared assets.** Every PNG you draw is listed under `assets:` and kept small.
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
