// tslint:disable:max-file-line-count
/***
 * pause (not yet supported) (?string='hover') - event group name which pauses
 * the cycling of the carousel, if hover pauses on mouseenter and resumes on
 * mouseleave keyboard (not yet supported) (?boolean=true) - if false
 * carousel will not react to keyboard events
 * note: swiping not yet supported
 */
/****
 * Problems:
 * 1) if we set an active slide via model changes, .active class remains on a
 * current slide.
 * 2) if we have only one slide, we shouldn't show prev/next nav buttons
 * 3) if first or last slide is active and noWrap is true, there should be
 * "disabled" class on the nav buttons.
 * 4) default interval should be equal 5000
 */

import {
  Component, EventEmitter, Input, NgZone, OnDestroy, Output, AfterViewInit
} from '@angular/core';

import { isBs3, LinkedList } from 'ngx-bootstrap/utils';
import { SlideComponent } from './slide.component';
import { CarouselConfig } from './carousel.config';
import { findLastIndex, chunkByNumber } from './utils';
import { SlideWithIndex, IndexedSlideList } from './models';

export enum Direction {
  UNKNOWN,
  NEXT,
  PREV
}

/**
 * Base element to create carousel
 */
@Component({
  selector: 'carousel',
  templateUrl: './carousel.component.html'
})
export class CarouselComponent implements AfterViewInit, OnDestroy {
  /* If `true` — carousel will not cycle continuously and will have hard stops (prevent looping) */
  @Input() noWrap: boolean;
  /*  If `true` — will disable pausing on carousel mouse hover */
  @Input() noPause: boolean;
  /*  If `true` — carousel-indicators are visible  */
  @Input() showIndicators: boolean;
  /* If value more then 1 — carousel works in multilist mode */
  @Input() itemsPerSlide = 1;
  /* If `true` — carousel shifts by one element. By default carousel shifts by number
     of visible elements (itemsPerSlide field) */
  @Input() singleSlideOffset = false;

  /** Will be emitted when active slide has been changed. Part of two-way-bindable [(activeSlide)] property */
  @Output()
  activeSlideChange: EventEmitter<number> = new EventEmitter<number>(false);

  /** Will be emitted when active slides has been changed in multilist mode */
  @Output()
  slideRangeChange: EventEmitter<number[]> = new EventEmitter<number[]>();

  /** Index of currently displayed slide(started for 0) */
  @Input()
  set activeSlide(index: number) {
    if (this.multilist) {
      return;
    }
    if (this._slides.length && index !== this._currentActiveSlide) {
      this._select(index);
    }
  }

  get activeSlide(): number {
    return this._currentActiveSlide;
  }

  /* Index to start display slides from it */
  @Input()
  startFromIndex = 0;

  /**
   * Delay of item cycling in milliseconds. If false, carousel won't cycle
   * automatically.
   */
  @Input()
  get interval(): number {
    return this._interval;
  }

  set interval(value: number) {
    this._interval = value;
    this.restartTimer();
  }

  get slides(): SlideComponent[] {
    return this._slides.toArray();
  }

  // tslint:disable-next-line:no-any
  protected currentInterval: any;
  protected _currentActiveSlide: number;
  protected _interval: number;
  protected _slides: LinkedList<SlideComponent> = new LinkedList<SlideComponent>();
  protected _chunkedSlides: SlideWithIndex[][];
  protected _slidesWithIndexes: SlideWithIndex[];
  protected _currentVisibleSlidesIndex = 0;
  protected isPlaying: boolean;
  protected destroyed = false;

  get isBs4(): boolean {
    return !isBs3();
  }

  constructor(config: CarouselConfig, private ngZone: NgZone) {
    Object.assign(this, config);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.multilist) {
        this._chunkedSlides = chunkByNumber(
          this.mapSlidesAndIndexes(),
          this.itemsPerSlide
        );
        this.selectInitialSlides();
      }
    }, 0);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
  }

  /**
   * Adds new slide. If this slide is first in collection - set it as active
   * and starts auto changing
   * @param slide
   */
  addSlide(slide: SlideComponent): void {
    this._slides.add(slide);

    if (this.multilist && this._slides.length <= this.itemsPerSlide) {
      slide.active = true;
    }

    if (!this.multilist && this._slides.length === 1) {
      this._currentActiveSlide = undefined;
      this.activeSlide = 0;
      this.play();
    }

    if (this.multilist && this._slides.length > this.itemsPerSlide) {
      this.play();
    }
  }

  /**
   * Removes specified slide. If this slide is active - will roll to another
   * slide
   * @param slide
   */
  removeSlide(slide: SlideComponent): void {
    const remIndex = this._slides.indexOf(slide);

    if (this._currentActiveSlide === remIndex) {
      // removing of active slide
      let nextSlideIndex: number = void 0;
      if (this._slides.length > 1) {
        // if this slide last - will roll to first slide, if noWrap flag is
        // FALSE or to previous, if noWrap is TRUE in case, if this slide in
        // middle of collection, index of next slide is same to removed
        nextSlideIndex = !this.isLast(remIndex)
          ? remIndex
          : this.noWrap ? remIndex - 1 : 0;
      }
      this._slides.remove(remIndex);

      // prevents exception with changing some value after checking
      setTimeout(() => {
        this._select(nextSlideIndex);
      }, 0);
    } else {
      this._slides.remove(remIndex);
      const currentSlideIndex = this.getCurrentSlideIndex();
      setTimeout(() => {
        // after removing, need to actualize index of current active slide
        this._currentActiveSlide = currentSlideIndex;
        this.activeSlideChange.emit(this._currentActiveSlide);
      }, 0);
    }
  }

  nextSlideFromInterval(force = false): void {
    this.move(Direction.NEXT, force);
  }

  /**
   * Rolling to next slide
   * @param force: {boolean} if true - will ignore noWrap flag
   */
  nextSlide(force = false): void {
    if (this.isPlaying) {
      this.restartTimer();
    }
    this.move(Direction.NEXT, force);
  }

  /**
   * Rolling to previous slide
   * @param force: {boolean} if true - will ignore noWrap flag
   */
  previousSlide(force = false): void {
    if (this.isPlaying) {
      this.restartTimer();
    }
    this.move(Direction.PREV, force);
  }

  getFirstVisibleIndex(): number {
    return this.slides.findIndex(this.getActive);
  }

  getLastVisibleIndex(): number {
    return findLastIndex(this.slides, this.getActive);
  }

  getActive = (slide: SlideComponent) => slide.active;

  move(direction: Direction, force = false): void {
    const firstVisibleIndex = this.getFirstVisibleIndex();
    const lastVisibleIndex = this.getLastVisibleIndex();

    if (this.noWrap) {
      if (
        direction === Direction.NEXT &&
        this.isLast(lastVisibleIndex) ||
        direction === Direction.PREV &&
        firstVisibleIndex === 0
      ) {
        return;
      }
    }

    if (!this.multilist) {
      this.activeSlide = this.findNextSlideIndex(direction, force);
    } else {
      this.moveMultilist(direction);
    }
  }

  /**
   * Rolling to specified slide
   * @param index: {number} index of slide, which must be shown
   */
  selectSlide(index: number): void {
    if (this.isPlaying) {
      this.restartTimer();
    }

    if (!this.multilist) {
      this.activeSlide = index;
    } else {
      this.selectSlideRange(index);
    }
  }

  /**
   * Starts a auto changing of slides
   */
  play(): void {
    if (!this.isPlaying) {
      this.isPlaying = true;
      this.restartTimer();
    }
  }

  /**
   * Stops a auto changing of slides
   */
  pause(): void {
    if (!this.noPause) {
      this.isPlaying = false;
      this.resetTimer();
    }
  }

  /**
   * Finds and returns index of currently displayed slide
   */
  getCurrentSlideIndex(): number {
    return this._slides.findIndex(this.getActive);
  }

  /**
   * Defines, whether the specified index is last in collection
   * @param index
   */
  isLast(index: number): boolean {
    return index + 1 >= this._slides.length;
  }

  /**
   * Defines, whether the specified index is first in collection
   * @param index
   */
  isFirst(index: number): boolean {
    return index === 0;
  }

  private selectInitialSlides(): void {
    const startIndex = this.startFromIndex <= this._slides.length
      ? this.startFromIndex
      : 0;

    this.hideSlides();

    if (this.singleSlideOffset) {
      this._slidesWithIndexes = this.mapSlidesAndIndexes();

      if (this._slides.length - startIndex < this.itemsPerSlide) {
        const slidesToAppend = this._slidesWithIndexes.slice(0, startIndex);

        this._slidesWithIndexes  = [
          ...this._slidesWithIndexes,
          ...slidesToAppend
        ]
          .slice(slidesToAppend.length)
          .slice(0, this.itemsPerSlide);
      } else {
        this._slidesWithIndexes = this._slidesWithIndexes.slice(
          startIndex,
          startIndex + this.itemsPerSlide
        );
      }

      this._slidesWithIndexes.forEach((slide: SlideWithIndex) => slide.item.active = true);
      this.makeSlidesConsistent(this._slidesWithIndexes);
    } else {
      this.selectRangeByNestedIndex(startIndex);
    }

    this.slideRangeChange.emit(this.getVisibleIndexes());
  }

  /**
   * Defines next slide index, depending of direction
   * @param direction: Direction(UNKNOWN|PREV|NEXT)
   * @param force: {boolean} if TRUE - will ignore noWrap flag, else will
   *   return undefined if next slide require wrapping
   */
  private findNextSlideIndex(direction: Direction, force: boolean): number {
    let nextSlideIndex = 0;

    if (
      !force &&
      (this.isLast(this.activeSlide) &&
        direction !== Direction.PREV &&
        this.noWrap)
    ) {
      return undefined;
    }

    switch (direction) {
      case Direction.NEXT:
        // if this is last slide, not force, looping is disabled
        // and need to going forward - select current slide, as a next
        nextSlideIndex = !this.isLast(this._currentActiveSlide)
          ? this._currentActiveSlide + 1
          : !force && this.noWrap ? this._currentActiveSlide : 0;
        break;
      case Direction.PREV:
        // if this is first slide, not force, looping is disabled
        // and need to going backward - select current slide, as a next
        nextSlideIndex =
          this._currentActiveSlide > 0
            ? this._currentActiveSlide - 1
            : !force && this.noWrap
              ? this._currentActiveSlide
              : this._slides.length - 1;
        break;
      default:
        throw new Error('Unknown direction');
    }

    return nextSlideIndex;
  }

  private mapSlidesAndIndexes(): SlideWithIndex[] {
    return this.slides
      .slice()
      .map((slide: SlideComponent, index: number) => {
        return {
          index,
          item: slide
        };
      });
  }


  private selectSlideRange(index: number): void {
    if (this.isIndexInRange(index)) {
      return;
    }

    this.hideSlides();

    if (!this.singleSlideOffset) {
      this.selectRangeByNestedIndex(index);
    } else {
      const startIndex = this.isIndexOnTheEdges(index)
        ? index
        : index - this.itemsPerSlide + 1;

      const endIndex = this.isIndexOnTheEdges(index)
        ? index + this.itemsPerSlide
        : index + 1;

      this._slidesWithIndexes = this.mapSlidesAndIndexes().slice(startIndex, endIndex);
      this.makeSlidesConsistent(this._slidesWithIndexes);

      this._slidesWithIndexes.forEach((slide: SlideWithIndex) => slide.item.active = true);
    }

    this.slideRangeChange.emit(this.getVisibleIndexes());
  }

  private selectRangeByNestedIndex(index: number): void {
    const selectedRange = this._chunkedSlides
      .map((slidesList, i: number) => {
        return {
          index: i,
          list: slidesList
        };
      })
      .find(
        (slidesList: IndexedSlideList) => {
          return slidesList.list.find(slide => slide.index === index) !== undefined;
        }
      );

    this._currentVisibleSlidesIndex = selectedRange.index;

    this._chunkedSlides[selectedRange.index].forEach((slide: SlideWithIndex) => {
      slide.item.active = true;
    });
  }

  private isIndexOnTheEdges(index: number): boolean {
    return (
      index + 1 - this.itemsPerSlide <= 0 ||
      index + this.itemsPerSlide <= this._slides.length
    );
  }

  private isIndexInRange(index: number): boolean {
    if (this.singleSlideOffset) {
      const visibleIndexes = this._slidesWithIndexes.map((slide: SlideWithIndex) => slide.index);

      return visibleIndexes.indexOf(index) >= 0;
    }

    return (
      index <= this.getLastVisibleIndex() &&
      index >= this.getFirstVisibleIndex()
    );
  }

  private hideSlides(): void {
    this.slides.forEach((slide: SlideComponent) => slide.active = false);
  }

  private isVisibleSlideListLast(): boolean {
    return this._currentVisibleSlidesIndex === this._chunkedSlides.length - 1;
  }

  private isVisibleSlideListFirst(): boolean {
    return this._currentVisibleSlidesIndex === 0;
  }

  private moveSliderByOneItem(direction: Direction): void {
    let firstVisibleIndex: number;
    let lastVisibleIndex: number;
    let indexToHide: number;
    let indexToShow: number;

    if (this.noWrap) {
      firstVisibleIndex = this.getFirstVisibleIndex();
      lastVisibleIndex = this.getLastVisibleIndex();

      indexToHide = direction === Direction.NEXT
        ? firstVisibleIndex
        : lastVisibleIndex;

      indexToShow = direction !== Direction.NEXT
        ? firstVisibleIndex - 1
        : !this.isLast(lastVisibleIndex)
          ? lastVisibleIndex + 1 : 0;

      this._slides.get(indexToHide).active = false;
      this._slides.get(indexToShow).active = true;

      const slidesToReorder = this.mapSlidesAndIndexes().filter(
        (slide: SlideWithIndex) => slide.item.active
      );

      this.makeSlidesConsistent(slidesToReorder);

      this.slideRangeChange.emit(this.getVisibleIndexes());
    } else {
      let displayedIndex: number;

      firstVisibleIndex = this._slidesWithIndexes[0].index;
      lastVisibleIndex = this._slidesWithIndexes[this._slidesWithIndexes.length - 1].index;

      if (direction === Direction.NEXT) {
        this._slidesWithIndexes.shift();

        displayedIndex = this.isLast(lastVisibleIndex)
          ? 0
          : lastVisibleIndex + 1;

        this._slidesWithIndexes.push({
          index: displayedIndex,
          item: this._slides.get(displayedIndex)
        });
      } else {
        this._slidesWithIndexes.pop();
        displayedIndex = this.isFirst(firstVisibleIndex)
          ? this._slides.length - 1
          : firstVisibleIndex - 1;

        this._slidesWithIndexes = [{
          index: displayedIndex,
          item: this._slides.get(displayedIndex)
        }, ...this._slidesWithIndexes];
      }

      this.hideSlides();

      this._slidesWithIndexes.forEach(slide => slide.item.active = true);

      this.makeSlidesConsistent(this._slidesWithIndexes);

      this.slideRangeChange.emit(
        this._slidesWithIndexes.map((slide: SlideWithIndex) => slide.index)
      );
    }
  }

  private makeSlidesConsistent = (slides: SlideWithIndex[]): void => {
    slides.forEach((slide: SlideWithIndex, index: number) => slide.item.order = index);
  }

  private moveMultilist(direction: Direction): void {
    if (this.singleSlideOffset) {
      this.moveSliderByOneItem(direction);
    } else {
      this.hideSlides();

      if (this.noWrap) {
        this._currentVisibleSlidesIndex = direction === Direction.NEXT
          ? this._currentVisibleSlidesIndex + 1
          : this._currentVisibleSlidesIndex - 1;
      } else {
        if (direction === Direction.NEXT) {
          this._currentVisibleSlidesIndex = this.isVisibleSlideListLast()
            ? 0
            : this._currentVisibleSlidesIndex + 1;
        } else {
          this._currentVisibleSlidesIndex = this.isVisibleSlideListFirst()
            ? this._chunkedSlides.length - 1
            : this._currentVisibleSlidesIndex - 1;
        }
      }

      this._chunkedSlides[this._currentVisibleSlidesIndex].forEach(
        (slide: SlideWithIndex) => slide.item.active = true
      );

      this.slideRangeChange.emit(this.getVisibleIndexes());
    }
  }

  private getVisibleIndexes(): number[] {
    if (!this.singleSlideOffset) {
      return this._chunkedSlides[this._currentVisibleSlidesIndex]
        .map((slide: SlideWithIndex) => slide.index);
    } else {
      return this._slidesWithIndexes.map((slide: SlideWithIndex) => slide.index);
    }
  }

  /**
   * Sets a slide, which specified through index, as active
   * @param index
   */
  private _select(index: number): void {
    if (isNaN(index)) {
      this.pause();

      return;
    }

    if (!this.multilist) {
      const currentSlide = this._slides.get(this._currentActiveSlide);
      if (currentSlide) {
        currentSlide.active = false;
      }
    }

    const nextSlide = this._slides.get(index);
    if (nextSlide) {
      this._currentActiveSlide = index;
      nextSlide.active = true;
      this.activeSlide = index;
      this.activeSlideChange.emit(index);
    }
  }

  /**
   * Starts loop of auto changing of slides
   */
  private restartTimer() {
    this.resetTimer();
    const interval = +this.interval;
    if (!isNaN(interval) && interval > 0) {
      this.currentInterval = this.ngZone.runOutsideAngular(() => {
        return setInterval(() => {
          const nInterval = +this.interval;
          this.ngZone.run(() => {
            if (
              this.isPlaying &&
              !isNaN(this.interval) &&
              nInterval > 0 &&
              this.slides.length
            ) {
              this.nextSlideFromInterval();
            } else {
              this.pause();
            }
          });
        }, interval);
      });
    }
  }

  get multilist(): boolean {
    return this.itemsPerSlide > 1;
  }

  /**
   * Stops loop of auto changing of slides
   */
  private resetTimer(): void {
    if (this.currentInterval) {
      clearInterval(this.currentInterval);
      this.currentInterval = void 0;
    }
  }
}
