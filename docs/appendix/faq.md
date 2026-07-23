---
sidebar_position: 1
title: FAQ
read_time: 4
---

# Frequently asked questions

Short answers to the things people ask most. Each links to the full detail.

## Building

### Do I need to know how to code?

No. You can describe an app in plain English and have an AI assistant write both
files for you — see [Build with AI](/docs/build-with-ai). You'll still preview it and
tweak it, but you don't have to write code from scratch.

### What language are apps written in?

[Starlark](/docs/reference/drawing-api), a small, sandboxed dialect that *looks* like
Python but isn't. A handful of Python things don't exist in it (no `import`, no
`while`, no `try`/`except`), which trips up hand-written and AI-written code alike —
see [Starlark vs Python](/docs/appendix/starlark-vs-python).

### Can I animate or scroll?

**Not yet.** Apps render as still frames today: each refresh draws one picture, and the
panel shows it until the next refresh. There's no per-frame animation or scrolling
marquee. It's on the roadmap and we'll prioritize it based on demand — if you want it,
let us know. For now, design for a still image and let the [refresh
timer](#how-often-does-my-app-update) show new data.

### How often does my app update?

However often you set `refresh:` (in seconds) in `manifest.yaml`. `60` is the practical
floor; `300` (5 min) is a good default; use `3600` for hourly data. The panel re-renders
on that timer. See [Handling time](/docs/guides/handling-time#how-often-your-app-redraws).

### Can my app remember data between updates?

No. Every render starts fresh and knows only its [inputs](/docs/reference/ctx#ctxinputs)
and [`ctx.now`](/docs/reference/ctx#ctxnow) — there's no storage that carries across
refreshes. If you need state, keep it in the data source you fetch from.

### How do I add or change a setting after I've made the app?

In [Studio](/docs/studio), the settings card has **+ Add setting**, or edit
`manifest.yaml` directly. Re-attaching a setting your code stopped reading is a
one-liner. See [Inputs & configuration](/docs/guides/inputs-and-config#adding-a-setting-to-an-app-you-already-made).

## Drawing and text

### Why is my text invisible?

The three usual causes, in order:

1. **It's lowercase.** The bitmap fonts have **no lowercase letters**, so lowercase
   draws nothing. Call `.upper()` on everything. (`gdn check` warns about this.)
2. **It's off-canvas.** The panel is 32 px tall; anything drawn past the edges is
   clipped. Check your `y` is `0–31` and `x` is within the panel width.
3. **It's the same color as the background** — e.g. black text after `c.clear()`.

More in [Troubleshooting → it runs but looks wrong](/docs/appendix/troubleshooting#it-runs-but-looks-wrong).

### Can I use lowercase letters?

No — there are no lowercase glyphs. Write in caps and `.upper()` anything from an input
or a feed.

## Live data and APIs

### How do I fetch live data?

`http.get(url)`, which returns a **dict** you read with `resp["status_code"]` and
`resp["json"]`. Full details and the failure-handling pattern in
[HTTP requests](/docs/reference/http).

### Where do I find APIs to use?

A great catalog of free ones is the community-maintained
[public-apis/public-apis](https://github.com/public-apis/public-apis) list. When you pick
one, favor APIs that:

- **return JSON** (easiest to read with `resp["json"]`),
- **answer fast** — each request has a [4-second timeout](/docs/appendix/limits#http),
- **need no key, or a simple key** — and if it needs one, collect it as an
  [`api-key` input](/docs/guides/inputs-and-config#api-keys).

### Why doesn't my API key work?

Almost always because it was collected as a `free-text` input. A key **must** use
`app_input_type: api-key` — that's what encrypts it and routes it correctly. Also, an
`api-key` key name can't contain `_` or `-` (use `apikey`). See
[API keys](/docs/guides/inputs-and-config#api-keys).

### My app fetched data before, then stopped — why?

Usually a [limit](/docs/appendix/limits): an app may make **8 uncached requests per
render**, and any request slower than **4 seconds** comes back as `status_code` `0`
rather than hanging the panel. A flaky or rate-limited API shows up exactly this way —
always draw a fallback when `status_code != 200`.

### Why does my clock show the wrong time?

`ctx.now` is **UTC**, not the viewer's local time — the panel doesn't know where it's
hanging. Convert with a UTC-offset input or a time API. See
[Handling time](/docs/guides/handling-time#showing-local-time).

## Publishing and limits

### How do I publish my app?

Validate it, then submit a pull request — from [Studio](/docs/studio/check-and-publish)
or `gdn submit`. See [Publish an app](/docs/publish/submit).

### Can I keep an app private?

Yes — [private apps](/docs/private-apps/) run just for you without going through the
public catalog.

### What are the size and speed limits?

Panels are up to 384 px wide and always 32 px tall; a render has time, request, and
draw-op caps. They're all collected in [Limits & performance](/docs/appendix/limits).

### I got an error I don't understand — where do I look?

[Troubleshooting](/docs/appendix/troubleshooting) maps the common error messages to what
they mean and how to fix them.
