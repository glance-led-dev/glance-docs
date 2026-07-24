import React from 'react';
import clsx from 'clsx';
import Sidebar from '@theme-original/DocRoot/Layout/Sidebar';
import useDraggableWidth from '@site/src/utils/useDraggableWidth';

// The theme's left sidebar is a fixed 300px — a big slice of a laptop screen.
// This wrapper drops a drag handle next to it so the width is up to the
// reader: drag to taste, double-click to reset. The width rides the theme's
// own --doc-sidebar-width variable, so everything downstream (main column,
// collapse animation) just follows.
export default function SidebarWrapper(props) {
  const handlers = useDraggableWidth({
    cssVar: '--doc-sidebar-width',
    storageKey: 'gdn.sidebarWidth',
    min: 180,
    max: 480,
    measure: (handle) => handle.previousElementSibling,
  });

  return (
    <>
      <Sidebar {...props} />
      <div
        {...handlers}
        className={clsx(
          'gdn-panelResizer',
          'gdn-panelResizer--sidebar',
          // While the sidebar is collapsed to its 30px sliver, the sliver
          // itself is the "expand" click target — keep the handle out of it.
          props.hiddenSidebarContainer && 'gdn-panelResizer--off',
        )}
        role="separator"
        aria-orientation="vertical"
        aria-label="Resize sidebar (drag, or use arrow keys; double-click or Home resets)"
        title="Drag to resize · double-click to reset"
        tabIndex={0}
      />
    </>
  );
}
