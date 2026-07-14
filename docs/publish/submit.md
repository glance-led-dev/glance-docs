---
sidebar_position: 1
title: Submit your app
---

# Submit your app

Sharing an app is a pull request: you propose adding your app folder to the shared
catalog, the Glance team reviews it, and once it's merged your app is live. You don't
have to do any of that by hand, Glance Dev Studio does it in one button.

## The one-button way

Open your app in [Glance Dev Studio](/docs/studio) and click **Validate & Submit**.

<figure className="figure">
  <img className="shot" src="/img/studio/publish-button.png" alt="The Validate and Submit button in the Studio toolbar" />
</figure>

Studio first checks your app renders cleanly, then shows you exactly what it's about to
do on your behalf. Tick the box and click **Publish**:

<figure className="figure">
  <img className="shot" src="/img/studio/publish-confirm.png" alt="The Publish dialog listing the three steps: make a fork, push the app, open a pull request, with a checkbox to approve" />
  <figcaption>Studio tells you every step before it runs anything, and waits for your OK.</figcaption>
</figure>

That one click:

1. Makes sure you have your own **fork** of the app repo, and **creates one for you** if you don't have it yet.
2. Commits your app and pushes it to your fork on its own branch.
3. Opens a **pull request** to add it to the catalog.

It also renders your app's **preview images** (a PNG of each page, plus a `preview.png`
thumbnail) into a `preview/` folder, so they ship with your app and show in the catalog.

:::tip[New to forks? You don't need to be]
A fork is simply your own copy of the app catalog on your GitHub account, the place your
app gets pushed from. You never have to create it by hand or even know what it is: Studio
makes it for you the first time you publish, and reuses it after that.
:::

The first time, git asks you to sign in to GitHub through your normal credential manager
(the same sign-in as any `git push`), so there's nothing extra to install and no token to
paste. When it's done, your pull request is open and Studio links you straight to it:

<figure className="figure">
  <img className="shot" src="/img/studio/publish-done.png" alt="The Publish dialog showing 'Your pull request is open' with a link to view it on GitHub" />
</figure>

:::tip[Signing in to GitHub]
The first time you publish, a **GitHub sign-in window opens in your browser**. That's
expected, it's how git proves it's you. Complete it once and it's remembered, so you won't
be asked again for a while.

- If a publish seems to **hang or "stick"**, it's almost always waiting on that sign-in
  window. Find it (check your taskbar or other browser tabs) and finish it, and publishing
  continues on its own.
- GitHub **occasionally asks you to sign in again later** (credentials expire). Same window,
  same one click, no reason to worry.

That window comes from **Git itself** (its credential manager), not from Glance Dev Studio.
Studio never sees, stores, or sends your GitHub password or token, git handles the sign-in
and keeps it in your operating system's own secure credential store, on your machine. Glance
has no access to it, and you never paste a token or type a git command.
:::

:::note[You submit, the team merges]
A pull request is a *request* to add your app, you don't merge it yourself. CI runs
`gdn validate` on it automatically; once it's green and reviewed, the Glance team merges
it and it goes live in the catalog.
:::

## Publishing more apps

You never have to re-pull or re-set-up between apps. Each time you click **Validate &
Submit**, Studio builds a fresh branch off the **latest** catalog and puts just that one
app on it, so every app becomes its own independent pull request:

- Your first app goes out as `submit-<app-a>` (pull request #1).
- Your next app is based on the current catalog as `submit-<app-b>` (pull request #2).

Studio does this in an isolated workspace, so publishing never touches the files you're
working on. Make an app, publish it, make another, publish it, that's the whole loop.

## Prefer the terminal?

The same flow is one command:

```bash
gdn submit apps/my-app
```

It validates, asks you to confirm, then creates your fork (if needed), pushes, and opens
the pull request, just like the button. Add `-y` to skip the confirmation.

<details>
  <summary>Doing it fully by hand with git</summary>

If you'd rather run the git yourself: fork the repo on GitHub, clone your fork, then:

```bash
git checkout -b my-app
git add apps/my-app
git commit -m "Add my-app"
git push -u origin my-app
```

GitHub prints a link to open the pull request. This is exactly what Studio automates.

</details>

## Submission checklist

- `gdn validate apps/my-app` passes (Studio's **Validate** button runs the same check)
- No secrets or API keys committed
- All images in the app's `assets/` folder and declared under `assets:`
- A `preview/` folder with a render of each page (Validate and Submit generate it for you)
- A clear `name`, `description`, and `author` in the manifest

See [Guidelines](/docs/publish/guidelines) for the complete list of requirements.

## Private apps

You can also keep an app to yourself or your organization.

<div className="cardGrid">
  <a className="card" href="/docs/private-apps/"><h3>Private apps</h3><p>Coming soon, install apps without publishing them publicly.</p></a>
</div>
