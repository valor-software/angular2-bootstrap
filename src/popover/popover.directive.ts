import {
  Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output,
  Renderer2, TemplateRef, ViewContainerRef
} from '@angular/core';
import { PopoverConfig } from './popover.config';
import { ComponentLoader, ComponentLoaderFactory } from 'ngx-bootstrap/component-loader';
import { PopoverContainerComponent } from './popover-container.component';
import { PositioningService } from 'ngx-bootstrap/positioning';

/**
 * A lightweight, extensible directive for fancy popover creation.
 */
@Directive({selector: '[popover]', exportAs: 'bs-popover'})
export class PopoverDirective implements OnInit, OnDestroy {
  /** sets disable adaptive position */
  @Input() adaptivePosition: boolean;
  /**
   * Content to be displayed as popover.
   */
  /* tslint:disable-next-line: no-any */
  @Input() popover: string | TemplateRef<any>;
  /**
   * Context to be used if popover is a template.
   */
  /* tslint:disable-next-line: no-any */
  @Input() popoverContext: any;
  /**
   * Title of a popover.
   */
  @Input() popoverTitle: string;
  /**
   * Placement of a popover. Accepts: "top", "bottom", "left", "right"
   */
  @Input() placement: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  /**
   * Close popover on outside click
   */
  @Input() outsideClick = false;
  /**
   * Specifies events that should trigger. Supports a space separated list of
   * event names.
   */
  @Input() triggers: string;
  /**
   * A selector specifying the element the popover should be appended to.
   */
  @Input() container: string;

  /**
   * Css class for popover container
   */
  @Input() containerClass = '';

  /**
   * Returns whether or not the popover is currently being shown
   */
  @Input()
  get isOpen(): boolean {
    return this._popover.isShown;
  }

  set isOpen(value: boolean) {
    if (value) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * Emits an event when the popover is shown
   */
  /* tslint:disable-next-line: no-any */
  @Output() onShown: EventEmitter<any>;
  /**
   * Emits an event when the popover is hidden
   */
  /* tslint:disable-next-line: no-any */
  @Output() onHidden: EventEmitter<any>;

  private _popover: ComponentLoader<PopoverContainerComponent>;
  private _isInited = false;

  constructor(
    _config: PopoverConfig,
    _elementRef: ElementRef,
    _renderer: Renderer2,
    _viewContainerRef: ViewContainerRef,
    cis: ComponentLoaderFactory,
    private _positionService: PositioningService
  ) {
    this._popover = cis
      .createLoader<PopoverContainerComponent>(
        _elementRef,
        _viewContainerRef,
        _renderer
      )
      .provide({provide: PopoverConfig, useValue: _config});

    Object.assign(this, _config);

    this.onShown = this._popover.onShown;
    this.onHidden = this._popover.onHidden;

    // fix: no focus on button on Mac OS #1795
    if (typeof window !== 'undefined') {
      _elementRef.nativeElement.addEventListener('click', function () {
        try {
          _elementRef.nativeElement.focus();
        } catch (err) {
          return;
        }
      });
    }
  }

  /**
   * Opens an element’s popover. This is considered a “manual” triggering of
   * the popover.
   */
  show(): void {
    if (this._popover.isShown || !this.popover) {
      return;
    }

    this._positionService.setOptions({
      modifiers: {
        flip: {
          enabled: this.adaptivePosition
        },
        preventOverflow: {
          enabled: this.adaptivePosition
        }
      }
    });

    this._popover
      .attach(PopoverContainerComponent)
      .to(this.container)
      .position({attachment: this.placement})
      .show({
        content: this.popover,
        context: this.popoverContext,
        placement: this.placement,
        title: this.popoverTitle,
        containerClass: this.containerClass
      });

    if (!this.adaptivePosition) {
      this._positionService.calcPosition();
      this._positionService.deletePositionElement(this._popover._componentRef.location);
    }

    this.isOpen = true;
  }

  /**
   * Closes an element’s popover. This is considered a “manual” triggering of
   * the popover.
   */
  hide(): void {
    if (this.isOpen) {
      this._popover.hide();
      this.isOpen = false;
    }
  }

  /**
   * Toggles an element’s popover. This is considered a “manual” triggering of
   * the popover.
   */
  toggle(): void {
    if (this.isOpen) {
      return this.hide();
    }

    this.show();
  }

  ngOnInit(): void {
    // fix: seems there are an issue with `routerLinkActive`
    // which result in duplicated call ngOnInit without call to ngOnDestroy
    // read more: https://github.com/valor-software/ngx-bootstrap/issues/1885
    if (this._isInited) {
      return;
    }
    this._isInited = true;

    this._popover.listen({
      triggers: this.triggers,
      outsideClick: this.outsideClick,
      show: () => this.show()
    });
  }

  ngOnDestroy(): void {
    this._popover.dispose();
  }
}
