---
sidebar_position: 3
title: HTTP requests
read_time: 5
---

# HTTP requests (`http.*`)

Every `app.star` gets a global `http` struct for fetching live data. You call it,
but the GDN host makes the actual network request; your Starlark code stays
fully sandboxed and only ever sees the response data. The host adds a hard timeout
and response caching, so a slow or flaky endpoint can't hang a render and repeated
renders don't overload an API.

```python
def main(c, ctx):
    resp = http.get("https://api.coingecko.com/api/v3/simple/price",
                    params = {"ids": "bitcoin", "vs_currencies": "usd"})
    if resp["status_code"] == 200 and resp["json"] != None:
        c.text("$" + fmt.commas(int(resp["json"]["bitcoin"]["usd"])),
               4, 10, font = "8x12", color = "white")
    else:
        c.text("NO DATA", 4, 12, font = "5x7", color = "red")
```

## `http.get(url, headers = {}, params = {}, ttl_seconds = 300)`

| Argument | Type | What it does |
|---|---|---|
| `url` | string | The endpoint. Must start with `http://` or `https://`. |
| `headers` | dict | Request headers, e.g. `{"x-api-key": key}`. Optional. |
| `params` | dict | Query parameters, appended to the URL for you. Optional. |
| `ttl_seconds` | int | How long the response may be served from cache. Default `300` (5 minutes). Pass `0` to always refetch. |

## The response

`http.get` returns a dict:

| Key | Type | Meaning |
|---|---|---|
| `status_code` | int | The HTTP status (`200`, `404`, ...), or `0` if the request never completed (timeout, DNS failure, connection refused). |
| `body` | string | The raw response text. Empty when `status_code` is `0`. |
| `json` | any | The body decoded as JSON, or `None` if the body isn't valid JSON. |
| `error` | string | `None` normally; a short message when `status_code` is `0`. |

:::warning[It's a dict — read it with `["..."]`, not `.`]
Read the response with subscripts: `resp["status_code"]`, `resp["json"]`,
`resp["body"]`. The dotted form from Python's `requests` library —
`resp.status_code` — does **not** work; Starlark dicts have no attribute access, so
it fails with *"Object of type `dict` has no attribute `status_code`"*. If an AI
assistant wrote your app, this is the single most common thing to fix.
:::

Check the response before you draw.

```python
resp = http.get(url)
if resp["status_code"] != 200 or resp["json"] == None:
    c.text("NO DATA", c.width // 2, 12, font = "5x7", color = "red", align = "center")
    return
data = resp["json"]        # already decoded, index it directly
```

Network trouble never crashes your app. You always get a response back. A
`status_code` of `0` (with `resp["error"]` explaining why) means the request
couldn't complete, and any non-`200` status means the server returned an error. Draw a
fallback and return.

## API keys

Declare the key as an `api-key` input — never free text; only
`app_input_type: api-key` values are stored encrypted (see
[Inputs & configuration](/docs/guides/inputs-and-config#api-keys)). Name the input
without underscores or hyphens (`apikey`, not `api_key`) — `_` and `-` are the
descriptor's delimiters and validation rejects api-key keys that contain them.
Read it from `ctx.inputs` and pass it wherever your provider expects it, a header
or a query parameter:

```python
key = ctx.inputs.get("apikey", "")
resp = http.get("https://api.example.com/v1/data",
                headers = {"x-api-key": key},        # header style
                params = {"appid": key})             # or query-param style
```

:::danger[Treat API keys as compromised]

Glance stores the keys people enter into `api-key` inputs encrypted, and they are
decrypted only on Glance's servers to run your app. A key entered through a
`free-text` input gets none of this protection. Even so, treat any API key as
if it could leak:

- **Rotate keys regularly** and assume a key could be exposed. Decryption by a bad actor
  is never impossible, however well a key is secured.
- **Glance is not responsible** for leaked keys, or for any usage or charges on a
  third-party API. We secure stored keys as best we can, but nothing is fully safe in a
  world of capable attackers and AI tooling.
- **Be careful with paid keys**, both when you build an app and when you prompt users to
  enter their own. A leaked key can run up real charges.

:::

## Caching

Responses are cached by `(url, params, headers)` for `ttl_seconds`. Within that
window, repeated renders reuse the stored body instead of refetching, which also
works offline. Only successful (2xx) responses are cached, so a failed response is
never served from cache. Match `ttl_seconds` to your data: `300` for prices,
`3600` for weather, `0` only if every render needs a fresh fetch.

## Timeouts and limits

- Each request has a hard 5 second timeout. A slow endpoint comes back as
  `status_code: 0` instead of hanging the panel, so pick APIs that answer quickly.
- An app may make at most 8 uncached requests per render. Cache hits don't
  count. Exceeding it stops the render with a clear error.
- Response bodies are capped at 1 MB. Panel apps need kilobytes; if you're
  fetching more, find a smaller endpoint.
- Only `GET` is available. Panel apps read data; they don't post it.

## See it used end to end

The [Bitcoin price example](/docs/guides/btc) is a complete app, manifest, logo,
fetch, parse, draw, built around one `http.get` call.
