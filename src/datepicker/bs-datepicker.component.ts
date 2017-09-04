import {
  Component, ComponentRef,
  ElementRef,
  EventEmitter,
  Input, OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer, SimpleChanges,
  ViewContainerRef
} from '@angular/core';
import { ComponentLoader } from '../component-loader/component-loader.class';
import { ComponentLoaderFactory } from '../component-loader/component-loader.factory';
import { BsDatepickerContainerComponent } from './themes/bs/bs-datepicker-container.component';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/operator/filter';
import { BsDatepickerConfig } from './bs-datepicker.config';

@Component({
  selector: 'bs-datepicker,[bsDatepicker]',
  exportAs: 'bsDatepicker',
  template: '<ng-content></ng-content>'
})
export class BsDatepickerComponent implements OnInit, OnDestroy, OnChanges {
  /**
   * Placement of a popover. Accepts: "top", "bottom", "left", "right"
   */
  @Input() placement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';
  /**
   * Specifies events that should trigger. Supports a space separated list of
   * event names.
   */
  @Input() triggers = 'click';
  /**
   * Close datepicker on outside click
   */
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

  // @Input()  config: BsDatePickerOptions;
  // configChange: EventEmitter<BsDatePickerOptions> = new EventEmitter();

  _bsValue: Date;
  /**
   * Initial value of datepicker
   */
  @Input()
  set bsValue(value: Date) {
    if (this._bsValue === value) { return; }
    this._bsValue = value;
    this.bsValueChange.emit(value);
  }

  /**
   * Config object for datepicker
   */
  @Input() bsConfig: Partial<BsDatepickerConfig>;
  /**
   * Indicates whether datepicker is enabled or not
   */
  @Input() isDisabled: boolean;
  /**
   * Minimum date which is available for selection
   */
  @Input() minDate: Date;
  /**
   * Maximum date which is available for selection
   */
  @Input() maxDate: Date;
  /**
   * Emits when datepicker value has been changed
   */
  @Output() bsValueChange: EventEmitter<Date> = new EventEmitter();

  protected _subs: Subscription[] = [];

  private _datepicker: ComponentLoader<BsDatepickerContainerComponent>;
  private _datepickerRef: ComponentRef<BsDatepickerContainerComponent>;

  constructor(private _config: BsDatepickerConfig,
              _elementRef: ElementRef,
              _renderer: Renderer,
              _viewContainerRef: ViewContainerRef,
              cis: ComponentLoaderFactory) {
    // todo: assign only subset of fields
    Object.assign(this, this._config);
    this._datepicker = cis
      .createLoader<BsDatepickerContainerComponent>(_elementRef, _viewContainerRef, _renderer);
    this.onShown = this._datepicker.onShown;
    this.onHidden = this._datepicker.onHidden;
  }

  ngOnInit(): any {
    this._datepicker.listen({
      outsideClick: this.outsideClick,
      triggers: this.triggers,
      show: () => this.show()
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this._datepickerRef || !this._datepickerRef.instance) {
      return;
    }

    if (changes.minDate) {
      this._datepickerRef.instance.minDate = this.minDate;
    }

    if (changes.maxDate) {
      this._datepickerRef.instance.maxDate = this.maxDate;
    }

    if (changes.maxDate) {
      this._datepickerRef.instance.isDisabled = this.isDisabled;
    }
  }

  /**
   * Opens an element’s datepicker. This is considered a “manual” triggering of
   * the datepicker.
   */
  show(): void {
    if (this._datepicker.isShown) {
      return;
    }

    const config = Object.assign({}, this._config, this.bsConfig, {
      value: this._bsValue,
      minDate: this.minDate || this._config.minDate,
      maxDate: this.maxDate || this._config.maxDate
    });

    this._datepickerRef = this._datepicker
      .provide({provide: BsDatepickerConfig, useValue: config})
      .attach(BsDatepickerContainerComponent)
      .to(this.container)
      .position({attachment: this.placement})
      .show({placement: this.placement});

    // if date changes from external source (model -> view)
    this._subs.push(this.bsValueChange.subscribe((value: Date) => {
      this._datepickerRef.instance.value = value;
    }));

    // if date changes from picker (view -> model)
    this._subs.push(this._datepickerRef.instance
      .valueChange.subscribe((value: Date) => {
        this.bsValue = value;
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
    for (const sub of this._subs) {
      sub.unsubscribe();
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

  ngOnDestroy(): any {
    this._datepicker.dispose();
  }
}
