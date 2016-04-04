import {
  Directive, OnInit, Input, HostBinding, HostListener, Self
} from 'angular2/core';
import {ControlValueAccessor, NgModel} from 'angular2/common';

@Directive({selector: '[btnCheckbox][ngModel]'})
export class ButtonCheckbox implements ControlValueAccessor, OnInit {
  public cd:NgModel;
  @Input() public btnCheckboxTrue:any;

  @Input() public btnCheckboxFalse:any;
  @HostBinding('class.active')
  public state:boolean = false;

  private value:any;

  // view -> model
  @HostListener('click')
  public onClick():void {
    this.toggle(!this.state);
    this.cd.viewToModelUpdate(this.value);
  }

  public constructor(@Self() cd:NgModel) {
    this.cd = cd;
    // hack !
    cd.valueAccessor = this;
  }

  public ngOnInit():any {
    this.toggle(this.trueValue === this.value);
  }

  private get trueValue():boolean {
    return typeof this.btnCheckboxTrue !== 'undefined'
      ? this.btnCheckboxTrue
      : true;
  }

  private get falseValue():boolean {
    return typeof this.btnCheckboxFalse !== 'undefined'
      ? this.btnCheckboxFalse
      : false;
  }

  public toggle(state:boolean):void {
    this.state = state;
    this.value = this.state ? this.trueValue : this.falseValue;
  }

  // ControlValueAccessor
  // model -> view
  public writeValue(value:any):void {
    this.state = this.trueValue === value;
    this.value = value;
  }

  protected onChange:any = () => {};
  protected onTouched:any = () => {};

  public registerOnChange(fn:(_:any) => {}):void {
    this.onChange = fn;
  }

  public registerOnTouched(fn:() => {}):void {
    this.onTouched = fn;
  }
}
