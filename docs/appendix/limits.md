---
sidebar_position: 4
title: Limits & performance
read_time: 3
---

# Limits & performance

A GDN app runs inside a sandbox with hard guardrails, so one app can never hang the
panel or overload a data source. Most apps never come close to any of these — but when
a render stops unexpectedly, it's usually one of them. Here they all are in one place.

## Canvas

| Limit | Value |
|---|---|
| Height | Always **32 px**. |
| Width | **1–384 px**. One panel module is 64 px wide; they daisy-chain (64, 128, 192, …). |
| Recommended width | Keep images to **192 px or smaller** for best performance, and split content across [pages](/docs/guides/pages) instead of going very wide. |

Anything drawn outside the canvas is clipped — it's not an error, it just doesn't show.

## Drawing

Each **page** may issue at most **4096 draw operations**. Every `c.*` call is one op (a
helper like `c.table` expands into several). Go over and the render stops with:

```text
error: op limit (4096) exceeded on a single page
```

If you hit it, you're almost certainly drawing per-pixel where a shape or helper would
do — or you should [split the screen across pages](/docs/guides/pages).

## Time

Each render is killed if it runs longer than **30 seconds** of wall-clock time:

```text
error: render timed out (>30s) — possible infinite loop
```

That budget has to cover any `http.get` calls too (each with its own timeout, below), so
in practice your own code should finish in well under a second. This limit exists to
stop runaway loops — the usual trigger is a loop that never terminates.

On Glance's servers a render also runs under a **CPU cap (~25 CPU-seconds)** and a
**memory cap (~512 MB)**. Local previews on your own machine don't apply the CPU/memory
caps, so an app that's fine locally can still hit them once published — keep renders
light.

## HTTP

[`http.get`](/docs/reference/http) is the only network access, and it's bounded:

| Limit | Value | What happens at the edge |
|---|---|---|
| Requests per render | **8 uncached** | A 9th raises `http limit: at most 8 …`. **Cache hits don't count.** |
| Per-request timeout | **~4 seconds** | A slower endpoint returns `status_code` `0` (with `resp["error"]` set) instead of hanging. |
| Response size | **1 MB** | Larger bodies are truncated. Panel apps need kilobytes — pick a smaller endpoint. |
| Method | **GET only** | Panel apps read data; they don't post it. |
| Default cache | **300 s** (`ttl_seconds`) | 2xx responses are cached by `(url, params, headers)`; repeat renders reuse them. |

Because a slow API surfaces as `status_code` `0`, **always draw a fallback** when
`resp["status_code"] != 200`. Pick APIs that answer quickly — see
[where to find them](/docs/appendix/faq#live-data-and-apis).

## Refresh

`refresh:` in the manifest sets how often the panel re-renders, in seconds:

| Value | Use |
|---|---|
| `60` | The practical floor — `gdn check` warns below it (`refresh Ns is very fast`). |
| `300` | A good default (5 minutes). |
| `3600` | Hourly data (weather, once-a-day counts). |

A fast refresh doesn't make a still frame animate — it just re-fetches and redraws more
often, which is harder on your data source and rarely needed. See
[How often your app redraws](/docs/guides/handling-time#how-often-your-app-redraws).

## Inputs

An app may make **8 uncached requests per render** regardless of how many inputs it has,
and there's no fixed cap on the number of inputs — but every declared input must be
[read by your code](/docs/guides/inputs-and-config), or validation fails it.

## See also

- [Troubleshooting](/docs/appendix/troubleshooting) — what each limit's error looks like.
- [HTTP requests](/docs/reference/http) — caching and failure handling in full.
- [manifest.yaml](/docs/reference/manifest) — where `width`, `refresh`, and the rest live.
