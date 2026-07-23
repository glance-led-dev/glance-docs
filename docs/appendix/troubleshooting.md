---
sidebar_position: 2
title: Troubleshooting
read_time: 5
---

# Troubleshooting

Every error GDN raises names the file, line, and column, and often adds a plain-English
hint:

```text
error: Object of type `dict` has no attribute `status_code` (app.star:12:8)
  (hint: a dict is read with ["status_code"], not .status_code; http.get returns a dict)
```

You'll see these in the [Studio](/docs/studio) message console, in the live preview, and
from `gdn check apps/<id>`. This page maps the common ones to the fix.

## Errors in your code (`app.star`)

These stop the render. The message is the part after `error:`.

| The message says | What it means | Fix |
|---|---|---|
| `cannot use reserved keyword import` | Starlark has no imports or libraries | Delete the `import`. Everything is handed to you as `c`, `ctx`, `http`, `math`, `fmt`. See [Starlark vs Python](/docs/appendix/starlark-vs-python). |
| `cannot use reserved keyword while` | There are no `while` loops | Use `for i in range(n):`. |
| `cannot use reserved keyword try` | Starlark has no exceptions | Guard with `if` instead — check `status_code`, check for `None`. |
| `Variable datetime not found` (or `random`, `os`, `time`…) | You reached for a Python module that doesn't exist | Use the built-ins: [`ctx.now`](/docs/reference/ctx#ctxnow) for time, the [`math`](/docs/appendix/starlark-vs-python#what-is-available) struct for math. |
| `Object of type dict has no attribute status_code` | You wrote `resp.status_code` on an `http.get` result | It's a **dict**: `resp["status_code"]`. Same for `ctx.inputs` — use `ctx.inputs["key"]` or `.get("key")`. See [HTTP](/docs/reference/http). |
| `Operation + not supported for types string and int` | You joined text and a number | Wrap the number: `"N" + str(n)`. |
| `Index N is out of bound` | You indexed past the end of a list | Check `len(...)` first, or guard the index. |
| `Floor division by zero` | A `//` or `%` had a zero on the right | Guard the denominator before dividing. |
| `unknown font '9x9'` | That font name isn't bundled | Use a real one (`"5x7"`, `"8x12"`, …); run `gdn fonts` to list them, or see [Fonts](/docs/reference/fonts). |
| `bad color 'purpel'` | Misspelled or unknown color | Use a valid name, a hex like `"#ff8800"`, or an `(r, g, b)` tuple. See [Colors](/docs/reference/drawing-api#colors). |
| `op limit (4096) exceeded on a single page` | One page issued too many draw calls | Draw less per page, or split across [pages](/docs/guides/pages). See [Limits](/docs/appendix/limits#drawing). |
| `render timed out (>30s)` | The render ran too long — usually a runaway loop | Remove the infinite loop; keep `for` ranges bounded. See [Limits](/docs/appendix/limits#time). |

## Validation warnings and errors (`gdn check` / **Validate**)

These come from checking the app as a whole, not from running your code. Errors block
publishing; warnings don't, but most are worth fixing.

| The message says | What it means | Fix |
|---|---|---|
| `page X has no matching def X(c, ctx)` | The manifest lists a page your code doesn't draw | Add `def X(c, ctx):` in `app.star`, or remove `X` from `pages:`. |
| `setting k is declared but never used in app.star` | A manifest input your code never reads | Read it with `ctx.inputs.get("k", ...)`, or delete it from the manifest. In Studio, the [**Use it in my code**](/docs/studio/see-it-live#not-used-in-code) button does this for you. |
| `draws x.png but it's not listed under assets:` | You drew an image you didn't declare | Add the filename under `assets:` in the manifest. See [Working with images](/docs/guides/working-with-images). |
| `text "..." has lowercase; fonts are UPPERCASE-only` | Lowercase text draws nothing | `.upper()` the string. |
| `input key k must be letters and digits only` | An input name has `_`, `-`, or a bad first character | Rename it (`tzoffset`, not `tz_offset`). Required for `api-key` inputs. See [Inputs](/docs/guides/inputs-and-config#api-keys). |
| `width must be 1-384` | Panel too wide | Pick `64`, `128`, `192`, up to `384`. Height is always `32`. |
| `refresh Ns is very fast` | Refresh under ~60s | Raise it — `60`+ is easier on data sources. See [Limits](/docs/appendix/limits#refresh). |
| `unknown manifest key` | A typo'd or unsupported manifest field | Check the spelling against the [manifest reference](/docs/reference/manifest). |

## It runs but looks wrong

No error, but the panel isn't what you expected.

| Symptom | Likely cause | Fix |
|---|---|---|
| **Text is invisible** | Lowercase (fonts are uppercase-only), drawn off the 32px-tall canvas, or the same color as the background | `.upper()` it; check `x`/`y` are on-panel; use a contrasting color |
| **Only part of the text shows** | It's wider than the panel | Use a smaller font, `c.text_wrapped`, or shorter text. See [Text layout](/docs/reference/helper-functions#text-layout) |
| **Nothing draws at all** | The page function never ran, or its name doesn't match `pages:` | Make sure the manifest's page name matches the `def` name exactly |
| **The last frame won't clear** | You didn't start with `c.clear()` | Begin each page with `c.clear()` |
| **The clock/date is off by hours** | `ctx.now` is UTC, not local | Convert with an offset or a time API — see [Handling time](/docs/guides/handling-time#showing-local-time) |
| **Live data never appears** | The fetch failed and there's no fallback | Check `resp["status_code"] != 200` and draw a fallback. See [HTTP](/docs/reference/http) |

## Still stuck?

- Run `gdn check apps/<id>` for the full list of problems at once.
- In Studio, the **Debug** button (bottom-right) keeps a copyable log of failed requests.
- The [live preview](/docs/studio/see-it-live) catches most of the "looks wrong" issues in seconds — including [time travel](/docs/studio/see-it-live#time-travel) for date-driven apps.
