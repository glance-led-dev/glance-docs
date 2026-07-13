---
sidebar_position: 4
title: manifest.yaml
---

# `manifest.yaml` reference

The manifest describes your app: its identity, its canvas, its pages, and the
inputs a user fills in. Every field is listed below.

```yaml
gdn: 1
id: local-aqi
version: 0.1.0
name: Local AQI
author: your-name
description: Air quality for a US zip code.
entry: app.star
width: 128
height: 32
refresh: 300
pages: [now, health]
inputs:
  - key: zip
    type: string
    app_input_type: free-text
    label: Zip code
    default: "90210"
    help: A US zip code.
assets:
  - leaf.png
```

## Top-level fields

| Field | What it is |
|---|---|
| `id` | Folder name under `apps/` (lowercase, hyphens, no spaces). |
| `name` | The title people see when adding your app. |
| `author` | Your name or handle. |
| `description` | One line about what it shows. |
| `category` | The kind of app, used to group it in the catalog (e.g. `Sports`, `Finance`, `Weather`, `Lifestyle`, `Time`, `News`, `Entertainment`, `Science`, `Fun`). |
| `entry` | The code file, usually `app.star`. |
| `width` / `height` | Panel size in pixels. Height is always 32. A single panel is 64 wide and panels daisy-chain, up to 384 wide; for best performance keep to 192 or smaller and split content across pages. |
| `refresh` | Seconds between refreshes (`3600` = hourly). |
| `pages` | Ordered list of screens, e.g. `[now, health]`. See [Pages](/docs/guides/pages). |
| `assets` | PNG files your app draws with `c.image()`. Every drawn image must be listed. |
| `inputs` | The user's setup form, see below. Omit if your app needs none. |

## Inputs

Each input becomes one control on the user's setup form.

| Field | What it is |
|---|---|
| `key` | The name your code reads, `ctx.inputs["zip"]`. No spaces. |
| `label` | What the user sees next to the control. |
| `app_input_type` | Which control to show, see [Input types](/docs/reference/input-types). |
| `type` | The data type: `string`, `number`, or `choice`. |
| `default` | Pre-filled value when the user leaves it blank. |
| `choices` | The option list, only for `dropdown` / `selection`. |
| `help` | A short hint shown under the control. |

:::tip
`app_input_type` is optional, leave it off and the form infers the control from
`type`. But setting it explicitly gives users the right widget (a date picker, a
color wheel, a toggle) instead of a plain text box.
:::
