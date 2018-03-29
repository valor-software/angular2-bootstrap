import { Component } from '@angular/core';

@Component({
  selector: 'demo-datepicker-disabled',
  templateUrl: './disabled.html'
})
export class DemoDatepickerDisabledComponent {
  isDisabled = false;

  toggleDisabling(): void {
    this.isDisabled = !this.isDisabled;
  }
}
