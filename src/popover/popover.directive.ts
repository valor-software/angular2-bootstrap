import {
  Directive, Input, Output, EventEmitter, OnInit, OnDestroy, Renderer,
  ElementRef, TemplateRef, ViewContainerRef
} from '@angular/core';
import { PopoverConfig } from './popover.config';
import { ComponentLoaderFactory, ComponentLoader } from '../component-loader';
import { PopoverContainerComponent } from './popover-container.component';

/**
 * A lightweight, extensible directive for fancy popover creation.
 */
@Directive({selector: '[popover]', exportAs: 'bs-popover'})
export class PopoverDirective implements OnInit, OnDestroy {
  /**
   * Content to be displayed as popover.
   */
  @Input() public popover: string | TemplateRef<any>;
  /**
   * Title of a popover.
   */
  @Input() public popoverTitle: string;
  /**
   * Placement of a popover. Accepts: "top", "bottom", "left", "right"
   */
  @Input() public placement: 'top' | 'bottom' | 'left' | 'right';

  @Input() outsideClick = false;
  /**
   * Specifies events that should trigger. Supports a space separated list of
   * event names.
   */
  @Input() public triggers: string;
  /**
   * A selector specifying the element the popover should be appended to.
   * Currently only supports "body".
   */
  @Input() public container: string;
  /**
   * Specifies if popover should be closed after clicking outside
   */
  @Input() public popoverCloseOnClickOutside: boolean;

  /**
   * Css class for popover container
   */
  @Input() public containerClass: string = '';

  /**
   * Returns whether or not the popover is currently being shown
   */
  @Input()
  public get isOpen(): boolean { return this._popover.isShown; }

  public set isOpen(value: boolean) {
    if (value) {this.show();} else {this.hide();}
  }

  /**
   * Emits an event when the popover is shown
   */
  @Output() public onShown: EventEmitter<any>;
  /**
   * Emits an event when the popover is hidden
   */
  @Output() public onHidden: EventEmitter<any>;

  protected _popover: ComponentLoader<PopoverContainerComponent>;
  protected _outsideClickListener: Function;
  protected _elementRef: ElementRef;
  protected _renderer: Renderer;
  protected _viewContainerRef: ViewContainerRef;
  protected _isInited = false;

  public constructor(_elementRef: ElementRef,
                     _renderer: Renderer,
                     _viewContainerRef: ViewContainerRef,
                     _config: PopoverConfig,
                     cis: ComponentLoaderFactory) {
    this._popover = cis
      .createLoader<PopoverContainerComponent>(_elementRef, _viewContainerRef, _renderer)
      .provide({provide: PopoverConfig, useValue: _config});
    Object.assign(this, _config);
    this.onShown = this._popover.onShown;
    this.onHidden = this._popover.onHidden;
    this._elementRef = _elementRef;
    this._renderer = _renderer;
    this._viewContainerRef = _viewContainerRef;

    // fix: no focus on button on Mac OS #1795
    _elementRef.nativeElement.addEventListener('click', function() {
      try {
         _elementRef.nativeElement.focus();
      } catch(err) {
        return;
      }
    });

  }

  /**
   * Opens an element’s popover. This is considered a “manual” triggering of
   * the popover.
   */
  public show(): void {
    if (this._popover.isShown) {
      return;
    }

    this._popover
      .attach(PopoverContainerComponent)
      .to(this.container)
      .position({attachment: this.placement})
      .show({
        content: this.popover,
        placement: this.placement,
        title: this.popoverTitle,
        containerClass: this.containerClass
      });

    if (this.popoverCloseOnClickOutside) {
      this._outsideClickListener = this._renderer.listenGlobal('document', 'mousedown',
        ($event: MouseEvent) => this.onMouseDown($event.target));
    }

    this.isOpen = true;
  }

  /**
   * Closes an element’s popover. This is considered a “manual” triggering of
   * the popover.
   */
  public hide(): void {
    if (this.isOpen) {
      this._popover.hide();
      this.isOpen = false;
    }
    if (this._outsideClickListener) {
      this._outsideClickListener();
    }
  }

  /**
   * Toggles an element’s popover. This is considered a “manual” triggering of
   * the popover.
   */
  public toggle(): void {
    if (this.isOpen) {
      return this.hide();
    }

    this.show();
  }

  public ngOnInit(): any {
    // fix: seems there are an issue with `routerLinkActive`
    // which result in duplicated call ngOnInit without call to ngOnDestroy
    // read more: https://github.com/valor-software/ngx-bootstrap/issues/1885
    if (this._isInited) { return; }
    this._isInited = true;

    this._popover.listen({
      triggers: this.triggers,
      outsideClick: this.outsideClick,
      show: () => this.show()
    });
  }

  public ngOnDestroy(): any {
    this._popover.dispose();
  }

  protected onMouseDown(target: EventTarget): void {
    if (!this.popoverCloseOnClickOutside) return;
    if (!this._getContainerNativeElement()) return;
    if (this._elementRef.nativeElement === target) return; // if popover toggle element was clicked
    if (this._getContainerNativeElement().contains(target)) return; // if clicked on popover content

    this.hide();
  }

  protected _getContainerNativeElement(): any {
    if (!this._popover._componentRef) return null;
    return (<any>this._popover._componentRef)._nativeElement;
  }
}
