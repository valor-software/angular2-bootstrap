// tslint:disable:deprecation
import {
  Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output,
  Renderer2, TemplateRef, ViewContainerRef
} from '@angular/core';
import { TooltipContainerComponent } from './tooltip-container.component';
import { TooltipConfig } from './tooltip.config';
import { ComponentLoader, ComponentLoaderFactory } from '../component-loader';
import { OnChange } from '../utils/decorators';
import { warnOnce } from '../utils/warn-once';

@Directive({
  selector: '[tooltip], [tooltipHtml]',
  exportAs: 'bs-tooltip'
})
export class TooltipDirective implements OnInit, OnDestroy {
  /**
   * Content to be displayed as tooltip.
   */
  @OnChange()
  @Input()
  tooltip: string | TemplateRef<any>;
  /** Fired when tooltip content changes */
  @Output()
  tooltipChange: EventEmitter<string | TemplateRef<any>> = new EventEmitter();

  /**
   * Placement of a tooltip. Accepts: "top", "bottom", "left", "right"
   */
  @Input() placement: string;
  /**
   * Specifies events that should trigger. Supports a space separated list of
   * event names.
   */
  @Input() triggers: string;
  /**
   * A selector specifying the element the tooltip should be appended to.
   * Currently only supports "body".
   */
  @Input() container: string;

  /**
   * Returns whether or not the tooltip is currently being shown
   */
  @Input()
  get isOpen(): boolean {
    return this._tooltip.isShown;
  }

  set isOpen(value: boolean) {
    if (value) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * Allows to disable tooltip
   */
  @Input() isDisabled: boolean;

  /**
   * Css class for tooltip container
   */
  @Input() containerClass = '';

  /**
   * Emits an event when the tooltip is shown
   */
  @Output() onShown: EventEmitter<any>;
  /**
   * Emits an event when the tooltip is hidden
   */
  @Output() onHidden: EventEmitter<any>;

  /** @deprecated - please use `tooltip` instead */
  @Input('tooltipHtml')
  set htmlContent(value: string | TemplateRef<any>) {
    warnOnce('tooltipHtml was deprecated, please use `tooltip` instead');
    this.tooltip = value;
  }

  /** @deprecated - please use `placement` instead */
  @Input('tooltipPlacement')
  set _placement(value: string) {
    warnOnce('tooltipPlacement was deprecated, please use `placement` instead');
    this.placement = value;
  }

  /** @deprecated - please use `isOpen` instead*/
  @Input('tooltipIsOpen')
  set _isOpen(value: boolean) {
    warnOnce('tooltipIsOpen was deprecated, please use `isOpen` instead');
    this.isOpen = value;
  }

  get _isOpen(): boolean {
    warnOnce('tooltipIsOpen was deprecated, please use `isOpen` instead');
    return this.isOpen;
  }

  /** @deprecated - please use `isDisabled` instead */
  @Input('tooltipEnable')
  set _enable(value: boolean) {
    warnOnce('tooltipEnable was deprecated, please use `isDisabled` instead');
    this.isDisabled = value;
  }

  get _enable(): boolean {
    warnOnce('tooltipEnable was deprecated, please use `isDisabled` instead');
    return this.isDisabled;
  }

  /** @deprecated - please use `container="body"` instead */
  @Input('tooltipAppendToBody')
  set _appendToBody(value: boolean) {
    warnOnce(
      'tooltipAppendToBody was deprecated, please use `container="body"` instead'
    );
    this.container = value ? 'body' : this.container;
  }

  get _appendToBody(): boolean {
    warnOnce(
      'tooltipAppendToBody was deprecated, please use `container="body"` instead'
    );
    return this.container === 'body';
  }

  /** @deprecated - removed, will be added to configuration */
  @Input('tooltipAnimation') _animation = true;

  /** @deprecated - will replaced with customClass */
  @Input('tooltipClass')
  set _popupClass(value: string) {
    warnOnce('tooltipClass deprecated');
  }

  /** @deprecated - removed */
  @Input('tooltipContext')
  set _tooltipContext(value: any) {
    warnOnce('tooltipContext deprecated');
  }

  /** @deprecated */
  @Input('tooltipPopupDelay') _delay = 0;

  /** @deprecated */
  @Input('tooltipFadeDuration') _fadeDuration = 150;

  /** @deprecated -  please use `triggers` instead */
  @Input('tooltipTrigger')
  get _tooltipTrigger(): string | string[] {
    warnOnce('tooltipTrigger was deprecated, please use `triggers` instead');
    return this.triggers;
  }

  set _tooltipTrigger(value: string | string[]) {
    warnOnce('tooltipTrigger was deprecated, please use `triggers` instead');
    this.triggers = (value || '').toString();
  }

  /** @deprecated */
  @Output()
  tooltipStateChanged: EventEmitter<boolean> = new EventEmitter<boolean>();
  protected _delayTimeoutId: number | any;

  private _tooltip: ComponentLoader<TooltipContainerComponent>;

  constructor(_viewContainerRef: ViewContainerRef,
                     _renderer: Renderer2,
                     _elementRef: ElementRef,
                     cis: ComponentLoaderFactory,
                     config: TooltipConfig) {
    this._tooltip = cis
      .createLoader<TooltipContainerComponent>(
        _elementRef,
        _viewContainerRef,
        _renderer
      )
      .provide({provide: TooltipConfig, useValue: config});

    Object.assign(this, config);
    this.onShown = this._tooltip.onShown;
    this.onHidden = this._tooltip.onHidden;
  }

  ngOnInit(): void {
    this._tooltip.listen({
      triggers: this.triggers,
      show: () => this.show()
    });
    this.tooltipChange.subscribe((value: any) => {
      if (!value) {
        this._tooltip.hide();
      }
    });
  }

  /**
   * Toggles an element’s tooltip. This is considered a “manual” triggering of
   * the tooltip.
   */
  toggle(): void {
    if (this.isOpen) {
      return this.hide();
    }

    this.show();
  }

  /**
   * Opens an element’s tooltip. This is considered a “manual” triggering of
   * the tooltip.
   */
  show(): void {
    if (
      this.isOpen ||
      this.isDisabled ||
      this._delayTimeoutId ||
      !this.tooltip
    ) {
      return;
    }

    const showTooltip = () => {
      if (this._delayTimeoutId) {
        this._delayTimeoutId = undefined;
      }

      this._tooltip
        .attach(TooltipContainerComponent)
        .to(this.container)
        .position({attachment: this.placement})
        .show({
          content: this.tooltip,
          placement: this.placement,
          containerClass: this.containerClass
        });
    }

    if (this._delay) {
      this._delayTimeoutId = setTimeout(() => {
        showTooltip();
      }, this._delay);
    } else {
      showTooltip();
    }
  }

  /**
   * Closes an element’s tooltip. This is considered a “manual” triggering of
   * the tooltip.
   */
  hide(): void {
    if (this._delayTimeoutId) {
      clearTimeout(this._delayTimeoutId);
      this._delayTimeoutId = undefined;
    }

    if (!this._tooltip.isShown) {
      return;
    }

    this._tooltip.instance.classMap.in = false;
    setTimeout(() => {
      this._tooltip.hide();
    }, this._fadeDuration);
  }

  ngOnDestroy(): void {
    this._tooltip.dispose();
  }
}
