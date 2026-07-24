import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
// The MDXComponents flavor of Details extracts the <summary> child and
// passes it through as the toggle label; @theme/Details alone would not.
import Details from '@theme/MDXComponents/Details';
import LedImage from '@site/src/components/LedImage';
import ColorSwatches from '@site/src/components/ColorSwatches';
import FontGallery from '@site/src/components/FontGallery';

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
  ColorSwatches,
  FontGallery,
  Tabs,
  TabItem,
  Details,
};
