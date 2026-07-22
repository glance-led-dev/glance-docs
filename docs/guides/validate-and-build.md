---
sidebar_position: 7
title: Validate & build
read_time: 3
---

# Validate & build

Every app gets the same safety check before you share it: does every page render, are all
the assets declared, do the inputs work. You can run that check right in Studio, or from
the command line.

## In Glance Dev Studio

Open your app in [Glance Dev Studio](/docs/studio) and click **Validate** at the top. It
renders every page and runs the exact check publishing does, then shows the result in a
pill at the top of the window, with any details in the message console under the panel.

<figure className="figure">
  <img className="shot" src="/img/studio/validate-pill.png" alt="The Validate result reading 'Looks good, 1 page draws cleanly'" />
</figure>

When it passes, click **Validate & Submit** to open a pull request (see
[Check it and publish](/docs/studio/check-and-publish)). When it fails, the console names
the page and the reason, the same messages decoded [below](#common-failures-decoded).

## From the command line

Prefer the terminal? The same safety check runs with:

```bash
gdn validate apps/my-app
# prints PASS my-app  (1 page)

# or check every app at once:
gdn validate --all
```

Validation renders every page: if a page errors, references an
undeclared asset, or times out, you'll hear about it here rather than on the panel.

### Common failures, decoded

| The message says… | It means… |
|---|---|
| `manifest lists page 'x' but app.star has no function for it. Add: def x(c, ctx):` | Your `pages:` list and your function names don't match, add the function (or fix the spelling). |
| `font '4x6' not found. Available: …` | Typo in the font name; the message lists every valid one. Or run `gdn fonts`. |
| `asset 'x.png' not declared in manifest assets` | You drew an image without listing it under `assets:` in the manifest. |
| `asset not found (looked in app folder and assets/)` | It's declared, but the file isn't next to `app.star` (or in `assets/`). |
| `unknown color 'lime'` | Not a named color, the message lists them all; hex like `"#88ff00"` always works. |

Fix, save, and run again; validation is fast.

## Build

To produce the final artifacts (a PNG per page plus the panel's compressed `.bin`):

```bash
gdn build apps/my-app --input zip=10001
```

Output lands in `apps/my-app/build/`. You rarely need this by hand (the render
service does it), but it's handy for checking exact output.

## Render one page

```bash
gdn render apps/my-app --page 1 --input zip=90210 --out page1.png
```

Great for grabbing a screenshot of a single page with specific inputs; it's how
every render in these docs was made.

## Next

Once your app validates, it's ready to share:

<div className="cardGrid">
  <a className="card" href="/docs/publish/submit"><h3>Publish your app</h3><p>The pull-request flow, step by step.</p></a>
</div>
