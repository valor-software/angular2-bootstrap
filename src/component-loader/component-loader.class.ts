// todo: add delay support
// todo: merge events onShow, onShown, etc...
// todo: add global positioning configuration?
import {
  ApplicationRef,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  EmbeddedViewRef,
  EventEmitter,
  Injector,
  NgZone,
  Renderer2,
  StaticProvider,
  TemplateRef,
  Type,
  ViewContainerRef
} from '@angular/core';

import { PositioningOptions, PositioningService } from 'ngx-bootstrap/positioning';

import { listenToTriggersV2, registerEscClick, registerOutsideClick } from 'ngx-bootstrap/utils';
import { Subscription } from 'rxjs';

import { ContentRef } from './content-ref.class';
import { ListenOptions } from './listen-options.model';

export class ComponentLoader<T> {
  onBeforeShow = new EventEmitter();
  onShown = new EventEmitter();
  onBeforeHide = new EventEmitter();
  onHidden = new EventEmitter();

  instance?: T;
  _componentRef?: ComponentRef<T>;
  _inlineViewRef?: EmbeddedViewRef<T>;

  private _providers: StaticProvider[] = [];
  private _componentFactory?: ComponentFactory<T>;
  private _zoneSubscription?: Subscription;
  private _contentRef?: ContentRef;
  private _innerComponent?: ComponentRef<T>;

  private _unregisterListenersFn?: () => void;
  private _isHiding = false;
  /**
   * Placement of a component. Accepts: "top", "bottom", "left", "right"
   */
  private attachment?: string;
  /**
   * A selector specifying the element the popover should be appended to.
   */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private container: string | ElementRef | any;
  /**
   * A selector used if container element was not found
   */
  private containerDefaultSelector = 'body';
  /**
   * Specifies events that should trigger. Supports a space separated list of
   * event names.
   */
  private triggers?: string;
  private _listenOpts: ListenOptions = {};
  private _globalListener = Function.prototype;

  /**
   * Do not use this directly, it should be instanced via
   * `ComponentLoadFactory.attach`
   * @internal
   */
  public constructor(
    private _viewContainerRef: ViewContainerRef | undefined,
    private _renderer: Renderer2 | undefined,
    private _elementRef: ElementRef | undefined,
    private _injector: Injector,
    private _componentFactoryResolver: ComponentFactoryResolver,
    private _ngZone: NgZone,
    private _applicationRef: ApplicationRef,
    private _posService: PositioningService
  ) {
  }

  get isShown(): boolean {
    if (this._isHiding) {
      return false;
    }

    return !!this._componentRef;
  }

  attach(compType: Type<T>): ComponentLoader<T> {
    this._componentFactory = this._componentFactoryResolver
      .resolveComponentFactory<T>(compType);

    return this;
  }

  // todo: add behaviour: to target element, `body`, custom element
  to(container?: string | ElementRef): ComponentLoader<T> {
    this.container = container || this.container;

    return this;
  }

  position(opts?: PositioningOptions): ComponentLoader<T> {
    if (!opts) {
      return this;
    }

    this.attachment = opts.attachment || this.attachment;
    this._elementRef = (opts.target as ElementRef) || this._elementRef;

    return this;
  }

  provide(provider: StaticProvider): ComponentLoader<T> {
    this._providers.push(provider);

    return this;
  }

  // todo: appendChild to element or document.querySelector(this.container)

  show(opts: {
         content?: string | TemplateRef<unknown>;
         context?: unknown;
         initialState?: unknown;
         [key: string]: unknown;
         id?: number | string;
       } = {}
  ): ComponentRef<T> | undefined {

    this._subscribePositioning();
    this._innerComponent = void 0;

    if (!this._componentRef) {
      this.onBeforeShow.emit();
      this._contentRef = this._getContentRef(opts.content, opts.context, opts.initialState);

      const injector = Injector.create({
        providers: this._providers,
        parent: this._injector
      });

      if (!this._componentFactory) {
        return;
      }

      this._componentRef = this._componentFactory.create(injector, this._contentRef.nodes);

      this._applicationRef.attachView(this._componentRef.hostView);
      // this._componentRef = this._viewContainerRef
      //   .createComponent(this._componentFactory, 0, injector, this._contentRef.nodes);
      this.instance = this._componentRef.instance;

      Object.assign(this._componentRef.instance, opts);

      if (this.container instanceof ElementRef) {
        this.container.nativeElement.appendChild(
          this._componentRef.location.nativeElement
        );
      }

      if (typeof this.container === 'string' && typeof document !== 'undefined') {
        const selectedElement = document.querySelector(this.container) ||
          document.querySelector(this.containerDefaultSelector);

        if (!selectedElement) {
          return;
        }

        selectedElement.appendChild(this._componentRef.location.nativeElement);
      }

      if (
        !this.container &&
        this._elementRef &&
        this._elementRef.nativeElement.parentElement
      ) {
        this._elementRef.nativeElement.parentElement.appendChild(
          this._componentRef.location.nativeElement
        );
      }

      // we need to manually invoke change detection since events registered
      // via
      // Renderer::listen() are not picked up by change detection with the
      // OnPush strategy
      if (this._contentRef.componentRef) {
        this._innerComponent = this._contentRef.componentRef.instance;
        this._contentRef.componentRef.changeDetectorRef.markForCheck();
        this._contentRef.componentRef.changeDetectorRef.detectChanges();
      }
      this._componentRef.changeDetectorRef.markForCheck();
      this._componentRef.changeDetectorRef.detectChanges();


      this.onShown.emit(opts.id ? { id: opts.id } : this._componentRef.instance);
    }

    this._registerOutsideClick();

    return this._componentRef;
  }

  hide(id?: number | string): ComponentLoader<T> {
    if (!this._componentRef) {
      return this;
    }

    this._posService.deletePositionElement(this._componentRef.location);

    this.onBeforeHide.emit(this._componentRef.instance);

    const componentEl = this._componentRef.location.nativeElement;
    componentEl.parentNode.removeChild(componentEl);
    if (this._contentRef?.componentRef) {
      this._contentRef.componentRef.destroy();
    }

    if (this._viewContainerRef && this._contentRef?.viewRef) {
      this._viewContainerRef.remove(
        this._viewContainerRef.indexOf(this._contentRef.viewRef)
      );
    }
    if (this._contentRef?.viewRef) {
      this._contentRef.viewRef.destroy();
    }

    this._contentRef = void 0;
    this._componentRef = void 0;
    this._removeGlobalListener();

    this.onHidden.emit(id ? { id } : null);

    return this;
  }

  toggle(): void {
    if (this.isShown) {
      this.hide();

      return;
    }

    this.show();
  }

  dispose(): void {
    if (this.isShown) {
      this.hide();
    }

    this._unsubscribePositioning();

    if (this._unregisterListenersFn) {
      this._unregisterListenersFn();
    }
  }

  listen(listenOpts: ListenOptions): ComponentLoader<T> {
    this.triggers = listenOpts.triggers || this.triggers;
    this._listenOpts.outsideClick = listenOpts.outsideClick;
    this._listenOpts.outsideEsc = listenOpts.outsideEsc;
    listenOpts.target = listenOpts.target || this._elementRef?.nativeElement;

    const hide = (this._listenOpts.hide = () =>
      listenOpts.hide ? listenOpts.hide() : void this.hide());
    const show = (this._listenOpts.show = (registerHide) => {
      listenOpts.show ? listenOpts.show(registerHide) : this.show(registerHide);
      registerHide();
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toggle = (registerHide: any) => {
      this.isShown ? hide() : show(registerHide);
    };

    if (this._renderer) {
      this._unregisterListenersFn = listenToTriggersV2(this._renderer, {
        target: listenOpts.target,
        triggers: listenOpts.triggers,
        show,
        hide,
        toggle
      });
    }

    return this;
  }

  _removeGlobalListener() {
    if (this._globalListener) {
      this._globalListener();
      this._globalListener = Function.prototype;
    }
  }

  attachInline(
    vRef: ViewContainerRef | undefined,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    template: TemplateRef<any> | undefined
  ): ComponentLoader<T> {
    if (vRef && template) {
      this._inlineViewRef = vRef.createEmbeddedView(template);
    }

    return this;
  }

  _registerOutsideClick(): void {
    if (!this._componentRef || !this._componentRef.location) {
      return;
    }
    // why: should run after first event bubble
    if (this._listenOpts.outsideClick) {
      const target = this._componentRef.location.nativeElement;
      setTimeout(() => {
        if (this._renderer && this._elementRef) {
          this._globalListener = registerOutsideClick(this._renderer, {
            targets: [target, this._elementRef.nativeElement],
            outsideClick: this._listenOpts.outsideClick,
            hide: () => this._listenOpts.hide && this._listenOpts.hide()
          });
        }
      });
    }
    if (this._listenOpts.outsideEsc && this._renderer && this._elementRef) {
      const target = this._componentRef.location.nativeElement;
      this._globalListener = registerEscClick(this._renderer, {
        targets: [target, this._elementRef.nativeElement],
        outsideEsc: this._listenOpts.outsideEsc,
        hide: () => this._listenOpts.hide && this._listenOpts.hide()
      });
    }
  }

  getInnerComponent(): ComponentRef<T> | undefined {
    return this._innerComponent;
  }

  private _subscribePositioning(): void {
    if (this._zoneSubscription || !this.attachment) {
      return;
    }

    this.onShown.subscribe(() => {
      this._posService.position({
        element: this._componentRef?.location,
        target: this._elementRef,
        attachment: this.attachment,
        appendToBody: this.container === 'body'
      });
    });

    this._zoneSubscription = this._ngZone.onStable.subscribe(() => {
      if (!this._componentRef) {
        return;
      }

      this._posService.calcPosition();
    });
  }

  private _unsubscribePositioning(): void {
    if (!this._zoneSubscription) {
      return;
    }

    this._zoneSubscription.unsubscribe();
    this._zoneSubscription = void 0;
  }

  private _getContentRef(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    content: string | TemplateRef<any> | any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    context?: any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialState?: any
  ): ContentRef {
    if (!content) {
      return new ContentRef([]);
    }

    if (content instanceof TemplateRef) {
      if (this._viewContainerRef) {
        const _viewRef = this._viewContainerRef
          .createEmbeddedView<TemplateRef<T>>(content, context);
        _viewRef.markForCheck();

        return new ContentRef([_viewRef.rootNodes], _viewRef);
      }
      const viewRef = content.createEmbeddedView(context);
      this._applicationRef.attachView(viewRef);

      return new ContentRef([viewRef.rootNodes], viewRef);
    }

    if (typeof content === 'function') {
      const contentCmptFactory = this._componentFactoryResolver.resolveComponentFactory(
        content
      );

      const modalContentInjector = Injector.create({
        providers: this._providers,
        parent: this._injector
      });

      const componentRef = contentCmptFactory.create(modalContentInjector);
      Object.assign(componentRef.instance, initialState);
      this._applicationRef.attachView(componentRef.hostView);

      return new ContentRef(
        [[componentRef.location.nativeElement]],
        componentRef.hostView,
        componentRef
      );
    }

    const nodes = this._renderer
      ? [this._renderer.createText(`${content}`)]
      : [];
    return new ContentRef([nodes]);
  }
}
