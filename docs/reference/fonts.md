---
sidebar_position: 7
title: Fonts
read_time: 4
---

# Fonts

GDN bundles 37 bitmap fonts tuned for tiny panels. Pass one by name to `c.text(...)`:

```python
c.text("BIG", 2, 2, font="16x24", color="green")
c.text("TINY", 2, 26, font="4x5", color="white")
```

:::warning[Uppercase only]
Most of these fonts contain only capital letters and digits. Lowercase letters are
silently skipped, so call `.upper()` on text that comes from an input.
:::

Every bundled font, rendered (specimen text `ABC XYZ 0123`):

| Font | Specimen |
|---|---|
| `10x10` | ![10x10 specimen](/img/fonts/10x10.png) |
| `10x14` | ![10x14 specimen](/img/fonts/10x14.png) |
| `10x16` | ![10x16 specimen](/img/fonts/10x16.png) |
| `10x16_bold` | ![10x16_bold specimen](/img/fonts/10x16_bold.png) |
| `16x20` | ![16x20 specimen](/img/fonts/16x20.png) |
| `16x20_bold` | ![16x20_bold specimen](/img/fonts/16x20_bold.png) |
| `16x24` | ![16x24 specimen](/img/fonts/16x24.png) |
| `16x24_bold` | ![16x24_bold specimen](/img/fonts/16x24_bold.png) |
| `19x28` | ![19x28 specimen](/img/fonts/19x28.png) |
| `19x28_bold` | ![19x28_bold specimen](/img/fonts/19x28_bold.png) |
| `20x30` | ![20x30 specimen](/img/fonts/20x30.png) |
| `20x30_bold` | ![20x30_bold specimen](/img/fonts/20x30_bold.png) |
| `20x30_scroll` | ![20x30_scroll specimen](/img/fonts/20x30_scroll.png) |
| `22x32` | ![22x32 specimen](/img/fonts/22x32.png) |
| `22x32_bold` | ![22x32_bold specimen](/img/fonts/22x32_bold.png) |
| `24x36` | ![24x36 specimen](/img/fonts/24x36.png) |
| `24x36_bold` | ![24x36_bold specimen](/img/fonts/24x36_bold.png) |
| `3x4` | ![3x4 specimen](/img/fonts/3x4.png) |
| `3x7` | ![3x7 specimen](/img/fonts/3x7.png) |
| `4x5` | ![4x5 specimen](/img/fonts/4x5.png) |
| `4x7` | ![4x7 specimen](/img/fonts/4x7.png) |
| `5x5` | ![5x5 specimen](/img/fonts/5x5.png) |
| `5x5b` | ![5x5b specimen](/img/fonts/5x5b.png) |
| `5x7` | ![5x7 specimen](/img/fonts/5x7.png) |
| `5x7b` | ![5x7b specimen](/img/fonts/5x7b.png) |
| `6x16` | ![6x16 specimen](/img/fonts/6x16.png) |
| `6x6` | ![6x6 specimen](/img/fonts/6x6.png) |
| `6x8` | ![6x8 specimen](/img/fonts/6x8.png) |
| `7x10` | ![7x10 specimen](/img/fonts/7x10.png) |
| `7x12` | ![7x12 specimen](/img/fonts/7x12.png) |
| `7x14` | ![7x14 specimen](/img/fonts/7x14.png) |
| `7x16` | ![7x16 specimen](/img/fonts/7x16.png) |
| `8x12` | ![8x12 specimen](/img/fonts/8x12.png) |
| `picopixel` | ![picopixel specimen](/img/fonts/picopixel.png) |
| `scoretext` | ![scoretext specimen](/img/fonts/scoretext.png) |
| `teamabbrev` | ![teamabbrev specimen](/img/fonts/teamabbrev.png) |
| `vs` | ![vs specimen](/img/fonts/vs.png) |

List them any time with `gdn fonts`.
