import React from 'react';
import Content from '@theme-original/DocItem/Content';
import {useDoc} from '@docusaurus/plugin-content-docs/client';

// Shows the "N min read" chip above the page title. The number is hand-set per
// page in front matter (`read_time`), not word-counted, so it can account for
// how much thinking a page asks of you and not just how long it is. Pages
// without the field (hub pages that are just link grids) get no chip.
export default function ContentWrapper(props) {
  const {frontMatter} = useDoc();
  const minutes = frontMatter.read_time;

  return (
    <>
      {minutes ? (
        <div className="readTime" aria-label={`Estimated read time: ${minutes} minutes`}>
          <span className="readTime__dot" aria-hidden="true" />
          {minutes} min read
        </div>
      ) : null}
      <Content {...props} />
    </>
  );
}
