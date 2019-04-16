import {
  AnimationBuilder,
  AnimationFactory,
  AnimationPlayer
} from '@angular/animations';

// todo: add animations when https://github.com/angular/angular/issues/9947 solved
import {
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  Renderer2
} from '@angular/core';

import {
  collapseAnimation,
  expandAnimation
} from './collapse-animations';

@Directive({
  selector: '[collapse]',
  exportAs: 'bs-collapse',
  host: {
    '[class.collapse]': 'true',
    '[style.overflow]': '"hidden"'
  }
})
export class CollapseDirective {
  /** This event fires as soon as content collapses */
  @Output() collapsed: EventEmitter<CollapseDirective> = new EventEmitter();
  /** This event fires when collapsing is started */
  @Output() collapses: EventEmitter<CollapseDirective> = new EventEmitter();
  /** This event fires as soon as content becomes visible */
  @Output() expanded: EventEmitter<CollapseDirective> = new EventEmitter();
  /** This event fires when expansion is started */
  @Output() expands: EventEmitter<CollapseDirective> = new EventEmitter();

  // shown
  @HostBinding('class.in')
  @HostBinding('class.show')
  @HostBinding('attr.aria-expanded')
  isExpanded = true;
  // hidden
  @HostBinding('attr.aria-hidden') isCollapsed = false;
  // stale state
  @HostBinding('class.collapse') isCollapse = true;
  // animation state
  @HostBinding('class.collapsing') isCollapsing = false;

  @Input()
  set display(value: string) {
    if (!this.isAnimated) {
      this._renderer.setStyle(this._el.nativeElement, 'display', value);

      return;
    }

    this._display = value;

    if (value === 'none') {
      this.hide();

      return;
    }

    this.show();
  }
  /** turn on/off animation */
  @Input() isAnimated = false;
  /** A flag indicating visibility of content (shown or hidden) */
  @Input()
  set collapse(value: boolean) {
    this.isExpanded = value;
    this.toggle();
  }

  get collapse(): boolean {
    return this.isExpanded;
  }

  private _display = 'block';
  private _factoryCollapseAnimation: AnimationFactory;
  private _factoryExpandAnimation: AnimationFactory;
  private _player: AnimationPlayer;

  private _COLLAPSE_ACTION_NAME = 'collapse';
  private _EXPAND_ACTION_NAME = 'expand';

  constructor(
    private _el: ElementRef,
    private _renderer: Renderer2,
    _builder: AnimationBuilder
  ) {
    this._factoryCollapseAnimation = _builder.build(collapseAnimation);
    this._factoryExpandAnimation = _builder.build(expandAnimation);
  }

  /** allows to manually toggle content visibility */
  toggle(): void {
    if (this.isExpanded) {
      this.hide();
    } else {
      this.show();
    }
  }

  /** allows to manually hide content */
  hide(): void {
    this.collapses.emit(this);
    this.isExpanded = false;
    this.isCollapsed = true;

    this.animationRun(this.isAnimated, this._COLLAPSE_ACTION_NAME)(() => {
      this.isCollapse = true;
      this.collapsed.emit(this);

      this._renderer.setStyle(this._el.nativeElement, 'display', 'none');
    });
  }
  /** allows to manually show collapsed content */
  show(): void {
    this._renderer.setStyle(this._el.nativeElement, 'display', this._display);
    this.expands.emit(this);
    this.isExpanded = true;
    this.isCollapsed = false;

    this.animationRun(this.isAnimated, this._EXPAND_ACTION_NAME)(() => {
      this.isCollapse = true;
      this.expanded.emit(this);
    });
  }

  animationRun(isAnimated: boolean, action: string) {
    if (!isAnimated) {
      return (callback: () => void) => callback();
    }

    const factoryAnimation = (action === this._EXPAND_ACTION_NAME)
      ? this._factoryExpandAnimation
      : this._factoryCollapseAnimation;

    if (this._player) {
      this._player.destroy();
    }

    this._player = factoryAnimation.create(this._el.nativeElement);
    this._player.play();

    return (callback: () => void) => this._player.onDone(callback);
  }
}
