import React from 'react';
import TOC from '@theme-original/TOC';
import useDraggableWidth from '@site/src/utils/useDraggableWidth';

// Adds a drag handle to the desktop "On this page" rail so it can be
// narrowed (or widened) with the mouse, same as the left sidebar. The
// width lands in --gdn-toc-width, which custom.css feeds into the rail's
// column and the article column's max-width. Dragging left = wider rail.
export default function TOCWrapper(props) {
  const handlers = useDraggableWidth({
    cssVar: '--gdn-toc-width',
    storageKey: 'gdn.tocWidth',
    min: 150,
    max: 420,
    invert: true,
    measure: (handle) => handle.parentElement,
  });

  // TOC also renders in non-rail spots (e.g. collapsible mobile TOC uses its
  // own component, but stay defensive) — only the desktop rail gets a handle.
  if (!props.className?.includes('theme-doc-toc-desktop')) {
    return <TOC {...props} />;
  }

  return (
    <>
      <div
        {...handlers}
        className="gdn-panelResizer gdn-panelResizer--toc"
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize table of contents (drag, or use arrow keys; double-click or Home resets)"
        title="Drag to resize · double-click to reset"
        tabIndex={0}
      />
      <TOC {...props} />
    </>
  );
}
