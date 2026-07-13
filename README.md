# Glance Developer Network — docs site

The developer documentation for GDN, built with [Docusaurus](https://docusaurus.io/)
and deployed to **Cloudflare Pages** at **glance-led.dev**.

## Local development

```bash
cd getting-started
npm install        # first time only
npm start          # live dev server at http://localhost:3000
```

The dev server hot-reloads as you edit anything in `docs/`, `src/`, or `static/`.

## Build (what Cloudflare runs)

```bash
npm run build      # static output in ./build
npm run serve      # preview the built output locally
```

## Deploy to Cloudflare Pages

Create a Pages project pointed at this repo with:

| Setting | Value |
|---|---|
| Root directory | `getting-started` |
| Build command | `npm run build` |
| Output directory | `build` |
| Node version | 18+ |

Then add the custom domain **glance-led.dev** in the Pages project settings.

## Structure

```
getting-started/
├── docs/                # all doc pages (Overview, Guides, Reference, Publish, Private apps)
│   ├── overview/  guides/  reference/  publish/  private-apps/
├── src/
│   ├── pages/index.js    # the landing page
│   └── css/custom.css    # brand theme (LED green, Montserrat, dark)
├── static/img/
│   ├── apps/             # real LED render PNGs (per app)
│   ├── diagrams/         # anatomy, flow, generator SVGs
│   └── logo.svg, favicon.svg
├── docusaurus.config.js  # title, nav, footer, domain
└── sidebars.js           # auto-generated from the docs/ folders
```

## Editing content

- Pages are Markdown/MDX in `docs/`. Section order comes from `_category_.json`
  files and each page's `sidebar_position` frontmatter.
- App render images live in `static/img/apps/<id>/`. To refresh them, copy new
  PNGs from `apps/<id>/preview/` (or run `gdn build`).
- Brand colors, fonts, and component styles are all in `src/css/custom.css`.
