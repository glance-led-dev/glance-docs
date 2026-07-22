---
sidebar_position: 2.5
title: The ctx object
read_time: 3
---

# The `ctx` object

Every page function is called with two arguments: the canvas
[`c`](/docs/reference/drawing-api), which you draw with, and `ctx`, which is
everything your app knows about the world it's drawing into.

```python
def main(c, ctx):
    c.clear()
    c.text(ctx.inputs.get("msg", "HELLO").upper(), 4, 12, font="5x7", color="white")
```

`ctx` has four fields. That's the complete list — there's nothing else on it.

| Field | What it is |
|---|---|
| `ctx.inputs` | The values the user filled in on the setup form. |
| `ctx.now` | The current time, as nine integers (UTC). |
| `ctx.width` | Panel width in pixels, from the manifest. |
| `ctx.height` | Panel height in pixels. Always `32`. |

## `ctx.inputs`

A dictionary keyed by the `key` of each input you declared in `manifest.yaml`. Read it
with `.get(key, fallback)` so a blank or missing value degrades into something drawable
instead of erroring:

```python
zip_code = ctx.inputs.get("zip", "90210")
units    = ctx.inputs.get("units", "metric")
```

Values come back as strings, except `type: number` inputs, which come back as an `int`
(or a `float` if they aren't whole). An input the user left blank falls back to the
`default` from your manifest before your code ever sees it.

Every key you declare **must** be read somewhere in `app.star` — validation fails an app
with a setting its code never uses. See
[Inputs & configuration](/docs/guides/inputs-and-config).

## `ctx.now`

Nine integers describing the moment the panel is drawing, **always in UTC**, and frozen
for the whole render:

| Field | Range | Notes |
|---|---|---|
| `ctx.now.unix` | | Seconds since 1 Jan 1970. Use this for any arithmetic. |
| `ctx.now.year` | | e.g. `2027` |
| `ctx.now.month` | 1–12 | January is `1` |
| `ctx.now.day` | 1–31 | |
| `ctx.now.hour` | 0–23 | 24-hour |
| `ctx.now.minute` | 0–59 | |
| `ctx.now.second` | 0–59 | |
| `ctx.now.weekday` | 0–6 | Monday is `0` |
| `ctx.now.yday` | 1–366 | 1 Jan is `1` |

There's no date type, no `strftime`, and no timezone. For local time, formatting,
countdowns and day names, see **[Handling time](/docs/guides/handling-time)**.

## `ctx.width` and `ctx.height`

The panel size your manifest asked for. `ctx.width` matches
[`c.width`](/docs/reference/drawing-api) — use either, and use them instead of writing
`128` into your code, so the same app still lays out correctly on a wider sign.

```python
def main(c, ctx):
    c.clear()
    c.hline(0, 16, ctx.width, "green")     # spans any panel width
```

## What `ctx` doesn't have

There's no location, no timezone, no device id, no user name, and no way to store
anything between renders. Each render starts fresh and knows only what's in the table
above. If your app needs something about the user, ask for it as an
[input](/docs/reference/input-types) or fetch it over
[HTTP](/docs/reference/http).
