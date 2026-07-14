---
sidebar_position: 1
title: Submit your app
---

# Submit your app

Sharing an app is a pull request. Your app folder is the whole submission.
No accounts, no keys, no hosting.

## Submission checklist

- `gdn validate apps/my-app` passes
- No secrets or API keys committed
- Small PNG assets, all declared under `assets:`
- A clear `name`, `description`, and `author` in the manifest

See [Guidelines](/docs/publish/guidelines) for the complete list of requirements.

## You submit from your fork

Publishing pushes your app to **your own fork** of the repo, then opens a pull
request from it. So the one thing to get right first: work in a clone whose
`origin` is your fork, not the shared Glance repo.

**1. Fork the repo.** On
[the GitHub page](https://github.com/glance-led-dev/glance-dev-network), click
**Fork**. That gives you your own copy of the repo under your account, which you
can push to.

**2. Clone your fork** (not the main repo), so `origin` points at your copy:

```bash
git clone https://github.com/<your-username>/glance-dev-network.git
cd glance-dev-network
pip install -e .
```

Already cloned the main repo? You don't have to start over. Just point `origin`
at your fork:

```bash
git remote set-url origin https://github.com/<your-username>/glance-dev-network.git
```

## Open the pull request

If you've never opened a pull request: it's how you propose adding your folder to
the shared repository. Once it's reviewed and merged, your app is live in the catalog.

The easiest way is **Glance Dev Studio**: open your app and click **Validate &
Submit**. It commits your app, pushes it to your fork, and opens the pull request
for you, all from one button. See [Check it and publish](/docs/studio/check-and-publish).

Prefer the terminal? Do the same steps by hand:

```bash
git checkout -b my-app
git add apps/my-app
git commit -m "Add my-app"
git push -u origin my-app
```

GitHub prints a link to open the pull request, click it, write one line about
what the app shows, and submit.

**CI validates automatically**, the same `gdn validate` you ran locally. Once the
PR is reviewed and merged, your app goes live in the app catalog.

:::caution[Seeing "origin is the main repo, not your fork"?]

Validate & Submit and `gdn submit` push to your `origin`, so `origin` has to be
**your fork**, not the shared Glance repo. If you cloned the main repo, run the
`git remote set-url origin ...` command above with your fork's URL, then submit again.

:::

## Private apps

You can also keep an app to yourself or your organization.

<div className="cardGrid">
  <a className="card" href="/docs/private-apps/"><h3>Private apps</h3><p>Coming soon, install apps without publishing them publicly.</p></a>
</div>
