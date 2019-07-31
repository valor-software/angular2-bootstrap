import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'demo-date-picker-custom-format',
  templateUrl: './custom-format.html'
})
export class DemoDatePickerCustomFormatComponent {

  form = new FormGroup({
    dateYMD: new FormControl(new Date()),
    dateFull: new FormControl(new Date()),
    dateMDY: new FormControl(new Date()),
    dateRange: new FormControl([new Date(), new Date()])
  });
}
