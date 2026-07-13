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

## The pull-request flow

If you've never opened a pull request: it's how you propose adding your folder to
the shared repository. Once it's reviewed and merged, your app is live in the
catalog.

**1. Fork the repo**, on
[the GitHub page](https://github.com/glance-led/glance-dev-network), click
**Fork**. That gives you your own copy you can push to.

**2. Point your clone at your fork** (skip if you cloned your fork to begin with):

```bash
git remote add fork https://github.com/<your-username>/glance-dev-network.git
```

**3. Create a branch and commit your app:**

```bash
git checkout -b my-app
git add apps/my-app
git commit -m "Add my-app"
```

**4. Push and open the PR:**

```bash
git push fork my-app
```

GitHub prints a link to open the pull request, click it, write one line about
what the app shows, and submit.

**5. CI validates automatically**, the same `gdn validate` you ran locally. Once
the PR is merged, your app goes live in the app catalog.

## Private apps

You can also keep an app to yourself or your organization.

<div className="cardGrid">
  <a className="card" href="/docs/private-apps/"><h3>Private apps</h3><p>Coming soon, install apps without publishing them publicly.</p></a>
</div>
