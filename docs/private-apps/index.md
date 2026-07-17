---
sidebar_position: 1
title: Private apps
slug: /private-apps/
---

# Private apps

Install an app for just yourself or your organization, without publishing it to the
public catalog or going through review.

## Point a Glance Scroll at your own image

The fastest private app: give a Glance Scroll an image URL and it displays that picture,
refreshing on the schedule you choose. No code, no pull request, no review. It is made
for things you already generate as a PNG or JPG on your own server - a personal logo, a
sign, a room label, a fun graphic.

**Use any language or tool you like.** There is no SDK, no Starlark, and no Python
required. Glance only cares that your URL returns a `.png` or `.jpg` - generate that image
however you want, in whatever language or framework you already use. Your Glance Scroll
simply fetches it and shows it.

**Need somewhere to host it?** You do not need much, and most options are free:

- **[Cloudflare Pages](https://pages.cloudflare.com)** is the easiest for a **static
  image** (a logo, a fixed sign). Put your `.png`/`.jpg` in and you get a public URL in a
  few minutes on the free plan. This
  [Cloudflare Pages walkthrough](https://www.youtube.com/watch?v=mzNpuj4T66Q) is a good
  start, and an AI assistant can scaffold the whole thing for you.
- **[Cloudflare Workers](https://workers.cloudflare.com)** suits a **dynamic image** you
  generate on the fly (a live score, changing data). A Worker is a small piece of code
  that runs on Cloudflare's edge and returns your image on each request - the free plan is
  generous and it deploys in a few minutes.
- **[Render](https://render.com)** spins up a small web service in almost any language;
  search YouTube for
  [deploy a web app on Render](https://www.youtube.com/results?search_query=deploy+web+app+on+render)
  or read [Render's docs](https://render.com/docs).
- **A Raspberry Pi** on your own network works too - run a tiny web server at home that
  returns your image.

Either way, the only requirement is a public URL that ends in `.png` or `.jpg`. Not sure
where to start? An AI assistant can generate the whole thing for you.

You provide:

- your Glance Scroll's **MAC address**,
- a public image **URL** (`http://...`, ending in `.png`, `.jpg`, or `.jpeg`),
- the **width** (up to 192) and a **refresh interval**.

Your Glance Scroll fetches that image **directly over your own network** and caches it
**on the device itself**. Glance's servers store your URL so the Glance Scroll knows
where to look, but the picture is never uploaded to, stored on, or proxied through
Glance - it lives only in your Glance Scroll's own memory.

:::note[Why it uses plain http, and why that is safe here]
Glance Scrolls are small devices without the memory for TLS, so the fetch is plain
`http`, not `https`. For this feature that is completely fine: your Glance Scroll only
**displays a public picture** and **sends no data** of its own, so there is nothing
private in transit to protect. Encryption matters when you send passwords or personal
details - here you send nothing and show something that is already public. The only rule
that follows from it is the caution below: keep the image itself public and non-sensitive.
:::

:::danger[Read this before you use it - proceed at your own risk]

**Treat every image as fully public. Never point a Glance Scroll at anything you would
not be comfortable a complete stranger seeing or logging.**

- **The image comes from YOUR server.** Every PNG/JPG is generated and hosted by you.
  Glance does not make, store, or proxy the image, and **Glance is not responsible for
  any leak** of whatever you choose to publish this way.
- **The URL is stored on Glance's servers in plain `http`** (not `https`), on purpose:
  the Glance Scroll is memory-constrained and TLS will not fit. That is acceptable here
  because the URL only points at a **public picture** - you are not submitting any
  personal data through it - but it does mean the URL itself is **not secret**.
- **Anyone who learns the URL can view the image.** Think of it like a public repo:
  anyone can reach it. You have simply skipped the approval process to get something on
  your own Glance Scroll quickly.
- **So use it only for public, non-sensitive content** - logos, signs, labels, fun
  graphics. **Never** put financial figures, account details, personal information,
  a private dashboard, or anything that would be a problem if a stranger looked at it.

If the content is at all sensitive, do not use this feature. Instead, email us at
**help@glance-led.com** to build and submit a proper private app - the process is the
same, but we will set up proper encryption or help you navigate it.
:::

## Build a full private app

You can also build a normal app and simply keep it out of the public catalog:

- Build and preview exactly like a public app (same two files, same `gdn` commands).
- No pull request required.
- Install it to your own Glance Scrolls privately.

Everything in [Getting started](/docs/getting-started/quickstart) and the
[guides](/docs/guides/your-first-app) applies - a private app is just an app you do not
submit.
