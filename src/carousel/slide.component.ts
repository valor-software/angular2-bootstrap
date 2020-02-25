import {
  Component,
  HostBinding,
  OnDestroy,
  Input,
  OnInit
} from '@angular/core';

import { CarouselComponent } from './carousel.component';

@Component({
  selector: 'slide',
  template: `
    <div [class.active]="active" class="item">
      <ng-content></ng-content>
    </div>
  `,
  host: {
    '[attr.aria-hidden]': '!active'
  },
  styles: [`
    :host.carousel-animation {
       transition: opacity 0.6s ease, visibility 0.6s ease;
       float: left;
    }
    :host.carousel-animation.active {
      opacity: 1;
      visibility: visible;
    }
    :host.carousel-animation:not(.active) {
      display: block;
      position: absolute;
      opacity: 0;
      visibility: hidden;
    }
  `]
})
export class SlideComponent implements OnInit, OnDestroy {
  /** Is current slide active */
  @HostBinding('class.active')
  @Input()
  active: boolean;

  @HostBinding('style.width') itemWidth = '100%';
  @HostBinding('style.order') order = 0;
  @HostBinding('class.carousel-animation') isAnimated: boolean;

  /** Wraps element by appropriate CSS classes */
  @HostBinding('class.item')
  @HostBinding('class.carousel-item')
  addClass = true;

  /** Link to Parent(container-collection) component */
  protected carousel: CarouselComponent;

  constructor(carousel: CarouselComponent) {
    this.carousel = carousel;
  }

  /** Fires changes in container collection after adding a new slide instance */
  ngOnInit(): void {
    this.carousel.addSlide(this);
    this.itemWidth = `${100 / this.carousel.itemsPerSlide}%`;
  }

  /** Fires changes in container collection after removing of this slide instance */
  ngOnDestroy(): void {
    this.carousel.removeSlide(this);
  }
}
