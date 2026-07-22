---
sidebar_position: 2
title: Guidelines
read_time: 2
---

# App guidelines

A few standards keep the catalog high-quality and every app safe to run.

<figure className="figure">
  <img className="shot" src="/img/studio/validate-pill.png" alt="Studio's green status pill reading Looks good, pages draw cleanly" width="420" />
  <figcaption>Studio's <b>Validate</b> button checks all of this at once, green means you're ready to submit.</figcaption>
</figure>

## Must

- **Renders cleanly.** `gdn validate` passes for every page.
- **No secrets.** Never commit API keys. Declare an input with
  `app_input_type: api-key` (the type that stores the key encrypted) and read it
  from `ctx.inputs`, see [HTTP requests](/docs/reference/http).
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

Studio builds the `preview.png` for you, every page of your app stacked into one image:

<figure className="figure">
  <img className="led" src="/img/publish/example-preview.png" alt="A preview.png showing both pages of an app stacked vertically" width="300" />
  <figcaption>A two-page app's <code>preview.png</code>: each page at 5x, stacked. Validate or Submit generates it, so you never draw it by hand.</figcaption>
</figure>

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
