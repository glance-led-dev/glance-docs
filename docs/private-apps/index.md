---
sidebar_position: 1
title: Private apps
slug: /private-apps/
---

# Private apps

Install an app for just yourself or your organization, without publishing it to the
public catalog or going through review.

## Point a panel at your own image

The fastest private app: give a panel an image URL and it displays that picture,
refreshing on the schedule you choose. No code, no pull request, no review. It is
made for things you already generate as a PNG or JPG on your own server - a personal
logo, a sign, a room label, a fun graphic.

You provide:

- your device's **MAC address**,
- a public image **URL** (`http://...`, ending in `.png`, `.jpg`, or `.jpeg`),
- the **width** (up to 192) and a **refresh interval**.

Your panel fetches that image **directly over your own network** and draws it. Glance
never creates, stores, or proxies the picture itself.

:::danger[Read this before you use it - proceed at your own risk]

**Treat every image as fully public. Never point a panel at anything you would not be
comfortable a complete stranger seeing or logging.**

- **The image comes from YOUR server.** Every PNG/JPG is generated and hosted by you.
  Glance does not make, store, or proxy the image, and **Glance is not responsible for
  any leak** of whatever you choose to publish this way.
- **The URL is stored on Glance's servers in plain `http`** (not `https`), on purpose:
  the panels are memory-constrained and TLS will not fit. That is acceptable here
  because the URL only points at a **public picture** - you are not submitting any
  personal data through it - but it does mean the URL itself is **not secret**.
- **Anyone who learns the URL can view the image.** Think of it like a public repo:
  anyone can reach it. You have simply skipped the approval process to get something
  on your own panel quickly.
- **So use it only for public, non-sensitive content** - logos, signs, labels, fun
  graphics. **Never** put financial figures, account details, personal information,
  a private dashboard, or anything that would be a problem if a stranger looked at it.

If the content is at all sensitive, do not use this feature. Build and submit a proper
private app instead.
:::

## GIF Studio

**[GIF Studio](/docs/private-apps/gif-studio)** turns your own PNGs into a
panel-accurate animated GIF, no code and no pull request. Run `gdn gifstudio` and drop
pictures in.

## Build a full private app

You can also build a normal app and simply keep it out of the public catalog:

- Build and preview exactly like a public app (same two files, same `gdn` commands).
- No pull request required.
- Install it to your own panels privately.

Everything in [Getting started](/docs/getting-started/quickstart) and the
[guides](/docs/guides/your-first-app) applies - a private app is just an app you do
not submit.
