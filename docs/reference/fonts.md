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

Every bundled font, rendered (specimen text `ABC XYZ 0123`), smallest to
largest — **click a card to copy the font name**:

<FontGallery />

List them any time with `gdn fonts`.
