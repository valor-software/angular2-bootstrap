import {
  ComponentRef,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewContainerRef
} from '@angular/core';

import { ComponentLoader, ComponentLoaderFactory } from 'ngx-bootstrap/component-loader';

import { Subscription } from 'rxjs';
import { BsDatepickerInlineConfig } from './bs-datepicker-inline.config';

import { BsDatepickerConfig } from './bs-datepicker.config';
import { DatepickerDateCustomClasses, DatepickerDateTooltipText } from './models';
import { BsDatepickerInlineContainerComponent } from './themes/bs/bs-datepicker-inline-container.component';
import { checkBsValue } from './utils/bs-calendar-utils';

@Directive({
  selector: 'bs-datepicker-inline',
  exportAs: 'bsDatepickerInline'
})
export class BsDatepickerInlineDirective implements OnInit, OnDestroy, OnChanges {
  /**
   * Config object for datepicker
   */
  @Input() bsConfig?: Partial<BsDatepickerInlineConfig>;
  /**
   * Indicates whether datepicker is enabled or not
   */
  @Input() isDisabled = false;
  /**
   * Minimum date which is available for selection
   */
  @Input() minDate?: Date;
  /**
   * Maximum date which is available for selection
   */
  @Input() maxDate?: Date;
  /**
   * Date custom classes
   */
  @Input() dateCustomClasses?: DatepickerDateCustomClasses[];
  /**
   * Date tooltip text
   */
  @Input() dateTooltipTexts?: DatepickerDateTooltipText[];
  /**
   * Disable specific dates
   */
  @Input() datesEnabled?: Date[];
  /**
   * Enable specific dates
   */
  @Input() datesDisabled?: Date[];
  /**
   * Emits when datepicker value has been changed
   */
  @Output() bsValueChange: EventEmitter<Date> = new EventEmitter();
  protected _subs?: Subscription;
  private readonly _datepicker: ComponentLoader<BsDatepickerInlineContainerComponent>;
  private _datepickerRef?: ComponentRef<BsDatepickerInlineContainerComponent>;

  constructor(
    public _config: BsDatepickerInlineConfig,
    private _elementRef: ElementRef,
    _renderer: Renderer2,
    _viewContainerRef: ViewContainerRef,
    cis: ComponentLoaderFactory
  ) {
    // todo: assign only subset of fields
    Object.assign(this, this._config);
    this._datepicker = cis.createLoader<BsDatepickerInlineContainerComponent>(
      _elementRef,
      _viewContainerRef,
      _renderer
    );
  }

  _bsValue?: Date;

  /**
   * Initial value of datepicker
   */
  @Input()
  set bsValue(value: Date) {
    if (this._bsValue === value) {
      return;
    }

    if (!this._bsValue && value) {
      const now = new Date();

      value.setMilliseconds(now.getMilliseconds());
      value.setSeconds(now.getSeconds());
      value.setMinutes(now.getMinutes());
      value.setHours(now.getHours());
    }

    this._bsValue = value;
    this.bsValueChange.emit(value);
  }

  ngOnInit(): void {
    this.setConfig();
    this.updateSubscriptions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this._datepickerRef || !this._datepickerRef.instance) {
      return;
    }

    let shouldSetConfig = false;

    if (changes.minDate) {
      this._datepickerRef.instance.minDate = this.minDate;
      shouldSetConfig = true;
    }

    if (changes.maxDate) {
      this._datepickerRef.instance.maxDate = this.maxDate;
      shouldSetConfig = true;
    }

    if (changes.datesDisabled) {
      this._datepickerRef.instance.datesDisabled = this.datesDisabled;
      shouldSetConfig = true;
    }

    if (changes.datesEnabled) {
      this._datepickerRef.instance.datesEnabled = this.datesEnabled;
      this._datepickerRef.instance.value = this._bsValue;
      shouldSetConfig = true;
    }

    if (changes.isDisabled) {
      this._datepickerRef.instance.isDisabled = this.isDisabled;
      shouldSetConfig = true;
    }

    if (changes.dateCustomClasses) {
      this._datepickerRef.instance.dateCustomClasses = this.dateCustomClasses;
      shouldSetConfig = true;
    }

    if (changes.dateTooltipTexts) {
      this._datepickerRef.instance.dateTooltipTexts = this.dateTooltipTexts;
      shouldSetConfig = true;
    }

    if (shouldSetConfig) {
      this.setConfig();
    }
  }

  updateSubscriptions(): void {
    this._subs?.unsubscribe();
    this._subs = new Subscription();

    // if date changes from external source (model -> view)
    this._subs.add(
      this.bsValueChange.subscribe((value: Date) => {
        if (this._datepickerRef) {
          this._datepickerRef.instance.value = value;
        }
      })
    );

    // if date changes from picker (view -> model)
    if (this._datepickerRef) {
      this._subs.add(
        this._datepickerRef.instance.valueChange.subscribe((value: Date) => {
          this.bsValue = value;
        })
      );
    }
  }

  /**
   * Set config for datepicker
   */
  setConfig(): void {
    if (this._datepicker) {
      this._datepicker.hide();
    }

    this._config = Object.assign({}, this._config, this.bsConfig, {
      value: checkBsValue(this._bsValue, this.maxDate || this.bsConfig && this.bsConfig.maxDate),
      isDisabled: this.isDisabled,
      minDate: this.minDate || this.bsConfig && this.bsConfig.minDate,
      maxDate: this.maxDate || this.bsConfig && this.bsConfig.maxDate,
      dateCustomClasses: this.dateCustomClasses || this.bsConfig && this.bsConfig.dateCustomClasses,
      dateTooltipTexts: this.dateTooltipTexts || this.bsConfig && this.bsConfig.dateTooltipTexts,
      datesDisabled: this.datesDisabled || this.bsConfig && this.bsConfig.datesDisabled,
      datesEnabled: this.datesEnabled || this.bsConfig && this.bsConfig.datesEnabled
    });


    this._datepickerRef = this._datepicker
      .provide({ provide: BsDatepickerConfig, useValue: this._config })
      .attach(BsDatepickerInlineContainerComponent)
      .to(this._elementRef)
      .show();

    this.updateSubscriptions();
  }

  ngOnDestroy() {
    this._datepicker.dispose();
  }
}
