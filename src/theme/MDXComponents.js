import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import LedImage from '@site/src/components/LedImage';

const BaseImg = MDXComponents.img;

// Panel screenshots are tagged className="led" throughout the docs; route
// those through the LED-matrix renderer and leave every other image on the
// theme default. <LedImage> is also registered for explicit use in MDX.
function SmartImg(props) {
  if (props.className?.split(' ').includes('led')) {
    return <LedImage {...props} />;
  }
  return <BaseImg {...props} />;
}

export default {
  ...MDXComponents,
  img: SmartImg,
  LedImage,
};
