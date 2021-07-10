import { getClientRect, getOuterSizes, getStyleComputedProperty } from '../utils';
import { Data } from '../models';

export function arrow(data: Data) {
  let targetOffsets = data.offsets.target;
  // if arrowElement is a string, suppose it's a CSS selector
  const arrowElement: HTMLElement | null = data.instance.target.querySelector('.arrow');

  // if arrowElement is not found, don't run the modifier
  if (!arrowElement) {
    return data;
  }

  const isVertical = ['left', 'right'].indexOf(data.placement.split(' ')[0]) !== -1;

  const len = isVertical ? 'height' : 'width';
  const sideCapitalized = isVertical ? 'Top' : 'Left';
  const side = sideCapitalized.toLowerCase() as keyof typeof targetOffsets;
  const altSide = isVertical ? 'left' : 'top';
  const opSide = isVertical ? 'bottom' : 'right';
  const arrowElementSize = getOuterSizes(arrowElement)[len];
  const placementVariation = data.placement.split(' ')[1];

  // top/left side
  if ((data.offsets.host[opSide] ?? 0) - arrowElementSize < (targetOffsets[side] ?? 0)) {
    (targetOffsets)[side] -=
      (targetOffsets[side] ?? 0) - ((data.offsets.host[opSide] ?? 0) - arrowElementSize);
  }
  // bottom/right side
  if (Number((data).offsets.host[side]) + Number(arrowElementSize) > (targetOffsets[opSide] ?? 0)) {
    (targetOffsets)[side] +=
      Number((data).offsets.host[side]) + Number(arrowElementSize) - Number((targetOffsets)[opSide]);
  }
  targetOffsets = getClientRect(targetOffsets);

  // Compute the sideValue using the updated target offsets
  // take target margin in account because we don't have this info available
  const css = getStyleComputedProperty(data.instance.target) as unknown as Record<string, string>;
  const targetMarginSide = parseFloat(css[`margin${sideCapitalized}`]) || 0;
  const targetBorderSide = parseFloat(css[`border${sideCapitalized}Width`]) || 0;

  // compute center of the target
  let center: number;
  if (!placementVariation) {
    center = Number((data).offsets.host[side]) + Number(data.offsets.host[len] / 2 - arrowElementSize / 2);
  } else {
    const targetBorderRadius = parseFloat(css.borderRadius) || 0;
    const targetSideArrowOffset = Number(targetMarginSide + targetBorderSide + targetBorderRadius);
    center = side === placementVariation ?
      Number((data).offsets.host[side]) + targetSideArrowOffset :
      Number((data).offsets.host[side]) + Number(data.offsets.host[len] - targetSideArrowOffset);
  }

  let sideValue =
    center - (targetOffsets[side] ?? 0) - targetMarginSide - targetBorderSide;

  // prevent arrowElement from being placed not contiguously to its target
  sideValue = Math.max(Math.min(targetOffsets[len] - arrowElementSize, sideValue), 0);

  data.offsets.arrow = {
    [side]: Math.round(sideValue),
    [altSide]: '' // make sure to unset any eventual altSide value from the DOM node
  };

  data.instance.arrow = arrowElement;

  return data;
}
