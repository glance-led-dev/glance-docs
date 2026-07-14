---
sidebar_position: 1
title: Install
sidebar_label: Install
slug: /getting-started/install
---

# Install the SDK

The SDK (Software Development Kit) is what lets you build and preview apps on your
own computer. Getting set up takes about 5 minutes.

You'll do everything from a terminal, a text window where you type commands.

:::tip[How to open a terminal]
- **Windows:** press the **Windows key**, type **`powershell`**, and press Enter.
- **macOS:** press **Cmd + Space**, type **`terminal`**, and press Enter.
- **Linux:** open your **Terminal** app (often Ctrl + Alt + T).

A window opens with a blinking cursor. That's where every command on this page goes,
one line at a time, each followed by Enter.
:::

## 1. Requirements

- **Python 3.9 or newer**
- **Git** (or use GitHub's "Download ZIP", shown below)

### Installing Python

Download it from the official site. It's a normal installer:

[python.org/downloads](https://www.python.org/downloads/)

:::danger[Windows: tick "Add python.exe to PATH"]
On the first screen of the Python installer, tick
**"Add python.exe to PATH"** before you click Install:

> Add python.exe to PATH

If you miss it, Windows won't find `python` or `gdn`, and nothing below will work.
(If you already installed without it, just re-run the installer and check the box.)
:::

- **macOS:** run the `.pkg` installer, or `brew install python`.
- **Linux:** usually already installed, otherwise `sudo apt install python3 python3-pip`.

Open a **new** terminal window (so it picks up the new PATH) and check it worked:

```bash
python --version
```

You should see `Python 3.9` or newer. On macOS/Linux, try `python3 --version` if
`python` isn't found.

## 2. Get the code

Your apps are folders inside the GDN repository, so start by downloading it:

```bash
git clone https://github.com/glance-led-dev/glance-dev-network.git
cd glance-dev-network
```

No Git? On the [GitHub page](https://github.com/glance-led-dev/glance-dev-network),
click Code, then Download ZIP, unzip it, then open a terminal in that folder.

## 3. Install `gdn`

From the repository folder you just entered, run:

```bash
pip install -e .
```

That single command also downloads everything GDN needs (Pillow, Flask, PyYAML, and a
few others) automatically, so there's no separate list of packages to install by hand.

Then check it works:

```bash
gdn version
```

You should see `gdn 0.1.0`. You now have the toolkit: `gdn studio`,
`gdn new`, `gdn preview`, and more. See them all in the
[CLI commands](/docs/guides/cli) guide.

## Troubleshooting

- **"`pip` is not recognized"** try `python -m pip install -e .` (or
  `py -m pip install -e .` on Windows).
- **"`gdn` is not recognized"** close and reopen your terminal first. If it still
  fails, `python -m gdn version` always works. On Windows this almost always means
  the "Add python.exe to PATH" checkbox was missed, re-run the Python installer and
  tick it.
- **"attempted relative import with no known parent package"** you typed
  `python studio.py` by hand from inside the `gdn` folder. Open Studio with
  `gdn studio` from the project folder instead, or double-click the launcher for your
  system (`studio.bat`, `studio.command`, or `studio.sh`). See
  [Opening Glance Dev Studio](/docs/studio#opening-glance-dev-studio).
- **Permission errors on install** add `--user`, or use a virtual environment:

```bash
python -m venv .venv
# Windows:  .venv\Scripts\activate
# macOS/Linux:  source .venv/bin/activate
pip install -e .
```

## Next

Head to [Getting started](/docs/getting-started/quickstart). You'll have a working app
on screen in about five minutes.
