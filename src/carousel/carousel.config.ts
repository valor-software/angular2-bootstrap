import { Injectable } from '@angular/core';

@Injectable()
export class CarouselConfig {
  /** Default interval of auto changing of slides */
  interval = 5000;

  /** Is loop of auto changing of slides can be paused */
  noPause = false;

  /** Is slides can wrap from the last to the first slide */
  noWrap = false;

  /** Show carousel-indicators */
  showIndicators = true;

  /* If value more then 1 — carousel works in multilist mode */
  itemsPerSlide = 1;

  /* If `true` — carousel shifts by one element. By default carousel shifts by number
    of visible elements (itemsPerSlide field) */
  singleSlideOffset = false;
}
