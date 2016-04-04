import {
  Directive, ElementRef, Host, OnInit, Input, HostBinding, HostListener
} from 'angular2/core';
import {Dropdown} from './dropdown.directive';

@Directive({selector: '[dropdownToggle]'})
export class DropdownToggle implements OnInit {
  @HostBinding('class.disabled')
  @Input() public disabled:boolean = false;

  @HostBinding('class.dropdown-toggle')
  @HostBinding('attr.aria-haspopup')
  public addClass:boolean = true;

  public dropdown:Dropdown;
  public el:ElementRef;
  public constructor(@Host() dropdown:Dropdown, el:ElementRef) {
    this.dropdown = dropdown;
    this.el = el;
  }

  public ngOnInit():void {
    this.dropdown.dropDownToggle = this;
  }

  @HostBinding('attr.aria-expanded')
  public get isOpen():boolean {
    return this.dropdown.isOpen;
  }

  @HostListener('click', ['$event'])
  public toggleDropdown(event:MouseEvent):boolean {
    event.stopPropagation();

    if (!this.disabled) {
      this.dropdown.toggle();
    }
    return false;
  }
}
