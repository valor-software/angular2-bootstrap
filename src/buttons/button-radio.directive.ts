import {
  Directive,
  ElementRef,
  HostBinding,
  forwardRef,
  HostListener,
  Input,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export const RADIO_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => ButtonRadioDirective),
  multi: true
};

/**
 * Create radio buttons or groups of buttons.
 * A value of a selected button is bound to a variable specified via ngModel.
 */
@Directive({selector: '[btnRadio]', providers: [RADIO_CONTROL_VALUE_ACCESSOR]})
export class ButtonRadioDirective implements ControlValueAccessor, OnInit {

  public onChange: any = Function.prototype;
  public onTouched: any = Function.prototype;

  /** Radio button value, will be set to `ngModel` */
  @Input() public btnRadio: any;
  /** If `true` — radio button can be unchecked */
  @Input() public uncheckable: boolean;
  /** Current value of radio component or group */
  @Input() public value: any;

  protected el: ElementRef;

  @HostBinding('class.active')
  public get isActive(): boolean {
    return this.btnRadio === this.value;
  }

  @HostListener('click')
  public onClick(): void {
    if (this.el.nativeElement.attributes.disabled) {
      return;
    }

    if (this.uncheckable && this.btnRadio === this.value) {
      this.value = undefined;
      this.onTouched();
      this.onChange(this.value);
      return;
    }

    if (this.btnRadio !== this.value) {
      this.value = this.btnRadio;
      this.onTouched();
      this.onChange(this.value);
      return;
    }
  }

  public constructor(el: ElementRef, private cdr: ChangeDetectorRef) {
    this.el = el;
  }

  public ngOnInit(): void {
    this.uncheckable = typeof this.uncheckable !== 'undefined';
  }

  public onBlur(): void {
    this.onTouched();
  }

  // ControlValueAccessor
  // model -> view
  public writeValue(value: any): void {
    this.value = value;
    this.cdr.markForCheck();
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
