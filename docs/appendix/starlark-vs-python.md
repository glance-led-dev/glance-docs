---
sidebar_position: 3
title: Starlark vs Python
read_time: 3
---

# Starlark vs Python

`app.star` is written in **Starlark**, a small, sandboxed language that looks like
Python and reads like Python — but isn't Python. It's what keeps every app fast and
safe to run. Most Python you'd write just works; this page is the short list of things
that *don't*, because they're what trips up hand-written and AI-written code alike.

## The things that aren't there

Each of these is a real error, with what to use instead.

| You might write | What happens | Use instead |
|---|---|---|
| `import ...` | `cannot use reserved keyword import` | Nothing to import — `c`, `ctx`, `http`, `math`, `fmt`, `color` are handed to you. |
| `import datetime` / `datetime.now()` | `Variable datetime not found` | [`ctx.now`](/docs/reference/ctx#ctxnow) (nine time fields, UTC). |
| `import random` | `Variable random not found` | Derive variety from `ctx.now` or your data; there's no RNG. |
| `while x:` | `cannot use reserved keyword while` | `for i in range(n):` — Starlark has `for`, not `while`. |
| `try: … except:` | `cannot use reserved keyword try` | **No exceptions exist.** Guard with `if` — check `status_code`, check for `None`. |
| `f"value {x}"` | f-strings are off in this dialect | `"value " + str(x)`, `"value %s" % x`, or `"value {}".format(x)`. |
| `set([1, 2])` | `Variable set not found` | Use a `list`, or a `dict` for uniqueness. |
| `class Foo:` | classes aren't supported | `struct(name="Foo", n=1)` for a simple record. |
| `"5".zfill(3)` | `string has no attribute zfill` | [`fmt.pad(5, 3)`](/docs/guides/handling-time#formatting-there-is-no-strftime). |

The rule of thumb: **there is no standard library and no file, network, or system
access.** The only way out to the network is [`http.get`](/docs/reference/http).

## What *is* available

Plenty. All of this works exactly like Python:

- **Control flow:** `for` loops, `if` / `elif` / `else`, `break`, `continue`, and
  recursion (functions can call themselves).
- **Comprehensions:** list `[x*2 for x in range(3)]` and dict `{k: v for ...}`.
- **Functions & lambdas:** `def`, default args, `lambda a: a + 1`.
- **Strings:** `.upper()`, `.split()`, `.replace()`, `.startswith()`, `.strip()`,
  `.find()`, slicing, `%`-formatting, and `.format()`.
- **Numbers & sequences:** `int`, `float`, `str`, `bool`, `abs`, `len`, `range`,
  `enumerate`, `reversed`, `sorted`, `min`, `max`, `zip`, tuple unpacking, `//` for
  integer division.
- **`print(...)`** for debugging — output shows in the Studio message console.
- **`json`** — `json.encode(...)` / `json.decode(...)` if you ever need it (usually
  `resp["json"]` already did it for you).

## The globals your app is handed

You never import these; every page function can use them directly:

| Name | What it is |
|---|---|
| `c` | The [canvas](/docs/reference/drawing-api) — all the `c.*` draw calls. |
| `ctx` | [Inputs, the clock, and panel size](/docs/reference/ctx). |
| `color` | Named colors and [`color.dim`](/docs/reference/helper-functions#colors-the-color-struct). |
| `math` | `pi`, `sin`, `cos`, `tan`, `sqrt`, `pow`, `floor`, `ceil`, `atan2`, … (the module you'd `import math` for). |
| `fmt` | `fmt.pad(n, width)` and `fmt.commas(n)` — the closest thing to `strftime`/number formatting. |
| `http` | [`http.get`](/docs/reference/http) for live data. |

## One more difference: apps are stateless

An app can't remember anything between renders. Each refresh runs your code fresh, with
just its [inputs](/docs/reference/ctx#ctxinputs) and [`ctx.now`](/docs/reference/ctx#ctxnow);
there are no module-level variables that persist, no globals you can mutate across
refreshes, and no on-device storage. If you need state, keep it in the data source you
fetch from.

## See also

- [The drawing API](/docs/reference/drawing-api) — what `c.*` can do.
- [Troubleshooting](/docs/appendix/troubleshooting) — the exact errors and their fixes.
- [Limits & performance](/docs/appendix/limits) — the guardrails a render runs under.
