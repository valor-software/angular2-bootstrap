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
  @Input() noWrap = false;
  /*  If `true` — will disable pausing on carousel mouse hover */
  @Input() noPause = false;
  /*  If `true` — carousel-indicators are visible  */
  @Input() showIndicators = true;
  /*  If `true` - autoplay will be stopped on focus */
  @Input() pauseOnFocus = false;
  /* If `true` - carousel indicators indicate slides chunks
     works ONLY if singleSlideOffset = FALSE */
  @Input() indicatorsByChunk = false;
  /* If value more then 1 — carousel works in multilist mode */
  @Input() itemsPerSlide = 1;
  /* If `true` — carousel shifts by one element. By default carousel shifts by number
     of visible elements (itemsPerSlide field) */
  @Input() singleSlideOffset = false;
  /** Turn on/off animation. Animation doesn't work for multilist carousel */
  @Input() isAnimated = false;

  /** Will be emitted when active slide has been changed. Part of two-way-bindable [(activeSlide)] property */
  @Output()
  activeSlideChange = new EventEmitter<number>(false);

  /** Will be emitted when active slides has been changed in multilist mode */
  @Output()
  slideRangeChange = new EventEmitter<number[]|void>();

  /** Index of currently displayed slide(started for 0) */
  @Input()
  set activeSlide(index: number) {
    if (this.multilist) {
      return;
    }
    if (this._slides.length) {
      this._select(index);
    }
  }

  get activeSlide(): number {
    return this._currentActiveSlide || 0;
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

  protected currentInterval?: number;
  protected _currentActiveSlide?: number;
  protected _interval = 5000;
  protected _slides: LinkedList<SlideComponent> = new LinkedList<SlideComponent>();
  protected _chunkedSlides?: SlideWithIndex[][];
  protected _slidesWithIndexes?: SlideWithIndex[];
  protected _currentVisibleSlidesIndex = 0;
  protected isPlaying = false;
  protected destroyed = false;

  get isBs4(): boolean {
    return !isBs3();
  }

  constructor(config: CarouselConfig, private ngZone: NgZone) {
    Object.assign(this, config);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      if (this.singleSlideOffset) {
        this.indicatorsByChunk = false;
      }
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

    if (!this.multilist && this.isAnimated) {
      slide.isAnimated = true;
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
      let nextSlideIndex: number;
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
      this.activeSlide = this.findNextSlideIndex(direction, force) || 0;
    } else {
      this.moveMultilist(direction);
    }
  }

  /**
   * Swith slides by enter, space and arrows keys
   * @internal
   */
  keydownPress(event: KeyboardEvent) {
    if (event.keyCode === 13 || event.key === 'Enter' || event.keyCode === 32 || event.key === 'Space') {
      this.nextSlide();
      event.preventDefault();

      return;
    }

    if (event.keyCode === 37 || event.key === 'LeftArrow') {
      this.previousSlide();

      return;
    }

    if (event.keyCode === 39 || event.key === 'RightArrow') {
      this.nextSlide();

      return;
    }
  }

  /**
   * Play on mouse leave
   * @internal
   */
  onMouseLeave(): void {
    if (!this.pauseOnFocus) {
      this.play();
    }
  }

  /**
   * Play on mouse up
   * @internal
   */
  onMouseUp(): void {
    if (!this.pauseOnFocus) {
      this.play();
    }
  }

  /**
   * When slides on focus autoplay is stopped(optional)
   * @internal
   */
  pauseFocusIn(): void {
    if (this.pauseOnFocus) {
      this.isPlaying = false;
      this.resetTimer();
    }
  }

  /**
   * When slides out of focus autoplay is started
   * @internal
   */
  pauseFocusOut(): void {
    this.play();
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
      this.activeSlide = this.indicatorsByChunk ? index * this.itemsPerSlide : index;
    } else {
      this.selectSlideRange(this.indicatorsByChunk ? index * this.itemsPerSlide : index);
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

  indicatorsSlides(): SlideComponent[] {
    return this.slides.filter(
      (slide: SlideComponent, index: number) => !this.indicatorsByChunk || index % this.itemsPerSlide === 0
    );
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

        this._slidesWithIndexes = [
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
  private findNextSlideIndex(direction: Direction, force: boolean): number | void {
    let nextSlideIndex = 0;

    if (
      !force &&
      (this.isLast(this.activeSlide) &&
        direction !== Direction.PREV &&
        this.noWrap)
    ) {
      return;
    }

    switch (direction) {
      case Direction.NEXT:
        // if this is last slide, not force, looping is disabled
        // and need to going forward - select current slide, as a next
        if (typeof this._currentActiveSlide === 'undefined') {
          nextSlideIndex = 0;
          break;
        }
        if (!this.isLast(this._currentActiveSlide)) {
          nextSlideIndex = this._currentActiveSlide + 1;
          break;
        }
        nextSlideIndex = !force && this.noWrap ? this._currentActiveSlide : 0;
        break;
      case Direction.PREV:
        // if this is first slide, not force, looping is disabled
        // and need to going backward - select current slide, as a next
        if (typeof this._currentActiveSlide === 'undefined') {
          nextSlideIndex = 0;
          break;
        }
        if (this._currentActiveSlide > 0) {
          nextSlideIndex = this._currentActiveSlide - 1;
          break;
        }
        if (!force && this.noWrap) {
          nextSlideIndex = this._currentActiveSlide;
          break;
        }
        nextSlideIndex = this._slides.length - 1;
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
    if (!this._chunkedSlides) {
      return;
    }

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

    if (!selectedRange) {
      return;
    }

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
    if (this.singleSlideOffset && this._slidesWithIndexes) {
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
    if (!this._chunkedSlides) {
      return false;
    }
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

      const slideToHide = this._slides.get(indexToHide);
      if (slideToHide) {
        slideToHide.active = false;
      }

      const slideToShow = this._slides.get(indexToShow);
      if (slideToShow) {
        slideToShow.active = true;
      }

      const slidesToReorder = this.mapSlidesAndIndexes().filter(
        (slide: SlideWithIndex) => slide.item.active
      );

      this.makeSlidesConsistent(slidesToReorder);

      this.slideRangeChange.emit(this.getVisibleIndexes());
      return;
    }

    if (!this._slidesWithIndexes || !this._slidesWithIndexes[0]) {
      return;
    }

    let index: number;

    firstVisibleIndex = this._slidesWithIndexes[0].index;
    lastVisibleIndex = this._slidesWithIndexes[this._slidesWithIndexes.length - 1].index;

    if (direction === Direction.NEXT) {
      this._slidesWithIndexes.shift();

      index = this.isLast(lastVisibleIndex)
        ? 0
        : lastVisibleIndex + 1;

      const item = this._slides.get(index);

      if (item) {
        this._slidesWithIndexes.push({ index, item });
      }
    } else {
      this._slidesWithIndexes.pop();
      index = this.isFirst(firstVisibleIndex)
        ? this._slides.length - 1
        : firstVisibleIndex - 1;

      const item = this._slides.get(index);
      if (item) {
        this._slidesWithIndexes = [{ index, item }, ...this._slidesWithIndexes];
      }
    }

    this.hideSlides();

    this._slidesWithIndexes.forEach(slide => slide.item.active = true);

    this.makeSlidesConsistent(this._slidesWithIndexes);

    this.slideRangeChange.emit(
      this._slidesWithIndexes.map((slide: SlideWithIndex) => slide.index)
    );
  }

  private makeSlidesConsistent = (slides: SlideWithIndex[]): void => {
    slides.forEach((slide: SlideWithIndex, index: number) => slide.item.order = index);
  };

  private moveMultilist(direction: Direction): void {
    if (this.singleSlideOffset) {
      this.moveSliderByOneItem(direction);
    } else {
      this.hideSlides();

      if (this.noWrap) {
        this._currentVisibleSlidesIndex = direction === Direction.NEXT
          ? this._currentVisibleSlidesIndex + 1
          : this._currentVisibleSlidesIndex - 1;
      } else if (direction === Direction.NEXT) {
        this._currentVisibleSlidesIndex = this.isVisibleSlideListLast()
          ? 0
          : this._currentVisibleSlidesIndex + 1;
      } else {
        if (this.isVisibleSlideListFirst()) {
          this._currentVisibleSlidesIndex = this._chunkedSlides
            ? this._chunkedSlides.length - 1
            : 0;
        } else {
          this._currentVisibleSlidesIndex = this._currentVisibleSlidesIndex - 1;
        }
      }

      if (this._chunkedSlides) {
        this._chunkedSlides[this._currentVisibleSlidesIndex].forEach(
          (slide: SlideWithIndex) => slide.item.active = true
        );
      }

      this.slideRangeChange.emit(this.getVisibleIndexes());
    }
  }

  private getVisibleIndexes(): number[] | void {
    if (!this.singleSlideOffset && this._chunkedSlides) {
      return this._chunkedSlides[this._currentVisibleSlidesIndex]
        .map((slide: SlideWithIndex) => slide.index);
    }
    if (this._slidesWithIndexes) {
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

    if (!this.multilist && typeof this._currentActiveSlide !== 'undefined') {
      const currentSlide = this._slides.get(this._currentActiveSlide);
      if (typeof currentSlide !== 'undefined') {
        currentSlide.active = false;
      }
    }

    const nextSlide = this._slides.get(index);
    if (typeof nextSlide !== 'undefined') {
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
      this.currentInterval = this.ngZone.runOutsideAngular<number>(() => {
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
