---
sidebar_position: 4.6
title: Fonts
---

# Fonts

Draw text in any of the 37 bundled bitmap fonts. Pass a font by name:

```python
c.text("BIG", 2, 2, font="16x24", color="green")
c.text("TINY", 2, 26, font="4x5", color="white")
```

:::warning[Fonts are UPPERCASE-only]
The bitmap fonts only contain capital letters; lowercase characters are silently skipped
(they simply don't draw). If your text comes from an input, call `.upper()` on it:
`c.text(name.upper()...)`.
:::

See the full [Fonts reference](/docs/reference/fonts) for every font at its real size, or
run `gdn fonts` to list them.

## Next

<div className="cardGrid">
  <a className="card" href="/docs/guides/working-with-images"><h3>Working with images</h3><p>Icons, PNGs, and placing them visually.</p></a>
  <a className="card" href="/docs/reference/fonts"><h3>Fonts reference</h3><p>All 37 fonts, at their real sizes.</p></a>
</div>
