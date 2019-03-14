/**
 * @copyright Valor Software
 * @copyright Federico Zivolo and contributors
 */
import { Renderer2 } from '@angular/core';

import { getReferenceOffsets, setAllStyles } from './utils';

import { arrow, flip, preventOverflow, shift, initData } from './modifiers';
import { Data, Offsets, Options } from './models';


export class Positioning {
  position(hostElement: HTMLElement, targetElement: HTMLElement, round = true): Offsets {
    return this.offset(hostElement, targetElement, false);
  }

  offset(hostElement: HTMLElement, targetElement: HTMLElement, round = true): Offsets {
    return getReferenceOffsets(targetElement, hostElement);
  }

  positionElements(
    hostElement: HTMLElement,
    targetElement: HTMLElement,
    position: string,
    appendToBody?: boolean,
    options?: Options
  ): Data {
    const chainOfModifiers = [flip, shift, preventOverflow, arrow];

    return chainOfModifiers.reduce(
      (modifiedData, modifier) => modifier(modifiedData),
      initData(targetElement, hostElement, position, options)
    );
  }
}

const positionService = new Positioning();

export function positionElements(
  hostElement: HTMLElement,
  targetElement: HTMLElement,
  placement: string,
  appendToBody?: boolean,
  options?: Options,
  renderer?: Renderer2
): void {

  const data = positionService.positionElements(
    hostElement,
    targetElement,
    placement,
    appendToBody,
    options
  );

  setAllStyles(data, renderer);
}
