import {useCallback, useEffect} from 'react';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Pointer-drag logic shared by the sidebar and TOC resize handles.
 *
 * The panel's width lives in a CSS custom property on <html>, so dragging
 * only touches one inline style and the theme's own rules do the layout.
 * The chosen width persists in localStorage; double-click (or Home) clears
 * it and falls back to the stylesheet default.
 *
 * `measure` maps the handle element to the panel being resized — widths are
 * read from the DOM instead of parsing the CSS variable, which may hold a
 * percentage or be unset. `invert` is for right-side panels, where dragging
 * left makes the panel wider.
 */
export default function useDraggableWidth({
  cssVar,
  storageKey,
  min,
  max,
  invert = false,
  measure,
}) {
  const dir = invert ? -1 : 1;

  useEffect(() => {
    const saved = Number(window.localStorage.getItem(storageKey));
    if (saved) {
      document.documentElement.style.setProperty(
        cssVar,
        `${clamp(saved, min, max)}px`,
      );
    }
  }, [cssVar, storageKey, min, max]);

  const setWidth = useCallback(
    (px) => {
      document.documentElement.style.setProperty(cssVar, `${px}px`);
      try {
        window.localStorage.setItem(storageKey, String(px));
      } catch {}
    },
    [cssVar, storageKey],
  );

  const reset = useCallback(() => {
    document.documentElement.style.removeProperty(cssVar);
    try {
      window.localStorage.removeItem(storageKey);
    } catch {}
  }, [cssVar, storageKey]);

  const onPointerDown = useCallback(
    (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) {
        return;
      }
      const handle = e.currentTarget;
      const panel = measure(handle);
      if (!panel) {
        return;
      }
      e.preventDefault();
      const startX = e.clientX;
      const startWidth = panel.offsetWidth;
      let width = startWidth;
      const root = document.documentElement;
      root.classList.add('gdn-resizing');
      const onMove = (ev) => {
        width = clamp(
          Math.round(startWidth + (ev.clientX - startX) * dir),
          min,
          max,
        );
        root.style.setProperty(cssVar, `${width}px`);
      };
      const end = () => {
        root.classList.remove('gdn-resizing');
        handle.removeEventListener('pointermove', onMove);
        handle.removeEventListener('pointerup', end);
        handle.removeEventListener('lostpointercapture', end);
        setWidth(width);
      };
      handle.addEventListener('pointermove', onMove);
      handle.addEventListener('pointerup', end);
      handle.addEventListener('lostpointercapture', end);
      try {
        handle.setPointerCapture(e.pointerId);
      } catch {
        // No active pointer to capture (can happen with synthetic events);
        // the listeners above still track the drag.
      }
    },
    [cssVar, dir, min, max, measure, setWidth],
  );

  const onKeyDown = useCallback(
    (e) => {
      if (e.key === 'Home') {
        e.preventDefault();
        reset();
        return;
      }
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
        return;
      }
      const panel = measure(e.currentTarget);
      if (!panel) {
        return;
      }
      e.preventDefault();
      const delta = (e.key === 'ArrowRight' ? 16 : -16) * dir;
      setWidth(clamp(panel.offsetWidth + delta, min, max));
    },
    [dir, min, max, measure, reset, setWidth],
  );

  return {onPointerDown, onDoubleClick: reset, onKeyDown};
}
