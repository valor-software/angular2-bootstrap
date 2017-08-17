import {
  Component, EventEmitter, Input, OnDestroy, OnInit, Output, ComponentRef, ElementRef,
  Renderer,
  ViewContainerRef
} from '@angular/core';
import { BsDaterangepickerContainerComponent } from './themes/bs/bs-daterangepicker-container.component';
import { Subscription } from 'rxjs/Subscription';
import { ComponentLoaderFactory } from '../component-loader/component-loader.factory';
import { ComponentLoader } from '../component-loader/component-loader.class';

@Component({
  selector: 'bs-daterangepicker,[bsDaterangepicker]',
  exportAs: 'bsDaterangepicker',
  template: ' '
})
export class BsDaterangepickerComponent implements OnInit, OnDestroy {
  /**
   * Placement of a popover. Accepts: "top", "bottom", "left", "right"
   */
  @Input() placement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  /**
   * Specifies events that should trigger. Supports a space separated list of
   * event names.
   */
  @Input() triggers = 'click';

  @Input() outsideClick = true;
  /**
   * A selector specifying the element the popover should be appended to.
   * Currently only supports "body".
   */
  @Input() container = 'body';

  /**
   * Returns whether or not the popover is currently being shown
   */
  @Input()
  public get isOpen(): boolean {
    return this._datepicker.isShown;
  }

  public set isOpen(value: boolean) {
    if (value) { this.show(); } else { this.hide(); }
  }

  /**
   * Emits an event when the popover is shown
   */
  @Output() onShown: EventEmitter<any>;
  /**
   * Emits an event when the popover is hidden
   */
  @Output() onHidden: EventEmitter<any>;

  // here will be parsed options and set defaults
  // @Input()  config: BsDatePickerOptions;
  // configChange: EventEmitter<BsDatePickerOptions> = new EventEmitter();

  _bsValue: Date[];
  @Input()
  set bsValue(value: Date[]) {
    this._bsValue = value;
    this.bsValueChange.emit(value);
  }

  @Output() bsValueChange: EventEmitter<Date[]> = new EventEmitter();

  protected subscriptions: Subscription[] = [];

  private _datepicker: ComponentLoader<BsDaterangepickerContainerComponent>;
  private _datepickerRef: ComponentRef<BsDaterangepickerContainerComponent>;

  constructor(_elementRef: ElementRef,
              _renderer: Renderer,
              _viewContainerRef: ViewContainerRef,
              cis: ComponentLoaderFactory) {
    this._datepicker = cis
      .createLoader<BsDaterangepickerContainerComponent>(_elementRef, _viewContainerRef, _renderer);
    // .provide({provide: PopoverConfig, useValue: _config});
    // Object.assign(this, _config);
    this.onShown = this._datepicker.onShown;
    this.onHidden = this._datepicker.onHidden;
  }

  /**
   * Opens an element’s datepicker. This is considered a “manual” triggering of
   * the datepicker.
   */
  show(): void {
    if (this._datepicker.isShown) {
      return;
    }

    this._datepickerRef = this._datepicker
      .attach(BsDaterangepickerContainerComponent)
      .to(this.container)
      .position({attachment: this.placement})
      .show({placement: this.placement});

    // link with datepicker
    // set initial value of picker
    this._datepickerRef.instance.value = this._bsValue;

    // if date changes from external source (model -> view)
    this.subscriptions.push(this.bsValueChange.subscribe((value: Date[]) => {
      this._datepickerRef.instance.value = value;
    }));

    // if date changes from picker (view -> model)
    this.subscriptions.push(this._datepickerRef.instance
      .valueChange
      .filter((range: Date[]) => range && range[0] && !!range[1])
      .subscribe((value: Date[]) => {
        if (value === this._bsValue) {return; }
        this.bsValueChange.emit(value);
        this.hide();
      }));
  }

  /**
   * Closes an element’s datepicker. This is considered a “manual” triggering of
   * the datepicker.
   */
  hide(): void {
    if (this.isOpen) {
      this._datepicker.hide();
    }
  }

  /**
   * Toggles an element’s datepicker. This is considered a “manual” triggering of
   * the datepicker.
   */
  toggle(): void {
    if (this.isOpen) {
      return this.hide();
    }

    this.show();
  }

  ngOnInit(): any {
    this._datepicker.listen({
      outsideClick: this.outsideClick,
      triggers: this.triggers,
      show: () => this.show()
    });
  }

  ngOnDestroy(): any {
    this._datepicker.dispose();
  }
}
